// lib/push/notify.ts
// Crée une notification traduisible depuis le serveur (paiements, crons).
// L'insertion suffit à déclencher le push : le trigger Postgres
// on_notification_push appelle /api/push/send.
import { createAdminClient } from '@/lib/supabase/admin'
import type { Json } from '@/lib/supabase/types'

export type ServerNotification = {
  userId: string
  /** Type historique : demande, message, visite, profil, premium… (onglets et icônes). */
  type: string
  /** Texte français figé, repli quand la traduction manque. */
  title: string
  body: string
  /** Clé de traduction sous dashboard.notifications.items. */
  i18n: string
  params?: Record<string, string>
  extra?: Record<string, Json>
}

function toRow(n: ServerNotification) {
  return {
    user_id: n.userId,
    type: n.type,
    title: n.title,
    body: n.body,
    is_read: false,
    data: { i18n: n.i18n, params: n.params ?? {}, ...(n.extra ?? {}) },
  }
}

/** Insertion par lots (crons) ; renvoie le nombre de lignes créées. */
export async function createNotifications(items: ServerNotification[]): Promise<number> {
  if (items.length === 0) return 0
  const admin = createAdminClient()
  let created = 0
  for (let i = 0; i < items.length; i += 200) {
    const chunk = items.slice(i, i + 200)
    const { error } = await admin.from('notifications').insert(chunk.map(toRow))
    if (error) console.error('[notify] lot échoué', error.message)
    else created += chunk.length
  }
  return created
}

/** Best-effort : une notification ratée ne doit jamais faire échouer l'action métier. */
export async function createNotification(n: ServerNotification): Promise<boolean> {
  try {
    return (await createNotifications([n])) === 1
  } catch (err) {
    console.error('[notify] erreur', n.i18n, err)
    return false
  }
}
