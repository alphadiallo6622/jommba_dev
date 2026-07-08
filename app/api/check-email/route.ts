import { NextRequest, NextResponse } from 'next/server'
import { resolveMx } from 'node:dns/promises'

// Domaines de fournisseurs jetables / temporaires connus, rejetés d'office
const DISPOSABLE_DOMAINS = new Set([
  'mailinator.com', 'tempmail.com', 'temp-mail.org', 'guerrillamail.com',
  '10minutemail.com', 'yopmail.com', 'trashmail.com', 'throwawaymail.com',
  'fakeinbox.com', 'getnada.com', 'dispostable.com', 'sharklasers.com',
])

export async function POST(req: NextRequest) {
  let email: string
  try {
    const body = await req.json()
    email = String(body.email ?? '')
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
      return NextResponse.json({ valid: false, reason: "Cette adresse email n'existe pas ou n'accepte pas les messages" })
    }
    return NextResponse.json({ valid: true })
  } catch {
    return NextResponse.json({ valid: false, reason: "Cette adresse email n'existe pas ou n'accepte pas les messages" })
  }
}
