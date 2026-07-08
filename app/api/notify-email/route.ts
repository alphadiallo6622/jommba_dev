import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendEmail } from '@/lib/email'

export const runtime = 'nodejs'

type NotifyType = 'demande' | 'message' | 'demande_acceptee'

const PREF_COLUMN: Record<NotifyType, 'email_demande' | 'email_message'> = {
  demande:          'email_demande',
  demande_acceptee: 'email_demande',
  message:          'email_message',
}

const SUBJECT: Record<NotifyType, string> = {
  demande:          'Nouvelle demande de contact sur Jommba',
  demande_acceptee: 'Ta demande a été acceptée 🎉',
  message:          'Nouveau message sur Jommba',
}

function buildText(type: NotifyType, senderName: string): string {
  if (type === 'demande')          return `${senderName} souhaite entrer en contact avec toi sur Jommba. Connecte-toi pour répondre à sa demande.`
  if (type === 'demande_acceptee') return `${senderName} a accepté ta demande de contact. Vous pouvez maintenant discuter sur Jommba !`
  return `${senderName} t'a envoyé un nouveau message sur Jommba. Connecte-toi pour le lire.`
}

export async function POST(req: NextRequest) {
  let body: { receiverId?: string; type?: NotifyType; senderName?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ sent: false }, { status: 400 })
  }

  const { receiverId, type, senderName } = body
  if (!receiverId || !type || !PREF_COLUMN[type]) {
    return NextResponse.json({ sent: false, error: 'Paramètres invalides' }, { status: 400 })
  }

  const admin = createAdminClient()

  const { data: prefs } = await admin
    .from('user_preferences')
    .select('email_demande, email_message')
    .eq('user_id', receiverId)
    .maybeSingle()

  // Pas de ligne de préférences ou préférence désactivée → on n'envoie rien
  if (!prefs || !prefs[PREF_COLUMN[type]]) {
    return NextResponse.json({ sent: false, reason: 'opted_out' })
  }

  const { data: userData, error: userError } = await admin.auth.admin.getUserById(receiverId)
  if (userError || !userData?.user?.email) {
    return NextResponse.json({ sent: false, reason: 'no_email' })
  }

  const { data: profile } = await admin
    .from('profiles')
    .select('first_name')
    .eq('user_id', receiverId)
    .maybeSingle()

  try {
    await sendEmail({
      to: userData.user.email,
      toName: profile?.first_name ?? undefined,
      subject: SUBJECT[type],
      text: buildText(type, senderName ?? 'Un membre'),
    })
    return NextResponse.json({ sent: true })
  } catch {
    return NextResponse.json({ sent: false, reason: 'smtp_error' })
  }
}
