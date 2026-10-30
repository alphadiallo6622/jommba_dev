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

// Colonne d'horodatage du dernier envoi, pour les types que l'on espace.
// `demande_acceptee` reste immediat : l'evenement est rare et attendu.
const THROTTLE_COLUMN: Partial<Record<NotifyType, 'last_message_email_at' | 'last_demande_email_at'>> = {
  message: 'last_message_email_at',
  demande: 'last_demande_email_at',
}

// Interrupteur global correspondant, réglé dans la console admin.
// `demande_acceptee` suit le même interrupteur que `demande`, comme pour la
// préférence individuelle.
const SWITCH_KEY: Record<NotifyType, 'demande' | 'message'> = {
  demande:          'demande',
  demande_acceptee: 'demande',
  message:          'message',
}

/** Un seul e-mail « nouveau message » / « nouvelle demande » par fenêtre. */
const THROTTLE_HOURS = 5

/**
 * En deçà de ce délai depuis la dernière activité, le membre est considéré
 * devant son écran : la notification in-app et le push suffisent, l'e-mail
 * ferait doublon.
 */
const ACTIVE_MINUTES = 15

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
  const throttleColumn = THROTTLE_COLUMN[type]

  // Interrupteur global (console admin → Paramètres). Seul un `false` explicite
  // coupe l'envoi : réglage absent ou lecture impossible = on laisse passer,
  // pour qu'un incident de configuration ne prive jamais les membres de leurs
  // notifications.
  const { data: platform } = await admin
    .from('platform_settings')
    .select('notifications')
    .eq('id', 1)
    .maybeSingle()

  const switches = (platform?.notifications ?? {}) as Partial<Record<'demande' | 'message', boolean>>
  if (switches[SWITCH_KEY[type]] === false) {
    return NextResponse.json({ sent: false, reason: 'disabled_by_admin' })
  }

  const { data: prefs } = await admin
    .from('user_preferences')
    .select('email_demande, email_message, last_message_email_at, last_demande_email_at')
    .eq('user_id', receiverId)
    .maybeSingle()

  // Pas de ligne de préférences ou préférence désactivée → on n'envoie rien
  if (!prefs || !prefs[PREF_COLUMN[type]]) {
    return NextResponse.json({ sent: false, reason: 'opted_out' })
  }

  const { data: profile } = await admin
    .from('profiles')
    .select('first_name, last_seen_at')
    .eq('user_id', receiverId)
    .maybeSingle()

  // Le membre est devant son écran : la notification in-app et le push font
  // déjà le travail. `last_seen_at` vide = jamais vu, donc on notifie.
  const lastSeen = profile?.last_seen_at ? Date.parse(profile.last_seen_at) : 0
  if (Date.now() - lastSeen < ACTIVE_MINUTES * 60_000) {
    return NextResponse.json({ sent: false, reason: 'recently_active' })
  }

  // Un seul e-mail par fenêtre : les événements suivants restent visibles
  // in-app et en push, ils ne déclenchent plus d'envoi.
  const lastEmail = throttleColumn ? prefs[throttleColumn] : null
  if (lastEmail && Date.now() - Date.parse(lastEmail) < THROTTLE_HOURS * 3_600_000) {
    return NextResponse.json({ sent: false, reason: 'throttled' })
  }

  const { data: userData, error: userError } = await admin.auth.admin.getUserById(receiverId)
  if (userError || !userData?.user?.email) {
    return NextResponse.json({ sent: false, reason: 'no_email' })
  }

  try {
    await sendEmail({
      to: userData.user.email,
      toName: profile?.first_name ?? undefined,
      subject: SUBJECT[type],
      text: buildText(type, senderName ?? 'Un membre'),
    })
  } catch {
    return NextResponse.json({ sent: false, reason: 'smtp_error' })
  }

  // Horodaté après succès seulement : un échec SMTP ne doit pas faire sauter
  // la fenêtre suivante.
  if (throttleColumn) {
    const now = new Date().toISOString()
    await admin
      .from('user_preferences')
      .update(
        throttleColumn === 'last_message_email_at'
          ? { last_message_email_at: now }
          : { last_demande_email_at: now }
      )
      .eq('user_id', receiverId)
  }

  return NextResponse.json({ sent: true })
}
