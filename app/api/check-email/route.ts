import { NextRequest, NextResponse } from 'next/server'
import { resolveMx } from 'node:dns/promises'

export const runtime = 'nodejs'

// Domaines de fournisseurs jetables / temporaires connus, rejetés d'office
const DISPOSABLE_DOMAINS = new Set([
  'mailinator.com', 'tempmail.com', 'temp-mail.org', 'guerrillamail.com',
  '10minutemail.com', 'yopmail.com', 'trashmail.com', 'throwawaymail.com',
  'fakeinbox.com', 'getnada.com', 'dispostable.com', 'sharklasers.com',
])

const INVALID_REASON = "Cette adresse email n'existe pas ou n'accepte pas les messages"

type AbstractReputationResponse = {
  email_deliverability?: {
    status?: 'deliverable' | 'undeliverable' | 'unknown'
  }
}

async function checkWithAbstractApi(email: string): Promise<boolean | null> {
  const apiKey = process.env.ABSTRACT_EMAIL_API_KEY
  if (!apiKey) return null

  try {
    const res = await fetch(
      `https://emailreputation.abstractapi.com/v1/?api_key=${apiKey}&email=${encodeURIComponent(email)}`,
      { signal: AbortSignal.timeout(8000) }
    )
    if (!res.ok) return null
    const data: AbstractReputationResponse = await res.json()

    const status = data.email_deliverability?.status
    if (status === 'undeliverable') return false
    if (status === 'deliverable') return true
    return null // unknown → indéterminé, on ne bloque pas
  } catch {
    return null
  }
}

export async function POST(req: NextRequest) {
  let email: string
  try {
    const body = await req.json()
    email = String(body.email ?? '').trim()
  } catch {
    return NextResponse.json({ valid: false, reason: 'Requête invalide' }, { status: 400 })
  }

  const domain = email.split('@')[1]?.toLowerCase().trim()
  if (!domain) {
    return NextResponse.json({ valid: false, reason: 'Adresse email invalide' }, { status: 400 })
  }

  if (DISPOSABLE_DOMAINS.has(domain)) {
    return NextResponse.json({ valid: false, reason: 'Les adresses email temporaires ne sont pas acceptées' })
  }

  try {
    const records = await resolveMx(domain)
    if (!records || records.length === 0) {
      return NextResponse.json({ valid: false, reason: INVALID_REASON })
    }
  } catch {
    return NextResponse.json({ valid: false, reason: INVALID_REASON })
  }

  const deliverable = await checkWithAbstractApi(email)
  if (deliverable === false) {
    return NextResponse.json({ valid: false, reason: INVALID_REASON })
  }

  // deliverable === true ou null (API indisponible/indéterminé) → on laisse passer
  return NextResponse.json({ valid: true })
}
