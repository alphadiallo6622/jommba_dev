import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { localizePath, safeNextPath, toAuthLocale } from '@/lib/auth/localize-path'

/**
 * L'onboarding est-il terminé pour la session courante ?
 * `onboarding_completed_at` sert de témoin, pas `gender` : chaque étape est
 * enregistrée dès qu'elle est franchie, le genre l'est dès l'étape 1.
 * En cas de doute (session illisible, profil absent) on renvoie `false` :
 * mieux vaut un onboarding proposé en trop qu'un profil vide publié.
 */
async function isOnboardingDone(
  supabase: ReturnType<typeof createServerClient>
): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const { data: profile } = await supabase
    .from('profiles')
    .select('onboarding_completed_at')
    .eq('user_id', user.id)
    .maybeSingle()

  return Boolean(profile?.onboarding_completed_at)
}

// Échange le code OAuth/email contre une session Supabase.
// Utilisé après confirmation d'email ou connexion OAuth (Google).
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = safeNextPath(searchParams.get('next'), '/dashboard')

  const cookieStore = await cookies()
  const locale = toAuthLocale(cookieStore.get('NEXT_LOCALE')?.value)

  if (code) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // Tant que l'onboarding n'est pas terminé, il prime sur `next`. La
      // connexion Google depuis /connexion n'envoie aucun `next` : sans cette
      // vérification, un nouveau membre arrivait sur /dashboard avec un profil
      // vide. Le layout du dashboard l'y renverrait de toute façon ; on évite
      // ici l'aller-retour.
      const destination = (await isOnboardingDone(supabase)) ? next : '/onboarding'
      const target = localizePath(destination, locale)
      const forwardedHost = request.headers.get('x-forwarded-host')
      const isLocalEnv = process.env.NODE_ENV === 'development'

      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${target}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${target}`)
      } else {
        return NextResponse.redirect(`${origin}${target}`)
      }
    }
  }

  return NextResponse.redirect(`${origin}/${locale}/connexion?error=auth_code_error`)
}
