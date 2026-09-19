// lib/square/refund.ts
// Remboursement d'un abonnement Premium payé via Square (serveur uniquement).
//
// Notre ligne `subscriptions` ne stocke pas de payment_id. Le paiement est retrouvé :
//  1) achats actuels (paiement unique) : payments.list dans une fenêtre autour de la
//     date d'achat, en filtrant sur referenceId (= id du membre) et le montant ;
//  2) anciens abonnements Square : customer → factures → commande → tender.
// Puis on rembourse ce paiement (refunds.refundPayment).
import { randomUUID } from 'crypto'
import { square, SQUARE_LOCATION_ID, CURRENCY, toMinorUnits } from './client'

/** Part remboursée au client ; les 30 % restants couvrent les frais de service. */
export const REFUND_RATE = 0.7

export interface RefundResult {
  /** Montant effectivement remboursé au client, en dollars. */
  refundedUsd: number
  /** Identifiant du remboursement Square (null si aucun paiement Square à rembourser). */
  squareRefundId: string | null
}

/**
 * Rembourse `REFUND_RATE` du montant payé sur le paiement Square le plus récent
 * du customer. Lève une erreur si aucun paiement remboursable n'est trouvé côté
 * Square (l'appelant décide alors s'il annule la mutation en base).
 */
export async function refundSquareSubscription(input: {
  userId: string
  paidUsd: number
  /** Date d'achat (created_at de la ligne subscriptions). */
  subscribedAt: string
  /** Présent uniquement sur les anciens abonnements récurrents Square. */
  squareCustomerId?: string | null
}): Promise<RefundResult> {
  const { userId, paidUsd, subscribedAt, squareCustomerId } = input

  // 1) Retrouve le paiement Square à rembourser.
  const paymentId =
    (await findPaymentByReference(userId, paidUsd, subscribedAt)) ??
    (squareCustomerId ? await findLatestPaymentId(squareCustomerId) : null)
  if (!paymentId) {
    throw new Error('Paiement Square introuvable pour ce client.')
  }

  // 2) Rembourse 70 % du montant payé.
  const refundedUsd = Math.round(paidUsd * REFUND_RATE * 100) / 100
  const { refund } = await square.refunds.refundPayment({
    idempotencyKey: randomUUID(),
    paymentId,
    amountMoney: { amount: toMinorUnits(refundedUsd), currency: CURRENCY },
    reason: 'Remboursement abonnement Premium (70 %)',
  })

  return { refundedUsd, squareRefundId: refund?.id ?? null }
}

/** Paiement unique : cherche autour de la date d'achat un paiement COMPLETED du membre au bon montant. */
async function findPaymentByReference(
  userId: string,
  paidUsd: number,
  subscribedAt: string,
): Promise<string | null> {
  const center = Date.parse(subscribedAt)
  if (Number.isNaN(center)) return null
  const page = await square.payments.list({
    beginTime: new Date(center - 15 * 60 * 1000).toISOString(),
    endTime: new Date(center + 15 * 60 * 1000).toISOString(),
    locationId: SQUARE_LOCATION_ID,
    limit: 100,
  })
  const expected = toMinorUnits(paidUsd)
  let best: { id: string; gap: number } | null = null
  for await (const p of page) {
    if (p.referenceId !== userId || p.status !== 'COMPLETED' || !p.id) continue
    if (p.amountMoney?.amount !== expected) continue
    const gap = Math.abs(Date.parse(p.createdAt ?? '') - center)
    if (!best || gap < best.gap) best = { id: p.id, gap }
  }
  return best?.id ?? null
}

/** Remonte customer → facture payée → commande → tender pour obtenir un payment_id. */
async function findLatestPaymentId(customerId: string): Promise<string | null> {
  const { invoices } = await square.invoices.search({
    query: {
      filter: { locationIds: [SQUARE_LOCATION_ID], customerIds: [customerId] },
      sort: { field: 'INVOICE_SORT_DATE', order: 'DESC' },
    },
    limit: 25,
  })

  for (const invoice of invoices ?? []) {
    if (!invoice.orderId) continue
    const { order } = await square.orders.get({ orderId: invoice.orderId })
    const paymentId = order?.tenders?.find((t) => t.paymentId)?.paymentId
    if (paymentId) return paymentId
  }
  return null
}
