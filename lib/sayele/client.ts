// Adaptateur API Sayele Gate (Mobile Money) — SERVEUR UNIQUEMENT.
//
// ⚠️ CONTRAT « best-effort » : la doc publique (https://gate.sayele.co/docs) ne
// détaille pas entièrement le corps du pay-in ni la signature des webhooks. Tout
// ce qui est incertain est ISOLÉ ici et commenté « HYPOTHÈSE », pour n'avoir
// qu'UN seul fichier à ajuster après un test en sandbox. Les faits confirmés :
//   • Base URL : https://api.gate.sayele.co
//   • Auth : header `Authorization: Bearer sk_live_…` (secret côté serveur)
//   • Pay-in : POST /v1/transactions ; lecture : GET /v1/transactions/:id
//   • Montants en unités mineures entières (GNF : minor == major)
//   • Statuts : pending → processing → settled, ou → failed
//   • Guinée : country=GN, currency=GNF, opérateurs orange / mtn
//   • Secret webhook au format `whsec_…` (convention type Stripe)
//   • CONFIRMÉ (via erreur de validation de l'API) : le champ `operator` attend
//     l'une de ces valeurs exactes : visa, mastercard, orange_money, mtn, wave,
//     moov, kulu, soutra_money, paycard, akiba. Nos clés internes 'orange'/'mtn'
//     sont donc traduites vers la valeur « wire » attendue (orange → orange_money).
import { createHmac, timingSafeEqual } from 'crypto'

/**
 * Traduit notre code opérateur interne ('orange' | 'mtn') vers la valeur exacte
 * attendue par l'API Sayele. 'mtn' est identique ; 'orange' devient 'orange_money'.
 * Les valeurs déjà au format Sayele sont laissées telles quelles.
 */
const OPERATOR_WIRE: Record<string, string> = {
  orange: 'orange_money',
  orange_money: 'orange_money',
  mtn: 'mtn',
}

function toSayeleOperator(operator: string): string {
  const key = operator.trim().toLowerCase()
  return OPERATOR_WIRE[key] ?? key
}

export type SayeleStatus = 'pending' | 'processing' | 'settled' | 'failed' | 'expired'

export interface CreateTransactionInput {
  baseUrl: string
  secretKey: string
  idempotencyKey: string
  amountMinor: number
  currency: string
  country: string
  operator: string
  /** Numéro payeur au format international (+224…). */
  phone: string
  /** Référence interne (customerReference) pour le rapprochement webhook. */
  reference: string
}

export interface SayeleTransaction {
  id: string | null
  status: SayeleStatus
  raw: unknown
}

const REQUEST_TIMEOUT_MS = 20_000

function authHeaders(secretKey: string): Record<string, string> {
  return {
    Authorization: `Bearer ${secretKey}`,
    'Content-Type': 'application/json',
    Accept: 'application/json',
  }
}

async function fetchWithTimeout(url: string, init: RequestInit): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
  try {
    return await fetch(url, { ...init, signal: controller.signal })
  } finally {
    clearTimeout(timer)
  }
}

/** Normalise un statut Sayele (chaîne libre) vers notre énumération interne. */
export function normalizeStatus(raw: unknown): SayeleStatus {
  const s = String(raw ?? '').toLowerCase()
  if (['settled', 'success', 'successful', 'succeeded', 'completed', 'paid'].includes(s)) return 'settled'
  if (['failed', 'failure', 'declined', 'cancelled', 'canceled', 'rejected'].includes(s)) return 'failed'
  if (['expired', 'timeout'].includes(s)) return 'expired'
  if (['processing', 'authorized', 'sent', 'in_progress'].includes(s)) return 'processing'
  return 'pending'
}

/** Extrait l'id de transaction quel que soit le nom du champ renvoyé. */
function extractId(body: Record<string, unknown>): string | null {
  const candidate =
    body.id ?? body.transactionId ?? body.transaction_id ?? body.reference ?? null
  return candidate != null ? String(candidate) : null
}

/** Extrait le statut quel que soit l'emplacement (racine ou objet imbriqué). */
function extractStatus(body: Record<string, unknown>): unknown {
  if (body.status != null) return body.status
  if (body.state != null) return body.state
  const tx = body.transaction as Record<string, unknown> | undefined
  if (tx && typeof tx === 'object') return tx.status ?? tx.state
  const data = body.data as Record<string, unknown> | undefined
  if (data && typeof data === 'object') return data.status ?? data.state
  return undefined
}

/**
 * Crée un pay-in Mobile Money. L'URL de notification (webhook) est configurée
 * globalement dans le tableau de bord Sayele : pas besoin de la passer ici.
 */
export async function createTransaction(input: CreateTransactionInput): Promise<SayeleTransaction> {
  // HYPOTHÈSE (corps du pay-in) — calquée sur l'exemple payout de la doc :
  //   { idempotencyKey, amountMinor, currency, country, method, operator,
  //     instrument (téléphone), customerReference }
  const payload = {
    idempotencyKey: input.idempotencyKey,
    amountMinor: input.amountMinor,
    currency: input.currency,
    country: input.country,
    method: 'mobile_money',
    operator: toSayeleOperator(input.operator),
    instrument: input.phone,
    customerReference: input.reference,
  }

  const res = await fetchWithTimeout(`${input.baseUrl.replace(/\/$/, '')}/v1/transactions`, {
    method: 'POST',
    headers: authHeaders(input.secretKey),
    body: JSON.stringify(payload),
  })

  const text = await res.text()
  let body: Record<string, unknown> = {}
  try {
    body = text ? (JSON.parse(text) as Record<string, unknown>) : {}
  } catch {
    body = { raw: text }
  }

  if (!res.ok) {
    const detail =
      (body.message as string) || (body.error as string) || text || `HTTP ${res.status}`
    throw new SayeleApiError(detail, res.status, body)
  }

  return {
    id: extractId(body),
    status: normalizeStatus(extractStatus(body) ?? 'pending'),
    raw: body,
  }
}

/** Lit l'état courant d'une transaction (réconciliation / polling de secours). */
export async function getTransaction(
  baseUrl: string,
  secretKey: string,
  id: string,
): Promise<SayeleTransaction> {
  const res = await fetchWithTimeout(
    `${baseUrl.replace(/\/$/, '')}/v1/transactions/${encodeURIComponent(id)}`,
    { method: 'GET', headers: authHeaders(secretKey) },
  )
  const text = await res.text()
  let body: Record<string, unknown> = {}
  try {
    body = text ? (JSON.parse(text) as Record<string, unknown>) : {}
  } catch {
    body = { raw: text }
  }
  if (!res.ok) {
    const detail = (body.message as string) || (body.error as string) || `HTTP ${res.status}`
    throw new SayeleApiError(detail, res.status, body)
  }
  return {
    id: extractId(body) ?? id,
    status: normalizeStatus(extractStatus(body)),
    raw: body,
  }
}

export class SayeleApiError extends Error {
  status: number
  body: unknown
  constructor(message: string, status: number, body: unknown) {
    super(message)
    this.name = 'SayeleApiError'
    this.status = status
    this.body = body
  }
}

// ── Webhooks ────────────────────────────────────────────────────────────────

function hmacHex(secret: string, payload: string): string {
  return createHmac('sha256', secret).update(payload, 'utf8').digest('hex')
}

/** Comparaison à temps constant de deux hex de même longueur. */
function safeEqualHex(a: string, b: string): boolean {
  if (!a || !b) return false
  const ba = Buffer.from(a, 'hex')
  const bb = Buffer.from(b, 'hex')
  if (ba.length === 0 || ba.length !== bb.length) return false
  return timingSafeEqual(ba, bb)
}

/**
 * Vérifie la signature d'un webhook Sayele sur le corps BRUT.
 *
 * HYPOTHÈSE : secret `whsec_…` ⇒ signature HMAC-SHA256, convention type Stripe.
 * On accepte plusieurs formats d'en-tête pour être robuste :
 *   • `t=<timestamp>,v1=<hex>`  → HMAC( `${t}.${rawBody}` )
 *   • `<hex>` seul               → HMAC( rawBody )
 *   • `sha256=<hex>`             → HMAC( rawBody )
 * Le secret est utilisé TEL QUEL (préfixe `whsec_` inclus) ; on tente aussi sans
 * le préfixe, selon l'implémentation du prestataire.
 */
export function verifyWebhookSignature(
  secret: string,
  rawBody: string,
  signatureHeader: string | null,
): boolean {
  if (!secret || !signatureHeader) return false

  const header = signatureHeader.trim()
  const secrets = secret.startsWith('whsec_') ? [secret, secret.slice('whsec_'.length)] : [secret]

  // Format « t=…,v1=… »
  const parts = Object.fromEntries(
    header.split(',').map((kv) => {
      const [k, ...rest] = kv.split('=')
      return [k.trim(), rest.join('=').trim()]
    }),
  ) as Record<string, string>

  const candidates: string[] = []
  if (parts.v1) candidates.push(parts.v1)
  const bare = header.replace(/^sha256=/i, '').trim()
  candidates.push(bare)

  for (const sec of secrets) {
    for (const provided of candidates) {
      if (!/^[0-9a-f]+$/i.test(provided)) continue
      // Payload signé « timestamp.body » si un timestamp est présent, sinon body seul.
      const signedWithTs = parts.t ? hmacHex(sec, `${parts.t}.${rawBody}`) : null
      const signedBody = hmacHex(sec, rawBody)
      if (
        (signedWithTs && safeEqualHex(signedWithTs, provided)) ||
        safeEqualHex(signedBody, provided)
      ) {
        return true
      }
    }
  }
  return false
}

/** En-têtes candidats portant la signature (on prend le premier présent). */
export function readSignatureHeader(headers: Headers): string | null {
  return (
    headers.get('sayele-signature') ??
    headers.get('x-sayele-signature') ??
    headers.get('x-webhook-signature') ??
    headers.get('x-signature') ??
    headers.get('signature') ??
    null
  )
}
