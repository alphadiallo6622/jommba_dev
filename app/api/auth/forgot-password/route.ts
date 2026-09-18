import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendEmail } from '@/lib/email'
import { toAuthLocale } from '@/lib/auth/localize-path'

export const runtime = 'nodejs'

// Génère le lien de réinitialisation via l'API admin Supabase et l'envoie par
// notre SMTP (lib/email.ts) plutôt que par le mailer intégré de Supabase, qui
// ne délivrait pas les emails. Le lien pointe vers /api/auth/confirm qui
// vérifie le token côté serveur : il fonctionne sur n'importe quel appareil,
// contrairement au flux PKCE lié au navigateur d'origine.

const bodySchema = z.object({
  email: z.email(),
  locale: z.string().optional(),
})

// Anti-spam minimal : un envoi par adresse et par minute (par instance).
const RESEND_DELAY_MS = 60_000
const lastSentAt = new Map<string, number>()

const COPY = {
  fr: {
    subject: 'Réinitialise ton mot de passe Jommba',
    text:
      "Tu as demandé à réinitialiser ton mot de passe Jommba.\n\n" +
      "Clique sur le bouton ci-dessous pour en choisir un nouveau. Ce lien est valable 1 heure.\n\n" +
      "Si tu n'es pas à l'origine de cette demande, ignore simplement cet email : ton mot de passe reste inchangé.",
    cta: 'Choisir un nouveau mot de passe',
  },
  en: {
    subject: 'Reset your Jommba password',
    text:
      'You asked to reset your Jommba password.\n\n' +
      'Click the button below to choose a new one. This link is valid for 1 hour.\n\n' +
      "If you didn't request this, just ignore this email: your password stays unchanged.",
    cta: 'Choose a new password',
  },
} as const

function siteOrigin(req: NextRequest): string {
  const forwardedHost = req.headers.get('x-forwarded-host')
  if (forwardedHost && process.env.NODE_ENV !== 'development') {
    return `https://${forwardedHost}`
  }
  return req.nextUrl.origin
}

export async function POST(req: NextRequest) {
  let parsed
  try {
    parsed = bodySchema.safeParse(await req.json())
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 })
  }
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'invalid_email' }, { status: 400 })
  }

  const email = parsed.data.email.trim().toLowerCase()
  const locale = toAuthLocale(parsed.data.locale ?? req.cookies.get('NEXT_LOCALE')?.value)

  const previous = lastSentAt.get(email)
  if (previous && Date.now() - previous < RESEND_DELAY_MS) {
    return NextResponse.json({ ok: false, error: 'rate_limited' }, { status: 429 })
  }

  const admin = createAdminClient()
  const { data, error } = await admin.auth.admin.generateLink({ type: 'recovery', email })

  // Compte inexistant : on répond comme si l'email était parti, pour ne pas
  // révéler quelles adresses sont inscrites.
  if (error || !data?.properties?.hashed_token) {
    console.warn('[forgot-password] Lien non généré :', error?.message ?? 'token manquant')
    return NextResponse.json({ ok: true })
  }

  const params = new URLSearchParams({
    token_hash: data.properties.hashed_token,
    type: 'recovery',
    next: '/reinitialiser-mot-de-passe',
  })
  const resetUrl = `${siteOrigin(req)}/api/auth/confirm?${params.toString()}`
  const copy = COPY[locale]

  try {
    await sendEmail({
      to: email,
      subject: copy.subject,
      text: copy.text,
      cta: { label: copy.cta, url: resetUrl },
      signatureName: locale === 'en' ? 'The Jommba team' : 'Équipe Jommba',
    })
  } catch (err) {
    console.error('[forgot-password] Envoi SMTP échoué :', err)
    return NextResponse.json({ ok: false, error: 'send_failed' }, { status: 502 })
  }

  lastSentAt.set(email, Date.now())
  return NextResponse.json({ ok: true })
}
