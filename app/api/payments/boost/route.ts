// POST /api/payments/boost
// Paiement UNIQUE (Square Payments) pour un Boost 24h à 2,5 $.
// Flux : le front génère un token de carte (Web Payments SDK) -> l'envoie ici ->
// on débite via Square -> on crée le boost en base.
//
// PCI SAQ-A : le numéro de carte ne transite jamais par ce serveur, seulement le token.
import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { square, SQUARE_LOCATION_ID, CURRENCY, toMinorUnits } from '@/lib/square/client'
import { getBoost } from '@/lib/square/plans'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  // 1) Authentification de l'utilisateur.
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  // 2) Token de carte + type de boost fournis par le front.
  const { sourceId, boostId } = (await req.json().catch(() => ({}))) as {
    sourceId?: string
    boostId?: string
  }
  if (!sourceId) {
    return NextResponse.json({ error: 'Token de carte manquant' }, { status: 400 })
  }
  // Prix et durée déterminés côté serveur d'après le boostId (jamais depuis le client).
  const boost = getBoost(boostId ?? '24h')
  if (!boost) {
    return NextResponse.json({ error: 'Boost inconnu' }, { status: 400 })
  }

  // 3) Débit via Square.
  try {
    const { payment } = await square.payments.create({
      sourceId,
      idempotencyKey: randomUUID(),
      locationId: SQUARE_LOCATION_ID,
      amountMoney: { amount: toMinorUnits(boost.priceUsd), currency: CURRENCY },
      referenceId: `boost:${user.id}`,
      note: `Jommba — Boost ${boost.id}`,
    })

    if (payment?.status !== 'COMPLETED') {
      return NextResponse.json(
        { error: 'Paiement non finalisé', status: payment?.status },
        { status: 402 },
      )
    }

    // 4) Active le boost (admin client : contourne le RLS pour écrire côté serveur).
    const admin = createAdminClient()
    const expiresAt = new Date(Date.now() + boost.durationHours * 60 * 60 * 1000)
    const { error } = await admin.from('boosts').insert({
      user_id: user.id,
      expires_at: expiresAt.toISOString(),
      square_payment_id: payment.id ?? null,
      amount_usd: boost.priceUsd,
    })
    if (error) {
      // Le paiement a réussi mais l'insert a échoué : à surveiller (remboursement manuel possible).
      console.error('[payments/boost] insert boost échoué après paiement', payment.id, error)
      return NextResponse.json(
        { error: 'Paiement encaissé mais activation échouée. Contactez le support.', paymentId: payment.id },
        { status: 500 },
      )
    }

    return NextResponse.json({ ok: true, expiresAt: expiresAt.toISOString() })
  } catch (err) {
    console.error('[payments/boost] Square error', err)
    return NextResponse.json({ error: 'Le paiement a échoué.' }, { status: 402 })
  }
}
