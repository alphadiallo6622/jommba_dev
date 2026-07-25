// POST /api/payments/subscribe
// Abonnement RÉCURRENT (Square Subscriptions) pour Premium.
// Flux : le front génère un token de carte -> ici on (1) crée/récupère le Customer
// Square, (2) enregistre la carte (card-on-file), (3) crée la Subscription sur la
// variation de plan choisie, (4) enregistre en base. Le renouvellement et les échecs
// sont ensuite gérés par le webhook (/api/webhooks/square).
//
// PCI SAQ-A : seul le token de carte transite, jamais le PAN.
import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { square, SQUARE_LOCATION_ID } from '@/lib/square/client'
import { getPlan } from '@/lib/square/plans'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  // 1) Authentification.
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  const { sourceId, planId } = (await req.json().catch(() => ({}))) as {
    sourceId?: string
    planId?: string
  }
  if (!sourceId) {
    return NextResponse.json({ error: 'Token de carte manquant' }, { status: 400 })
  }

  const plan = planId ? getPlan(planId) : undefined
  if (!plan) {
    return NextResponse.json({ error: 'Plan inconnu' }, { status: 400 })
  }

  // ID de la variation de plan dans le Catalog Square (créé par scripts/square-setup-plans.mjs).
  const planVariationId = process.env[plan.envKey]
  if (!planVariationId) {
    console.error('[payments/subscribe] variation de plan manquante pour', plan.envKey)
    return NextResponse.json(
      { error: 'Plan non configuré côté serveur. Contactez le support.' },
      { status: 500 },
    )
  }

  const admin = createAdminClient()

  try {
    // 2) Réutilise le Customer Square existant s'il y en a un, sinon en crée un.
    const { data: existing } = await admin
      .from('subscriptions')
      .select('square_customer_id')
      .eq('user_id', user.id)
      .maybeSingle()

    let customerId = existing?.square_customer_id ?? null
    if (!customerId) {
      const { customer } = await square.customers.create({
        idempotencyKey: randomUUID(),
        emailAddress: user.email ?? undefined,
        referenceId: user.id,
      })
      customerId = customer?.id ?? null
    }
    if (!customerId) {
      return NextResponse.json({ error: 'Création du client échouée.' }, { status: 500 })
    }

    // 3) Enregistre la carte sur le customer (card-on-file) pour les prélèvements récurrents.
    const { card } = await square.cards.create({
      idempotencyKey: randomUUID(),
      sourceId,
      card: { customerId },
    })
    const cardId = card?.id
    if (!cardId) {
      return NextResponse.json({ error: 'Enregistrement de la carte échoué.' }, { status: 402 })
    }

    // 4) Crée l'abonnement récurrent sur la variation de plan choisie.
    const { subscription } = await square.subscriptions.create({
      idempotencyKey: randomUUID(),
      locationId: SQUARE_LOCATION_ID,
      planVariationId,
      customerId,
      cardId,
    })
    if (!subscription?.id) {
      return NextResponse.json({ error: "Création de l'abonnement échouée." }, { status: 402 })
    }

    // 5) Enregistre en base. Premium activé ici ; le webhook confirmera/renouvellera.
    const periodEnd = new Date()
    periodEnd.setMonth(periodEnd.getMonth() + plan.durationMonths)

    const { error: subErr } = await admin
      .from('subscriptions')
      .upsert(
        {
          user_id: user.id,
          plan: 'premium',
          status: 'active',
          payment_method: 'square',
          price_usd: plan.totalPriceUsd,
          duration_months: plan.durationMonths,
          current_period_end: periodEnd.toISOString(),
          square_subscription_id: subscription.id,
          square_customer_id: customerId,
          square_card_id: cardId,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' },
      )
    if (subErr) {
      console.error('[payments/subscribe] upsert subscription échoué', subscription.id, subErr)
      return NextResponse.json(
        { error: 'Abonnement créé mais enregistrement échoué. Contactez le support.' },
        { status: 500 },
      )
    }

    // Marque le profil comme Premium (source lue par l'app pour débloquer les fonctionnalités).
    await admin.from('profiles').update({ is_premium: true }).eq('user_id', user.id)

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[payments/subscribe] Square error', err)
    return NextResponse.json({ error: "L'abonnement a échoué." }, { status: 402 })
  }
}
