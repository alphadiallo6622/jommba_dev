// lib/notification-i18n.ts
//
// Les notifications sont écrites en base avec un titre/corps français figés
// (utiles pour les emails, la console admin et les exports). Depuis la
// migration 2026-08-23-notifications-i18n.sql, elles portent aussi une clé de
// traduction et ses paramètres dans `data` :
//
//   data = { "target_id": "…", "i18n": "newMessage", "params": { "name": "Barry" } }
//
// Ce module rend le libellé dans la langue du membre quand la clé est présente,
// et retombe sur le texte stocké sinon — anciennes lignes, messages écrits à la
// main par un admin, annonces.

export type NotificationText = { title: string; description: string }

type Translator = {
  (key: string, values?: Record<string, string>): string
  has(key: string): boolean
}

/** Ce que le client Supabase renvoie dans la colonne `data` (JSONB). */
export type NotificationData = {
  target_id?: string
  i18n?: string
  params?: Record<string, string>
} | null

/**
 * @param data     colonne `data` de la notification
 * @param fallback titre et corps français stockés en base
 * @param t        traducteur lié à `dashboard.notifications.items`
 */
export function localizeNotification(
  data: NotificationData,
  fallback: NotificationText,
  t: Translator,
): NotificationText {
  const key = data?.i18n
  if (!key) return fallback

  // Clé inconnue (notification plus récente que les traductions déployées) :
  // le texte français stocké reste préférable à un libellé cassé.
  if (!t.has(`${key}.title`) || !t.has(`${key}.body`)) return fallback

  const params = data.params ?? {}
  return {
    title: t(`${key}.title`, params),
    description: t(`${key}.body`, params),
  }
}
