// lib/push/server.ts
// Envoi des notifications push (Web Push / VAPID). Serveur uniquement.
import webpush from 'web-push'
import { createTranslator } from 'next-intl'
import { createAdminClient } from '@/lib/supabase/admin'
import { localizeNotification, type NotificationData } from '@/lib/notification-i18n'
import { pushPathFor } from './routes'
import fr from '@/messages/fr.json'
import en from '@/messages/en.json'

const MESSAGES = { fr, en } as const

let configured = false
function configureWebPush(): boolean {
  if (configured) return true
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  const privateKey = process.env.VAPID_PRIVATE_KEY
  if (!publicKey || !privateKey) return false
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || 'mailto:contact@jommba.com',
    publicKey,
    privateKey,
  )
  configured = true
  return true
}

/** Texte de la notification dans la langue de l'appareil (repli : texte stocké). */
function textFor(
  locale: string,
  data: NotificationData,
  fallback: { title: string; description: string },
) {
  const lang: 'fr' | 'en' = locale === 'en' ? 'en' : 'fr'
  const t = createTranslator({
    locale: lang,
    messages: MESSAGES[lang],
    namespace: 'dashboard.notifications.items',
  }) as unknown as Parameters<typeof localizeNotification>[2]
  return localizeNotification(data, fallback, t)
}

export type PushResult =
  | { sent: number; removed: number; skipped?: undefined }
  | { sent: 0; removed: 0; skipped: string }

/**
 * Envoie la notification `notificationId` à tous les appareils de son
 * destinataire. Ne lève jamais d'exception métier : le résultat dit pourquoi
 * rien n'est parti (préférence désactivée, aucun appareil…).
 */
export async function sendPushForNotification(notificationId: string): Promise<PushResult> {
  if (!configureWebPush()) return { sent: 0, removed: 0, skipped: 'vapid_not_configured' }

  const admin = createAdminClient()

  const { data: notif } = await admin
    .from('notifications')
    .select('id, user_id, type, title, body, data')
    .eq('id', notificationId)
    .maybeSingle()
  if (!notif) return { sent: 0, removed: 0, skipped: 'notification_not_found' }

  // Interrupteur du membre (Paramètres → Notifications). Sans ligne de
  // préférences, la valeur par défaut de la colonne (true) s'applique.
  const { data: prefs } = await admin
    .from('user_preferences')
    .select('push_enabled')
    .eq('user_id', notif.user_id)
    .maybeSingle()
  if (prefs && prefs.push_enabled === false) {
    return { sent: 0, removed: 0, skipped: 'push_disabled' }
  }

  const { data: subs } = await admin
    .from('push_subscriptions')
    .select('id, endpoint, p256dh, auth, locale')
    .eq('user_id', notif.user_id)
  if (!subs || subs.length === 0) return { sent: 0, removed: 0, skipped: 'no_subscription' }

  const { data: badgeCount } = await admin.rpc('unread_badge_count', { uid: notif.user_id })
  const badge = Number(badgeCount ?? 0)

  const payloadData = notif.data as NotificationData
  const url = pushPathFor({
    type: notif.type,
    i18n: payloadData?.i18n,
    targetId: payloadData?.target_id,
    userId: notif.user_id,
  })

  let sent = 0
  const gone: string[] = []

  await Promise.all(
    subs.map(async (sub) => {
      const { title, description } = textFor(sub.locale, payloadData, {
        title: notif.title,
        description: notif.body,
      })
      const payload = JSON.stringify({
        id: notif.id,
        title,
        body: description,
        url,
        badge,
        lang: sub.locale,
      })
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          payload,
          { TTL: 60 * 60 * 24, urgency: 'high' },
        )
        sent++
      } catch (err) {
        const status = (err as { statusCode?: number }).statusCode
        // 404/410 : l'abonnement n'existe plus (app désinstallée, permission retirée).
        if (status === 404 || status === 410) gone.push(sub.id)
        else console.error('[push] envoi échoué', status, (err as Error).message)
      }
    }),
  )

  if (gone.length > 0) await admin.from('push_subscriptions').delete().in('id', gone)
  if (sent > 0) {
    await admin
      .from('push_subscriptions')
      .update({ last_used_at: new Date().toISOString() })
      .eq('user_id', notif.user_id)
  }

  return { sent, removed: gone.length }
}
