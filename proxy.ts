import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { verifyAdminToken, COOKIE } from "@/lib/admin/auth"

const MAINTENANCE_PATH = "/maintenance"

/** Préfixes toujours accessibles, même quand le mode maintenance est actif. */
function isMaintenanceExempt(pathname: string): boolean {
  return (
    pathname.startsWith("/adminjommba") || // console admin (pour désactiver la maintenance)
    pathname.startsWith("/api") ||          // routes API (webhooks, auth…)
    pathname === MAINTENANCE_PATH
  )
}

/** Lit le drapeau de maintenance via l'API REST Supabase (lecture publique). */
async function isMaintenanceEnabled(): Promise<boolean> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return false

  try {
    // Vue dédiée qui n'expose que le drapeau (pas les prix / limites internes).
    const res = await fetch(
      `${url}/rest/v1/public_maintenance?select=enabled`,
      {
        headers: { apikey: key, Authorization: `Bearer ${key}` },
        // Cache court : la bascule prend effet en quelques secondes sans
        // requêter la BDD à chaque visite.
        next: { revalidate: 10 },
      }
    )
    if (!res.ok) return false
    const rows = (await res.json()) as { enabled?: boolean }[]
    return rows[0]?.enabled === true
  } catch {
    // En cas d'échec réseau, on ne bloque jamais le site.
    return false
  }
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  // ── 0. Mode maintenance ───────────────────────────────────────────────────
  const maintenance = await isMaintenanceEnabled()
  if (maintenance) {
    // Maintenance active : tout le trafic public bascule vers /maintenance.
    if (!isMaintenanceExempt(pathname)) {
      const url = req.nextUrl.clone()
      url.pathname = MAINTENANCE_PATH
      url.search = ""
      return NextResponse.redirect(url)
    }
  } else if (pathname === MAINTENANCE_PATH) {
    // Maintenance inactive : personne ne doit rester bloqué sur /maintenance.
    const url = req.nextUrl.clone()
    url.pathname = "/"
    return NextResponse.redirect(url)
  }

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
  // Couvre tout le site (pour la maintenance) en excluant les assets statiques
  // et les fichiers publics, où le proxy n'a rien à faire.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|gif|webp|ico|txt|xml|woff2?|ttf|css|js|map)$).*)",
  ],
}
