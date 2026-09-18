import { NextRequest, NextResponse } from 'next/server'
import type { EmailOtpType } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { localizePath, safeNextPath, toAuthLocale } from '@/lib/auth/localize-path'

// Vérifie un token_hash envoyé par email (ex. réinitialisation de mot de passe)
// et ouvre la session côté serveur, puis redirige vers `next`.
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const tokenHash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = safeNextPath(searchParams.get('next'), '/dashboard')
  const locale = toAuthLocale(req.cookies.get('NEXT_LOCALE')?.value)

  if (tokenHash && type) {
    const supabase = await createClient()
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash })
    if (!error) {
      return NextResponse.redirect(new URL(localizePath(next, locale), req.url))
    }
    console.warn('[auth/confirm] Token invalide ou expiré :', error.message)
  }

  // Lien invalide/expiré : la page de réinitialisation affiche l'état
  // "lien invalide" avec un bouton pour en redemander un.
  const fallback = type === 'recovery' ? '/reinitialiser-mot-de-passe' : '/connexion?error=auth_code_error'
  return NextResponse.redirect(new URL(localizePath(fallback, locale), req.url))
}
