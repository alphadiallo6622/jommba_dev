import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { verifyAdminToken, COOKIE } from "@/lib/admin/auth"

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  // ── 1. Routes admin (HMAC) ────────────────────────────────────────────────
  if (pathname.startsWith("/adminjommba")) {
    if (
      pathname.startsWith("/adminjommba/login") ||
      pathname.startsWith("/api/admin/auth")
    ) {
      return NextResponse.next()
    }
    const token = req.cookies.get(COOKIE)?.value
    if (!token || !(await verifyAdminToken(token))) {
      const url = req.nextUrl.clone()
      url.pathname = "/adminjommba/login"
      return NextResponse.redirect(url)
    }
    return NextResponse.next()
  }

  // ── 2. Routes protégées utilisateur (Supabase Auth) ──────────────────────
  if (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/onboarding")
  ) {
    let supabaseResponse = NextResponse.next({ request: req })

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return req.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              req.cookies.set(name, value)
            )
            supabaseResponse = NextResponse.next({ request: req })
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      const url = req.nextUrl.clone()
      url.pathname = "/connexion"
      url.searchParams.set("redirect", pathname)
      return NextResponse.redirect(url)
    }

    return supabaseResponse
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/adminjommba/:path*",
    "/dashboard/:path*",
    "/onboarding/:path*",
  ],
}
