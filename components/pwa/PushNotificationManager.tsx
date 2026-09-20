'use client'

// components/pwa/PushNotificationManager.tsx
// Monté dans le layout du dashboard (donc après le login). Composant sans rendu
// principal, sauf l'invitation à activer les notifications. Il :
//   1. propose d'activer le push (la permission exige un geste sur iOS) ;
//   2. resynchronise l'abonnement de l'appareil à chaque session ;
//   3. tient à jour le badge de l'icône : messages + notifications non lus,
//      recalculé en temps réel (Realtime) ;
//   4. enregistre la dernière activité (rappel d'inactivité à 7 jours) ;
//   5. navigue quand le service worker le demande (clic sur une notification).
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { Bell, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/providers/AuthProvider'
import { enablePush, ensurePushSubscription, getPushSupport, setBadge } from '@/lib/push/client'

const DISMISS_KEY = 'jommba-push-dismissed-at'
const LAST_SEEN_KEY = 'jommba-last-seen-at'
const DISMISS_MS = 7 * 24 * 60 * 60 * 1000
const LAST_SEEN_MS = 60 * 60 * 1000

function readStorage(key: string): number {
  try {
    return Number(localStorage.getItem(key)) || 0
  } catch {
    return 0
  }
}
function writeStorage(key: string, value: number) {
  try {
    localStorage.setItem(key, String(value))
  } catch {
    // Stockage indisponible (navigation privée) : on retentera au prochain chargement.
  }
}

export default function PushNotificationManager() {
  const { user } = useAuth()
  const router = useRouter()
  const locale = useLocale()
  const t = useTranslations('dashboard.push')
  const [showPrompt, setShowPrompt] = useState(false)
  const [busy, setBusy] = useState(false)
  const userId = user?.id
  const syncedFor = useRef<string | null>(null)

  // ── Dernière activité + abonnement + invitation ───────────────────────────
  useEffect(() => {
    if (!userId) return
    const supabase = createClient()
    let cancelled = false
    let promptTimer: ReturnType<typeof setTimeout> | undefined

    if (Date.now() - readStorage(LAST_SEEN_KEY) > LAST_SEEN_MS) {
      supabase.rpc('touch_last_seen').then(({ error }) => {
        if (!error) writeStorage(LAST_SEEN_KEY, Date.now())
      })
    }

    if (getPushSupport() !== 'ok') return

    const run = async () => {
      const { data: prefs } = await supabase
        .from('user_preferences')
        .select('push_enabled')
        .eq('user_id', userId)
        .maybeSingle()
      if (cancelled || prefs?.push_enabled === false) return

      if (Notification.permission === 'granted') {
        if (syncedFor.current !== userId) {
          syncedFor.current = userId
          await ensurePushSubscription(locale)
        }
      } else if (
        Notification.permission === 'default' &&
        Date.now() - readStorage(DISMISS_KEY) > DISMISS_MS
      ) {
        promptTimer = setTimeout(() => {
          if (!cancelled) setShowPrompt(true)
        }, 3000)
      }
    }
    void run()

    return () => {
      cancelled = true
      if (promptTimer) clearTimeout(promptTimer)
    }
  }, [userId, locale])

  // ── Badge de l'icône ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!userId) return
    const supabase = createClient()
    let timer: ReturnType<typeof setTimeout> | undefined

    const refresh = async () => {
      const { data, error } = await supabase.rpc('my_unread_badge_count')
      if (!error) setBadge(Number(data ?? 0))
    }
    // Plusieurs événements Realtime peuvent arriver d'un coup : un seul recalcul.
    const scheduleRefresh = () => {
      if (timer) clearTimeout(timer)
      timer = setTimeout(refresh, 300)
    }

    void refresh()

    const channel = supabase
      .channel(`app-badge-${userId}`)
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'messages', filter: `receiver_id=eq.${userId}`,
      }, scheduleRefresh)
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}`,
      }, scheduleRefresh)
      .subscribe()

    // Un push a pu arriver (ou être lu) pendant que l'app était en arrière-plan.
    const onVisible = () => {
      if (document.visibilityState === 'visible') void refresh()
    }
    document.addEventListener('visibilitychange', onVisible)

    return () => {
      if (timer) clearTimeout(timer)
      document.removeEventListener('visibilitychange', onVisible)
      supabase.removeChannel(channel)
    }
  }, [userId])

  // ── Navigation demandée par le service worker ──────────────────────────────
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return
    const onMessage = (event: MessageEvent) => {
      const data = event.data as { type?: string; url?: string } | undefined
      if (data?.type !== 'push-navigate' || !data.url) return
      const url = new URL(data.url, window.location.origin)
      if (url.origin === window.location.origin) router.push(url.pathname + url.search)
    }
    navigator.serviceWorker.addEventListener('message', onMessage)
    return () => navigator.serviceWorker.removeEventListener('message', onMessage)
  }, [router])

  if (!showPrompt) return null

  const dismiss = () => {
    writeStorage(DISMISS_KEY, Date.now())
    setShowPrompt(false)
  }

  const activate = async () => {
    setBusy(true)
    const result = await enablePush(locale)
    if (result === 'granted' && userId) {
      // Réactive aussi la préférence : le serveur la consulte avant chaque envoi.
      await createClient().from('user_preferences').update({ push_enabled: true }).eq('user_id', userId)
      setShowPrompt(false)
    } else {
      // Refusé ou erreur : inutile de reproposer tout de suite.
      dismiss()
    }
    setBusy(false)
  }

  return (
    <div
      role="dialog"
      aria-label={t('title')}
      className="fixed inset-x-3 bottom-20 z-50 mx-auto max-w-md rounded-2xl border border-emerald-100 bg-white p-4 shadow-xl md:bottom-6 md:left-auto md:right-6 md:mx-0"
    >
      <button
        onClick={dismiss}
        aria-label={t('later')}
        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
      >
        <X className="h-4 w-4" />
      </button>
      <div className="flex items-start gap-3 pr-5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-50">
          <Bell className="h-5 w-5 text-[#10B981]" />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900">{t('title')}</p>
          <p className="mt-0.5 text-xs text-gray-500">{t('description')}</p>
        </div>
      </div>
      <div className="mt-3 flex gap-2">
        <button
          onClick={activate}
          disabled={busy}
          className="flex-1 rounded-xl bg-[#10B981] py-2 text-sm font-semibold text-white transition-colors hover:bg-[#059669] disabled:opacity-60"
        >
          {t('enable')}
        </button>
        <button
          onClick={dismiss}
          className="rounded-xl bg-gray-100 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
        >
          {t('later')}
        </button>
      </div>
    </div>
  )
}
