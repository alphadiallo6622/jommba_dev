// lib/square/refund.ts
// Remboursement d'un abonnement Premium payé via Square (serveur uniquement).
//
// Square ne stocke pas de payment_id sur notre ligne `subscriptions` : on remonte
// donc la chaîne à partir du customer Square rattaché à l'abonnement :
//   customer → factures (invoices.search) → commande (orders.get) → tender → payment_id
// puis on rembourse le paiement le plus récent (refunds.refundPayment).
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
  squareCustomerId: string
  paidUsd: number
}): Promise<RefundResult> {
  const { squareCustomerId, paidUsd } = input

  // 1) Retrouve la commande payée la plus récente de ce customer via ses factures.
  const paymentId = await findLatestPaymentId(squareCustomerId)
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
