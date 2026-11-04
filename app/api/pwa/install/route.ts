// POST /api/pwa/install : enregistre une installation de la PWA.
//
// L'insertion ne peut pas rester dans le navigateur : les en-têtes de
// géolocalisation du réseau Edge de Vercel (`x-vercel-ip-country`,
// `x-vercel-ip-city`) ne sont visibles que côté serveur. C'est d'eux que la
// console tire la carte des installations.
//
// L'écriture passe par la clé service_role : la table n'accepte plus aucune
// écriture directe depuis le client.
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type Platform = 'android' | 'ios' | 'desktop' | 'unknown'

const PLATFORMS: Platform[] = ['android', 'ios', 'desktop', 'unknown']

/** Vercel transmet la ville en pourcent-encodé (« Saint%20Petersburg »). */
function readCity(req: NextRequest): string | null {
  const raw = req.headers.get('x-vercel-ip-city')
  if (!raw) return null
  try {
    return decodeURIComponent(raw).slice(0, 120) || null
  } catch {
    // En-tête malformé : mieux vaut aucune ville qu'une ville fausse.
    return raw.slice(0, 120) || null
  }
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as { platform?: string }
  const platform: Platform = PLATFORMS.includes(body.platform as Platform)
    ? (body.platform as Platform)
    : 'unknown'

  // L'installation peut précéder toute connexion : l'absence de session n'est
  // pas une erreur, la ligne est simplement anonyme.
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const country = req.headers.get('x-vercel-ip-country')?.toUpperCase().slice(0, 2) || null

  const admin = createAdminClient()
  const { error } = await admin.from('pwa_installs').insert({
    user_id:    user?.id ?? null,
    platform,
    country,
    city:       readCity(req),
    user_agent: req.headers.get('user-agent')?.slice(0, 500) ?? null,
  })

  if (error) {
    console.error('[pwa] insertion de l’installation impossible:', error.message)
    return NextResponse.json({ error: 'Enregistrement impossible' }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}
