// POST /api/push/read
// Appelée par le service worker au clic sur une notification push : marque la
// notification comme lue et renvoie le nouveau compteur du badge. L'utilisateur
// est identifié par ses cookies de session (même origine).
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const { id } = (await req.json().catch(() => ({}))) as { id?: string }
  if (id && /^[0-9a-f-]{36}$/i.test(id)) {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id).eq('user_id', user.id)
  }

  const { data: badge } = await supabase.rpc('my_unread_badge_count')
  return NextResponse.json({ ok: true, badge: Number(badge ?? 0) })
}
