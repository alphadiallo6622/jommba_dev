// app/api/cron/push-reminders/route.ts
// Notifications planifiées (push + in-app) :
//   - Premium : rappel quand l'accès expire dans 3 jours ou moins ;
//   - Boost : « boost terminé » une fois la période écoulée ;
//   - Inactivité : membre validé qui ne s'est pas connecté depuis 7 jours.
//
// Chaque notification est une simple insertion dans `notifications` : le trigger
// Postgres on_notification_push se charge ensuite d'envoyer le push. Déclenché
// par Vercel Cron (voir vercel.json), protégé par CRON_SECRET.
//
// Cadence : une fois par jour (limite du plan Hobby de Vercel). Une fin de boost
// peut donc être notifiée jusqu'à ~24 h après son échéance.
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createNotifications, type ServerNotification } from '@/lib/push/notify'

export const dynamic = 'force-dynamic'

const DAY_MS = 24 * 60 * 60 * 1000
const INACTIVITY_LIMIT = 500

type Admin = ReturnType<typeof createAdminClient>

/** Notifications déjà envoyées pour une clé i18n, depuis `sinceIso`. */
async function alreadyNotified(admin: Admin, i18n: string, userIds: string[], sinceIso: string) {
  if (userIds.length === 0) return []
  const { data } = await admin
    .from('notifications')
    .select('user_id, created_at, data')
    .filter('data->>i18n', 'eq', i18n)
    .in('user_id', userIds)
    .gte('created_at', sinceIso)
  return data ?? []
}

async function premiumExpiring(admin: Admin, now: number): Promise<ServerNotification[]> {
  const nowIso = new Date(now).toISOString()
  const { data: subs } = await admin
    .from('subscriptions')
    .select('user_id, current_period_end')
    .eq('status', 'active')
    .gt('current_period_end', nowIso)
  if (!subs) return []

  // Un membre peut cumuler plusieurs lignes actives : seule la plus tardive compte.
  const endByUser = new Map<string, number>()
  for (const s of subs) {
    if (!s.current_period_end) continue
    const end = new Date(s.current_period_end).getTime()
    if (end > (endByUser.get(s.user_id) ?? 0)) endByUser.set(s.user_id, end)
  }

  const soon = [...endByUser.entries()].filter(([, end]) => end - now <= 3 * DAY_MS)
  const done = await alreadyNotified(
    admin,
    'premiumExpiring',
    soon.map(([id]) => id),
    new Date(now - 5 * DAY_MS).toISOString(),
  )
  const doneIds = new Set(done.map((n) => n.user_id))

  return soon
    .filter(([id]) => !doneIds.has(id))
    .map(([userId, end]) => {
      const days = String(Math.max(1, Math.ceil((end - now) / DAY_MS)))
      return {
        userId,
        type: 'premium',
        title: 'Ton Premium expire bientôt 📅',
        body: `Ton accès Premium se termine dans ${days} jours. Renouvelle-le pour garder tes avantages.`,
        i18n: 'premiumExpiring',
        params: { days },
      }
    })
}

async function boostExpired(admin: Admin, now: number): Promise<ServerNotification[]> {
  const since = new Date(now - 3 * DAY_MS).toISOString()
  const { data: boosts } = await admin
    .from('boosts')
    .select('id, user_id')
    .lt('expires_at', new Date(now).toISOString())
    .gte('expires_at', since)
  if (!boosts || boosts.length === 0) return []

  const done = await alreadyNotified(admin, 'boostExpired', [...new Set(boosts.map((b) => b.user_id))], since)
  const doneBoostIds = new Set(
    done.map((n) => (n.data as { boost_id?: string } | null)?.boost_id).filter(Boolean),
  )

  return boosts
    .filter((b) => !doneBoostIds.has(b.id))
    .map((b) => ({
      userId: b.user_id,
      type: 'premium',
      title: 'Boost terminé',
      body: 'Ton boost est terminé. Relance-en un pour rester en tête des résultats.',
      i18n: 'boostExpired',
      extra: { boost_id: b.id },
    }))
}

async function inactivity(admin: Admin, now: number): Promise<ServerNotification[]> {
  const { data: members } = await admin
    .from('profiles')
    .select('user_id, last_seen_at')
    .eq('status', 'validated')
    .lt('last_seen_at', new Date(now - 7 * DAY_MS).toISOString())
    .order('last_seen_at', { ascending: false })
    .limit(INACTIVITY_LIMIT)
  if (!members || members.length === 0) return []

  // Un seul rappel par période d'inactivité : on n'en renvoie pas si une
  // notification existe déjà depuis la dernière connexion du membre.
  const done = await alreadyNotified(
    admin,
    'inactivity',
    members.map((m) => m.user_id),
    new Date(now - 365 * DAY_MS).toISOString(),
  )
  const lastReminder = new Map<string, number>()
  for (const n of done) {
    const at = new Date(n.created_at).getTime()
    if (at > (lastReminder.get(n.user_id) ?? 0)) lastReminder.set(n.user_id, at)
  }

  return members
    .filter((m) => (lastReminder.get(m.user_id) ?? 0) < new Date(m.last_seen_at!).getTime())
    .map((m) => ({
      userId: m.user_id,
      type: 'profil',
      title: 'Tu nous manques 😴',
      body: "Cela fait une semaine que tu ne t'es pas connecté(e). De nouveaux profils t'attendent !",
      i18n: 'inactivity',
    }))
}

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET
  const auth = req.headers.get('authorization')
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const admin = createAdminClient()
  const now = Date.now()

  // Chaque tâche est isolée : l'échec de l'une ne bloque pas les autres.
  const tasks = { premiumExpiring, boostExpired, inactivity }
  const result: Record<string, number | string> = {}
  for (const [name, task] of Object.entries(tasks)) {
    try {
      result[name] = await createNotifications(await task(admin, now))
    } catch (err) {
      console.error(`[cron/push-reminders] ${name}:`, err)
      result[name] = 'error'
    }
  }

  return NextResponse.json({ ok: true, ...result })
}
