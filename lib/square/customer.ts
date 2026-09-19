// lib/square/customer.ts
// Rattache chaque paiement à un client Square (serveur uniquement) : sans
// `customerId`, le reçu Square n'affiche aucun « Payé par ».
//
// Un seul client par membre, retrouvé via `referenceId` = id Supabase. Ne doit
// jamais bloquer un paiement : en cas d'échec on renvoie `undefined` et le débit
// se fait sans client.
import { randomUUID } from 'crypto'
import { square } from './client'

export async function getOrCreateSquareCustomerId(input: {
  userId: string
  email?: string | null
  firstName?: string | null
  lastName?: string | null
}): Promise<string | undefined> {
  const { userId, email, firstName, lastName } = input
  try {
    const { customers } = await square.customers.search({
      query: { filter: { referenceId: { exact: userId } } },
      limit: BigInt(1),
    })
    const existing = customers?.[0]?.id
    if (existing) return existing

    const { customer } = await square.customers.create({
      idempotencyKey: randomUUID(),
      givenName: firstName?.trim() || undefined,
      familyName: lastName?.trim() || undefined,
      emailAddress: email || undefined,
      referenceId: userId,
    })
    return customer?.id
  } catch (err) {
    console.error('[square/customer] création client échouée', err)
    return undefined
  }
}
