// POST /api/webhooks/sayele
// Reçoit les notifications Sayele Gate (Mobile Money) et active / échoue le
// paiement. URL configurée dans le tableau de bord Sayele :
// https://jommba.com/api/webhooks/sayele (voir WH_URL_NOTIFICATION).
//
// Événements : `transaction.settled` et `transaction.failed`.
//
// Sécurité : on vérifie la signature HMAC sur le corps BRUT avant tout
// traitement (WEBHOOK_SECRET_KEY, surchargée en admin). Signature invalide ⇒ 401.
// Indépendant du webhook Square (app/api/webhooks/square) : aucun code partagé.
//
// Robustesse : l'activation (lib/sayele/activate) est idempotente et le polling
// de statut sert de filet si un événement est manqué.
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getSayeleServerConfig } from '@/lib/sayele/config'
import {
  verifyWebhookSignature,
  readSignatureHeader,
  normalizeStatus,
} from '@/lib/sayele/client'
import { activatePremiumFromMobileMoney } from '@/lib/sayele/activate'
import { createNotification } from '@/lib/push/notify'

export const dynamic = 'force-dynamic'

type SayeleEvent = {
  type?: string
  event?: string
  data?: Record<string, unknown>
  transaction?: Record<string, unknown>
  [k: string]: unknown
}

/** Récupère un champ string imbriqué quel que soit l'emplacement. */
function pick(obj: Record<string, unknown> | undefined, keys: string[]): string | null {
  if (!obj) return null
  for (const k of keys) {
    const v = obj[k]
    if (typeof v === 'string' && v) return v
    if (typeof v === 'number') return String(v)
  }
  return null
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text()
  const config = await getSayeleServerConfig()

  if (!config.webhookSecret) {
    console.error('[webhooks/sayele] WEBHOOK_SECRET_KEY manquant')
    return NextResponse.json({ error: 'Config manquante' }, { status: 500 })
  }

  const signature = readSignatureHeader(req.headers)
  if (!verifyWebhookSignature(config.webhookSecret, rawBody, signature)) {
    // Signature absente ou invalide : on rejette. L'activation reste couverte
    // par la réconciliation côté polling (/api/payments/mobile-money/status).
    console.warn('[webhooks/sayele] signature invalide — événement rejeté')
    return NextResponse.json({ error: 'Signature invalide' }, { status: 401 })
  }

  let event: SayeleEvent
  try {
    event = JSON.parse(rawBody) as SayeleEvent
  } catch {
    return NextResponse.json({ error: 'Body invalide' }, { status: 400 })
  }

  // Normalise la forme de l'événement (racine, data, ou transaction).
  const type = (event.type || event.event || '').toLowerCase()
  const tx =
    (event.data?.transaction as Record<string, unknown> | undefined) ??
    (event.data as Record<string, unknown> | undefined) ??
    (event.transaction as Record<string, unknown> | undefined) ??
    event

  // Rapprochement : par notre référence (customerReference) en priorité, sinon
  // par l'id de transaction Sayele.
  const reference = pick(tx, ['customerReference', 'customer_reference', 'reference'])
  const providerTxId = pick(tx, ['id', 'transactionId', 'transaction_id'])
  const statusRaw = pick(tx, ['status', 'state']) ?? (type.includes('settled') ? 'settled' : type.includes('failed') ? 'failed' : '')
  const status = normalizeStatus(statusRaw)

  const admin = createAdminClient()

  // Localise la ligne de suivi.
  let paymentId: string | null = null
  let userId: string | null = null
  if (reference) {
    const { data } = await admin
      .from('mobile_money_payments')
      .select('id, user_id')
      .eq('id', reference)
      .maybeSingle()
    if (data) {
      paymentId = data.id
      userId = data.user_id
    }
  }
  if (!paymentId && providerTxId) {
    const { data } = await admin
      .from('mobile_money_payments')
      .select('id, user_id')
      .eq('provider_tx_id', providerTxId)
      .maybeSingle()
    if (data) {
      paymentId = data.id
      userId = data.user_id
    }
  }

  // Transaction inconnue : on répond 200 pour éviter des relances infinies.
  if (!paymentId) {
    console.warn('[webhooks/sayele] transaction non reconnue', { reference, providerTxId, type })
    return NextResponse.json({ received: true })
  }

  try {
    if (status === 'settled' || type.includes('settled')) {
      await activatePremiumFromMobileMoney(paymentId)
    } else if (status === 'failed' || status === 'expired' || type.includes('failed')) {
      const { data: updated } = await admin
        .from('mobile_money_payments')
        .update({ status: status === 'expired' ? 'expired' : 'failed', updated_at: new Date().toISOString() })
        .eq('id', paymentId)
        .in('status', ['pending', 'processing'])
        .select('id')
        .maybeSingle()
      // Ne notifie l'échec qu'au premier passage (évite les doublons).
      if (updated && userId) {
        await createNotification({
          userId,
          type: 'premium',
          title: 'Paiement échoué 💳',
          body: "Ton paiement Mobile Money n'a pas abouti. Réessaie ou change d'opérateur.",
          i18n: 'paymentFailed',
        })
      }
    }
  } catch (err) {
    console.error('[webhooks/sayele] traitement échoué', type, err)
    // 500 ⇒ Sayele retentera la livraison.
    return NextResponse.json({ error: 'Traitement échoué' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
