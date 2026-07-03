import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

// Suppression définitive du compte de l'utilisateur connecté.
// Toutes les FK vers auth.users sont ON DELETE CASCADE : profil, photos,
// likes, messages, conversations, notifications… sont purgés automatiquement.
export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  try {
    const admin = createAdminClient()
    const { error } = await admin.auth.admin.deleteUser(user.id)
    if (error) {
      console.error('[account/delete] error:', error)
      return NextResponse.json({ error: 'Échec de la suppression' }, { status: 500 })
    }
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[account/delete] error:', err)
    return NextResponse.json(
      { error: 'Configuration serveur incomplète (SUPABASE_SERVICE_ROLE_KEY)' },
      { status: 500 }
    )
  }
}
