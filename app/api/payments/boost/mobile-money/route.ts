// POST /api/payments/boost/mobile-money
// Initie l'achat d'un Boost par Mobile Money (Sayele Gate) — Guinée / GNF.
//
// Pendant pour le Boost de /api/payments/mobile-money (qui, lui, finance un
// Premium). Même flux asynchrone, même infra Sayele ; seule la nature de l'achat
// change (kind = 'boost'). Le prix est fixé côté serveur d'après le boostId
// (paramètres admin : platform_settings.boost_pricing), jamais depuis le client.
// L'activation (création du boost) a lieu à la confirmation (webhook
// /api/webhooks/sayele ou réconciliation /api/payments/mobile-money/status).
// Aucune route ni logique Square n'est touchée.
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getBoost } from '@/lib/square/plans'
import { getPlatformSettings } from '@/lib/admin/queries'
import { paymentError } from '@/lib/payment-errors'
import {
  getSayeleServerConfig,
  isSayeleOperator,
  normalizeGuineaPhone,
  usdToGnfMinor,
  SAYELE_MIN_AMOUNT_MINOR,
} from '@/lib/sayele/config'
import { createTransaction, SayeleApiError } from '@/lib/sayele/client'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const { boostId, operator, phone, locale } = (await req.json().catch(() => ({}))) as {
    boostId?: string
    operator?: string
    phone?: string
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
  const boost = getBoost(boostId ?? '')
  if (!boost) {
    return NextResponse.json({ error: 'Boost inconnu' }, { status: 400 })
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
    console.error('[payments/boost/mobile-money] config incomplète (secret ou taux manquant)')
    return NextResponse.json({ error: paymentError('mobileMoneyUnavailable', locale) }, { status: 503 })
  }

  const admin = createAdminClient()

  // 4) Prix déterminé côté serveur (USD) d'après les paramètres admin.
  const { boostPricing } = await getPlatformSettings()
  const priceUsd = boostPricing[boost.id]
  if (priceUsd == null || priceUsd <= 0) {
    return NextResponse.json({ error: paymentError('mobileMoneyInitFailed', locale) }, { status: 400 })
  }

  // 5) Conversion GNF + garde-fou minimum opérateur.
  const amountMinor = usdToGnfMinor(priceUsd, config.usdToGnf)
  if (amountMinor <= 0) {
    return NextResponse.json({ error: paymentError('mobileMoneyInitFailed', locale) }, { status: 400 })
  }
  if (amountMinor < SAYELE_MIN_AMOUNT_MINOR) {
    return NextResponse.json({ error: paymentError('mobileMoneyBelowMinimum', locale) }, { status: 400 })
  }

  // 6) Ligne de suivi (kind = 'boost', plan_id = id du boost) AVANT l'appel distant.
  const { data: inserted, error: insErr } = await admin
    .from('mobile_money_payments')
    .insert({
      user_id: user.id,
      provider: 'sayele',
      kind: 'boost',
      plan_id: boost.id,
      operator,
      phone: normalizedPhone,
      amount_usd: priceUsd,
      amount_minor: amountMinor,
      currency: config.currency,
      status: 'pending',
      locale: locale ?? null,
    })
    .select('id')
    .single()

  if (insErr || !inserted) {
    console.error('[payments/boost/mobile-money] insert suivi échoué', insErr)
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
        status: tx.status === 'processing' ? 'processing' : 'pending',
        raw: tx.raw as never,
        updated_at: new Date().toISOString(),
      })
      .eq('id', reference)

    // Paiement confirmé immédiatement (rare) : on active sans attendre.
    if (tx.status === 'settled') {
      const { activateBoostFromMobileMoney } = await import('@/lib/sayele/activate-boost')
      await activateBoostFromMobileMoney(reference)
    }

    return NextResponse.json({
      ok: true,
      paymentId: reference,
      status: tx.status,
      amountGnf: amountMinor,
    })
  } catch (err) {
    const detail = err instanceof SayeleApiError ? err.message : undefined
    console.error('[payments/boost/mobile-money] création transaction échouée', detail ?? err)
    const failureRaw =
      err instanceof SayeleApiError
        ? { error: err.message, status: err.status, body: err.body }
        : { error: String(err) }
    // Un 5xx Sayele n'est pas définitif (transaction possiblement créée en
    // pending) : on garde la ligne recouvrable. Seul un 4xx est marqué failed.
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
