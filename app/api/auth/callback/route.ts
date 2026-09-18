import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { localizePath, safeNextPath, toAuthLocale } from '@/lib/auth/localize-path'

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
      const target = localizePath(next, locale)
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
