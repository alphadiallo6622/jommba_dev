// POST /api/payments/mobile-money
// Initie un achat Premium par Mobile Money (Sayele Gate) — Guinée / GNF.
//
// Moyen de paiement ADDITIONNEL, indépendant de Square : aucune route ni logique
// Square n'est touchée. Le flux est asynchrone (contrairement au débit carte
// synchrone de /api/payments/subscribe) :
//   1. on calcule le prix côté serveur (jamais depuis le client) + code promo ;
//   2. on convertit le montant USD en GNF (taux réglé en admin) ;
//   3. on crée une ligne `mobile_money_payments` (état `pending`) ;
//   4. on demande le pay-in à Sayele ; l'utilisateur valide sur son téléphone ;
//   5. l'activation Premium a lieu à la confirmation (webhook /api/webhooks/sayele
//      ou réconciliation via /api/payments/mobile-money/status), PAS ici.
//
// Le code promo n'est VALIDÉ ici que pour fixer le montant ; il n'est consommé
// qu'à l'activation réelle (lib/sayele/activate), pour ne pas gaspiller un usage
// si le paiement n'aboutit pas.
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { computePlanPrices, isPlanId } from '@/lib/pricing'
import { getPlatformSettings } from '@/lib/admin/queries'
import { validatePromoCode } from '@/lib/promo'
import { paymentError } from '@/lib/payment-errors'
import {
  getSayeleServerConfig,
  isSayeleOperator,
  normalizeGuineaPhone,
  usdToGnfMinor,
} from '@/lib/sayele/config'
import { createTransaction, SayeleApiError } from '@/lib/sayele/client'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const { planId, operator, phone, promoCode, locale } = (await req
    .json()
    .catch(() => ({}))) as {
    planId?: string
    operator?: string
    phone?: string
    promoCode?: string
    locale?: string
  }

  // 1) Authentification.
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: paymentError('notAuthenticated', locale) }, { status: 401 })
  }

  // 2) Validation des entrées.
  if (!planId || !isPlanId(planId)) {
    return NextResponse.json({ error: 'Plan inconnu' }, { status: 400 })
  }
  if (!operator || !isSayeleOperator(operator)) {
    return NextResponse.json({ error: paymentError('invalidOperator', locale) }, { status: 400 })
  }
  const normalizedPhone = normalizeGuineaPhone(phone ?? '')
  if (!normalizedPhone) {
    return NextResponse.json({ error: paymentError('invalidPhone', locale) }, { status: 400 })
  }

  // 3) Config Sayele (surcharge admin + repli .env).
  const config = await getSayeleServerConfig()
  if (!config.enabled) {
    return NextResponse.json({ error: paymentError('mobileMoneyUnavailable', locale) }, { status: 503 })
  }
  if (!config.secretKey || config.usdToGnf <= 0) {
    console.error('[payments/mobile-money] config incomplète (secret ou taux manquant)')
    return NextResponse.json({ error: paymentError('mobileMoneyUnavailable', locale) }, { status: 503 })
  }

  const admin = createAdminClient()

  // 4) Prix déterminé côté serveur (USD) + code promo revalidé.
  const { pricing } = await getPlatformSettings()
  const basePrice = computePlanPrices(pricing.monthlyPrice)[planId]

  let finalUsd = basePrice
  let promoId: string | null = null
  let appliedPromoCode: string | null = null
  if (promoCode?.trim()) {
    const result = await validatePromoCode(admin, promoCode, planId, basePrice)
    if (!result.valid) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }
    finalUsd = result.discountedPrice
    promoId = result.id
    appliedPromoCode = promoCode.trim().toUpperCase()
  }

  // 5) Conversion GNF (devise sans sous-unité : minor == major).
  const amountMinor = usdToGnfMinor(finalUsd, config.usdToGnf)
  if (amountMinor <= 0) {
    return NextResponse.json({ error: paymentError('mobileMoneyInitFailed', locale) }, { status: 400 })
  }

  // 6) Ligne de suivi (état pending) AVANT l'appel distant : la référence sert au
  //    rapprochement du webhook et au polling.
  const { data: inserted, error: insErr } = await admin
    .from('mobile_money_payments')
    .insert({
      user_id: user.id,
      provider: 'sayele',
      kind: 'premium',
      plan_id: planId,
      operator,
      phone: normalizedPhone,
      amount_usd: finalUsd,
      amount_minor: amountMinor,
      currency: config.currency,
      promo_id: promoId,
      promo_code: appliedPromoCode,
      status: 'pending',
      locale: locale ?? null,
    })
    .select('id')
    .single()

  if (insErr || !inserted) {
    console.error('[payments/mobile-money] insert suivi échoué', insErr)
    return NextResponse.json({ error: paymentError('mobileMoneyInitFailed', locale) }, { status: 500 })
  }

  const reference = inserted.id

  // 7) Demande de pay-in à Sayele.
  try {
    const tx = await createTransaction({
      baseUrl: config.baseUrl,
      secretKey: config.secretKey,
      idempotencyKey: reference,
      amountMinor,
      currency: config.currency,
      country: config.country,
      operator,
      phone: normalizedPhone,
      reference,
    })

    await admin
      .from('mobile_money_payments')
      .update({
        provider_tx_id: tx.id,
        reference,
        // On ne force pas 'settled'/'failed' ici : l'activation est pilotée par
        // le webhook / le polling. On ne reflète que 'processing' si Sayele l'a
        // déjà renvoyé, sinon on reste 'pending'.
        status: tx.status === 'processing' ? 'processing' : 'pending',
        raw: tx.raw as never,
        updated_at: new Date().toISOString(),
      })
      .eq('id', reference)

    // Cas rare d'un paiement confirmé immédiatement : on active sans attendre.
    if (tx.status === 'settled') {
      const { activatePremiumFromMobileMoney } = await import('@/lib/sayele/activate')
      await activatePremiumFromMobileMoney(reference)
    }

    return NextResponse.json({
      ok: true,
      paymentId: reference,
      status: tx.status,
      amountGnf: amountMinor,
    })
  } catch (err) {
    const detail = err instanceof SayeleApiError ? err.message : undefined
    console.error('[payments/mobile-money] création transaction échouée', detail ?? err)
    // On conserve le détail de l'échec dans `raw` pour diagnostic ultérieur
    // (erreur de validation de l'API, etc.) sans dépendre des logs.
    const failureRaw =
      err instanceof SayeleApiError
        ? { error: err.message, status: err.status, body: err.body }
        : { error: String(err) }

    // IMPORTANT : une erreur 5xx de Sayele N'EST PAS un échec définitif. Sayele
    // crée la transaction (état `pending`, référence = notre id) puis peut
    // répondre 503 si le rail opérateur n'est pas immédiatement disponible. La
    // ligne doit donc rester `pending` pour qu'un webhook tardif (rapproché par
    // `customer_reference`) ou une réconciliation puisse encore activer Premium.
    // Seule une erreur client (4xx = requête invalide, aucune transaction créée)
    // est marquée `failed`.
    const sayeleServerError = err instanceof SayeleApiError && err.status >= 500
    await admin
      .from('mobile_money_payments')
      .update({
        status: sayeleServerError ? 'pending' : 'failed',
        raw: failureRaw as never,
        updated_at: new Date().toISOString(),
      })
      .eq('id', reference)
    return NextResponse.json(
      { error: paymentError('mobileMoneyInitFailed', locale), detail },
      { status: 502 },
    )
  }
}
