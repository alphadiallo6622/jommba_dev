// POST   /api/push/subscribe : enregistre l'abonnement push de l'appareil courant.
// DELETE /api/push/subscribe : le supprime (désactivation depuis les paramètres).
//
// L'écriture passe par le client admin : le même navigateur peut changer de
// compte, et l'endpoint (unique) doit alors changer de propriétaire, ce que la
// RLS refuserait à l'utilisateur.
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type SubscriptionBody = {
  endpoint?: string
  keys?: { p256dh?: string; auth?: string }
  locale?: string
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const body = (await req.json().catch(() => ({}))) as SubscriptionBody
  const endpoint = body.endpoint
  const p256dh = body.keys?.p256dh
  const auth = body.keys?.auth
  if (!endpoint || !p256dh || !auth || !/^https:\/\//.test(endpoint)) {
    return NextResponse.json({ error: 'Abonnement invalide' }, { status: 400 })
  }

  const admin = createAdminClient()
  const { error } = await admin.from('push_subscriptions').upsert(
    {
      user_id: user.id,
      endpoint,
      p256dh,
      auth,
      locale: body.locale === 'en' ? 'en' : 'fr',
      user_agent: req.headers.get('user-agent')?.slice(0, 300) ?? null,
    },
    { onConflict: 'endpoint' },
  )
  if (error) {
    console.error('[push/subscribe]', error.message)
    return NextResponse.json({ error: 'Enregistrement échoué' }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const { endpoint } = (await req.json().catch(() => ({}))) as { endpoint?: string }
  if (!endpoint) return NextResponse.json({ error: 'endpoint manquant' }, { status: 400 })

  const { error } = await supabase
    .from('push_subscriptions')
    .delete()
    .eq('user_id', user.id)
    .eq('endpoint', endpoint)
  if (error) return NextResponse.json({ error: 'Suppression échouée' }, { status: 500 })
  return NextResponse.json({ ok: true })
}
