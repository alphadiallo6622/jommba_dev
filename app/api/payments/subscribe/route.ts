// POST /api/payments/subscribe
// Achat Premium — paiement UNIQUE (Square Payments API), prix dynamique.
// Flux : le front génère un token de carte -> on détermine le prix côté serveur
// d'après le plan (lib/pricing.ts, jamais depuis le client), on applique/re-valide
// un éventuel code promo, on débite via Square, puis on enregistre la période
// Premium en base. Le renouvellement n'est plus automatique : le membre repaie à
// l'échéance ; app/api/cron/premium-expiry coupe l'accès une fois la période finie.
//
// PCI SAQ-A : seul le token de carte transite, jamais le PAN.
import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { square, SQUARE_LOCATION_ID, CURRENCY, toMinorUnits } from '@/lib/square/client'
import { getPlanDurationDays } from '@/lib/square/plans'
import { computePlanPrices, isPlanId } from '@/lib/pricing'
import { validatePromoCode, redeemPromoCode } from '@/lib/promo'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  // 1) Authentification.
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  const { sourceId, planId, promoCode } = (await req.json().catch(() => ({}))) as {
    sourceId?: string
    planId?: string
    promoCode?: string
  }
  if (!sourceId) {
    return NextResponse.json({ error: 'Token de carte manquant' }, { status: 400 })
  }
  if (!planId || !isPlanId(planId)) {
    return NextResponse.json({ error: 'Plan inconnu' }, { status: 400 })
  }
  const durationDays = getPlanDurationDays(planId)!

  const admin = createAdminClient()

  // 2) Prix déterminé côté serveur d'après le plan (jamais depuis le client).
  const basePrice = computePlanPrices()[planId]

  // 3) Code promo optionnel : re-validation complète côté serveur.
  let finalPrice = basePrice
  let appliedPromoId: string | null = null
  if (promoCode?.trim()) {
    const result = await validatePromoCode(admin, promoCode, planId, basePrice)
    if (!result.valid) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }
    finalPrice = result.discountedPrice
    appliedPromoId = result.id
  }

  // 4) Débit via Square (paiement unique, montant libre).
  try {
    const { payment } = await square.payments.create({
      sourceId,
      idempotencyKey: randomUUID(),
      locationId: SQUARE_LOCATION_ID,
      amountMoney: { amount: toMinorUnits(finalPrice), currency: CURRENCY },
      // referenceId limité à 40 caractères par Square : un UUID (36) tient seul.
      referenceId: user.id,
      note: `Jommba — Premium ${planId}`,
    })

    if (payment?.status !== 'COMPLETED') {
      return NextResponse.json(
        { error: 'Paiement non finalisé', status: payment?.status },
        { status: 402 },
      )
    }

    // 5) Consomme le code promo (incrément atomique, protégé contre la concurrence).
    if (appliedPromoId) {
      await redeemPromoCode(admin, appliedPromoId)
    }

    // 6) Enregistre en base. Historique multi-lignes : chaque achat est une
    //    NOUVELLE ligne (on préserve les cycles précédents, remboursements inclus).
    const periodEnd = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000)

    const { error: subErr } = await admin
      .from('subscriptions')
      .insert({
        user_id: user.id,
        plan: 'premium',
        status: 'active',
        payment_method: 'square',
        price_usd: finalPrice,
        duration_months: Math.round((durationDays / 30) * 100) / 100,
        current_period_end: periodEnd.toISOString(),
        square_subscription_id: null,
        square_customer_id: null,
        square_card_id: null,
        updated_at: new Date().toISOString(),
      })
    if (subErr) {
      // Le paiement a réussi mais l'insert a échoué : à surveiller (remboursement manuel possible).
      console.error('[payments/subscribe] insert subscription échoué après paiement', payment.id, subErr)
      return NextResponse.json(
        { error: 'Paiement encaissé mais activation échouée. Contactez le support.', paymentId: payment.id },
        { status: 500 },
      )
    }

    // Marque le profil comme Premium (source lue par l'app pour débloquer les fonctionnalités).
    await admin.from('profiles').update({ is_premium: true }).eq('user_id', user.id)

    return NextResponse.json({ ok: true, expiresAt: periodEnd.toISOString() })
  } catch (err) {
    const detail = extractSquareError(err)
    console.error('[payments/subscribe] Square error', detail ?? err)
    return NextResponse.json({ error: "L'abonnement a échoué.", detail }, { status: 402 })
  }
}

function extractSquareError(err: unknown): string | undefined {
  if (err && typeof err === 'object') {
    const e = err as { errors?: Array<{ code?: string; detail?: string }>; body?: unknown; message?: string }
    if (Array.isArray(e.errors) && e.errors.length) {
      return e.errors.map((x) => x.detail ?? x.code).filter(Boolean).join(' | ')
    }
    if (typeof e.message === 'string') return e.message
  }
  return undefined
}
