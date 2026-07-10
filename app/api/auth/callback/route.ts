import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

// Chemins localisés sous /[locale]/(auth)/… : préfixés par la locale du
// visiteur (cookie NEXT_LOCALE) avant redirection. Les autres (/dashboard,
// /onboarding…) restent inchangés, hors périmètre i18n.
const LOCALIZED_PATHS = ['/connexion', '/inscription', '/mot-de-passe-oublie', '/reinitialiser-mot-de-passe']

function localize(path: string, locale: 'fr' | 'en'): string {
  const [pathname, query] = path.split('?')
  if (!LOCALIZED_PATHS.includes(pathname)) return path
  return `/${locale}${pathname}${query ? `?${query}` : ''}`
}

// Échange le code OAuth/email contre une session Supabase.
// Utilisé après confirmation d'email ou connexion OAuth (Google).
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  const cookieStore = await cookies()
  const localeCookie = cookieStore.get('NEXT_LOCALE')?.value
  const locale: 'fr' | 'en' = localeCookie === 'en' ? 'en' : 'fr'

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
      const target = localize(next, locale)
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
