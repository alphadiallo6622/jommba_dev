// POST /api/webhooks/square
// Reçoit les notifications d'événements Square et met à jour la base.
// URL configurée dans le dashboard Square : https://jommba.com/api/webhooks/square
//
// LÉGATAIRE : Premium est désormais facturé en paiement unique (voir
// app/api/payments/subscribe), plus de nouvelles souscriptions Square ne sont
// créées. Ce webhook reste actif uniquement pour les abonnements Square créés
// avant la bascule, qui continuent de se renouveler normalement jusqu'à leur
// annulation — ne pas supprimer tant que ces abonnements existent encore.
//
// Sécurité : on vérifie la signature HMAC (WebhooksHelper.verifySignature) sur le
// body BRUT avant de traiter quoi que ce soit. Un événement dont la signature est
// invalide est rejeté (401).
import { NextRequest, NextResponse } from 'next/server'
import { WebhooksHelper } from 'square'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

const SIGNATURE_KEY = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY
// L'URL doit correspondre EXACTEMENT à celle configurée dans Square (sinon la signature échoue).
const NOTIFICATION_URL =
  process.env.SQUARE_WEBHOOK_URL ?? 'https://jommba.com/api/webhooks/square'

export async function POST(req: NextRequest) {
  const rawBody = await req.text()
  const signature = req.headers.get('x-square-hmacsha256-signature')

  if (!SIGNATURE_KEY) {
    console.error('[webhooks/square] SQUARE_WEBHOOK_SIGNATURE_KEY manquant')
    return NextResponse.json({ error: 'Config manquante' }, { status: 500 })
  }
  if (!signature) {
    return NextResponse.json({ error: 'Signature manquante' }, { status: 401 })
  }

  const valid = await WebhooksHelper.verifySignature({
    requestBody: rawBody,
    signatureHeader: signature,
    signatureKey: SIGNATURE_KEY,
    notificationUrl: NOTIFICATION_URL,
  })
  if (!valid) {
    return NextResponse.json({ error: 'Signature invalide' }, { status: 401 })
  }

  let event: SquareEvent
  try {
    event = JSON.parse(rawBody) as SquareEvent
  } catch {
    return NextResponse.json({ error: 'Body invalide' }, { status: 400 })
  }

  const admin = createAdminClient()

  try {
    switch (event.type) {
      // Renouvellement / mise à jour de l'abonnement : reflète le statut Square en base.
      case 'subscription.updated': {
        const sub = event.data?.object?.subscription
        if (sub?.id) {
          // ACTIVE -> premium actif ; CANCELED/DEACTIVATED -> on coupe le premium.
          const active = sub.status === 'ACTIVE'
          const { data: row } = await admin
            .from('subscriptions')
            .update({
              status: active ? 'active' : 'cancelled',
              updated_at: new Date().toISOString(),
            })
            .eq('square_subscription_id', sub.id)
            .select('user_id')
            .maybeSingle()

          if (row?.user_id) {
            // Historique multi-lignes : on ne coupe le Premium que si le membre n'a
            // plus AUCUN abonnement actif (un événement tardif sur un ancien cycle
            // ne doit pas désactiver un abonnement plus récent).
            let isPremium = active
            if (!active) {
              const { count } = await admin
                .from('subscriptions')
                .select('id', { count: 'exact', head: true })
                .eq('user_id', row.user_id)
                .eq('status', 'active')
              isPremium = (count ?? 0) > 0
            }
            await admin.from('profiles').update({ is_premium: isPremium }).eq('user_id', row.user_id)
          }
        }
        break
      }

      // Facture payée : on prolonge la période Premium (renouvellement réussi).
      case 'invoice.payment_made': {
        const invoice = event.data?.object?.invoice
        const subId = invoice?.subscriptionId
        if (subId) {
          const { data: row } = await admin
            .from('subscriptions')
            .select('user_id, duration_months, refunded_at')
            .eq('square_subscription_id', subId)
            .maybeSingle()
          // Un cycle remboursé ne doit jamais être réactivé par une facture tardive.
          if (row?.user_id && !row.refunded_at) {
            const end = new Date()
            end.setMonth(end.getMonth() + (row.duration_months ?? 1))
            await admin
              .from('subscriptions')
              .update({
                status: 'active',
                current_period_end: end.toISOString(),
                updated_at: new Date().toISOString(),
              })
              .eq('square_subscription_id', subId)
            await admin.from('profiles').update({ is_premium: true }).eq('user_id', row.user_id)
          }
        }
        break
      }

      default:
        // Événement non traité : on répond 200 pour que Square ne réessaie pas indéfiniment.
        break
    }
  } catch (err) {
    console.error('[webhooks/square] traitement échoué', event.type, err)
    // 500 -> Square retentera la livraison.
    return NextResponse.json({ error: 'Traitement échoué' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}

// Forme minimale des événements Square qu'on traite (le payload complet est plus riche).
type SquareEvent = {
  type: string
  data?: {
    object?: {
      subscription?: { id?: string; status?: string }
      invoice?: { subscriptionId?: string }
    }
  }
}
