'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { ArrowLeft, Bell, Check, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/providers/AuthProvider'
import { type Notification, type NotifType } from '@/lib/mock-notifications'
import { localizeNotification, type NotificationData } from '@/lib/notification-i18n'
import NotificationCard from './NotificationCard'

type TabId = 'tout' | 'visites' | 'demandes' | 'messages' | 'profil' | 'premium'

const tabFilters: Record<TabId, (n: Notification) => boolean> = {
  tout:     ()  => true,
  visites:  n  => n.type === 'visite',
  demandes: n  => n.type === 'demande' || n.type === 'decline',
  messages: n  => n.type === 'message',
  profil:   n  => n.type === 'profil',
  premium:  n  => n.type === 'premium',
}

const tabs: { id: TabId; labelKey: string }[] = [
  { id: 'tout',     labelKey: 'all'      },
  { id: 'visites',  labelKey: 'visits'   },
  { id: 'demandes', labelKey: 'requests' },
  { id: 'messages', labelKey: 'messages' },
  { id: 'profil',   labelKey: 'profile'  },
  { id: 'premium',  labelKey: 'premium'  },
]

const DB_TYPE_MAP: Record<string, NotifType> = {
  demande: 'demande',
  decline: 'decline',
  profil:  'profil',
  message: 'message',
  visite:  'visite',
  premium: 'premium',
}

export default function NotificationsPage() {
  const router = useRouter()
  const t = useTranslations('dashboard.notifications')
  const tItems = useTranslations('dashboard.notifications.items')
  const { user } = useAuth()
  const [notifs, setNotifs]       = useState<Notification[]>([])
  const [loading, setLoading]     = useState(true)
  const [activeTab, setActiveTab] = useState<TabId>('tout')

  // Libellé « il y a … » localisé (dépend de t).
  const formatDate = useCallback((iso: string): string => {
    const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
    if (diff < 60)     return t('timeNow')
    if (diff < 3600)   return t('timeMinutes', { n: Math.floor(diff / 60) })
    if (diff < 86400)  return t('timeHours', { n: Math.floor(diff / 3600) })
    if (diff < 172800) return t('timeYesterday')
    return t('timeDays', { n: Math.floor(diff / 86400) })
  }, [t])

  const fetchNotifs = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const supabase = createClient()
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50)

      setNotifs(
        (data ?? []).map((n) => {
          const payload = n.data as NotificationData
          // Texte traduit si la notification porte une clé i18n, sinon le
          // français stocké (annonces et messages admin écrits à la main).
          const { title, description } = localizeNotification(
            payload,
            { title: n.title, description: n.body },
            tItems,
          )
          return {
            id:          n.id,
            type:        (DB_TYPE_MAP[n.type] ?? 'profil') as NotifType,
            title,
            description,
            date:        formatDate(n.created_at),
            isRead:      n.is_read,
            targetId:    payload?.target_id,
          }
        })
      )
    } catch (err) {
      console.error('[NotificationsPage] fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [user, formatDate, tItems])

  useEffect(() => { fetchNotifs() }, [fetchNotifs])

  const markAsRead = async (id: string) => {
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))
    if (!user) return
    const supabase = createClient()
    await supabase.from('notifications').update({ is_read: true }).eq('id', id).eq('user_id', user.id)
  }

  const markAllAsRead = async () => {
    setNotifs(prev => prev.map(n => ({ ...n, isRead: true })))
    if (!user) return
    const supabase = createClient()
    await supabase.from('notifications').update({ is_read: true }).eq('user_id', user.id)
  }

  const unreadCount = notifs.filter(n => !n.isRead).length
  const getCount    = (id: TabId) => notifs.filter(tabFilters[id]).length
  const filtered    = notifs.filter(tabFilters[activeTab])

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 pb-24">

      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-[#064E3B] flex items-center gap-2">
            {t('title')} <Bell className="w-5 h-5 text-[#10B981]" />
          </h1>
        </div>
        <button
          onClick={markAllAsRead}
          disabled={unreadCount === 0}
          className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors disabled:opacity-40"
          title={t('markAllRead')}
        >
          <Check className="w-4 h-4 text-gray-600" />
        </button>
      </div>

      {unreadCount > 0 && (
        <p className="text-sm text-[#10B981] font-medium mb-4 ml-12">
          • {t('unread', { count: unreadCount })}
        </p>
      )}

      <div className="flex gap-2 mb-5 flex-wrap">
        {tabs.map(({ id, labelKey }) => {
          const count = getCount(id)
          return (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                activeTab === id
                  ? 'bg-[#10B981] text-white'
                  : 'bg-white text-gray-500 hover:text-gray-700 border border-gray-100',
              )}
            >
              {t(`tabs.${labelKey}`)}
              {count > 0 && (
                <span className={cn(
                  'text-xs w-5 h-5 rounded-full flex items-center justify-center font-semibold',
                  activeTab === id ? 'bg-white/20 text-white' : 'bg-[#E1F5EE] text-[#10B981]',
                )}>
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {loading && (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-[#10B981]" />
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-3 px-1">
          {t('recent')}
        </p>
      )}

      {!loading && (
        <div className="space-y-1">
          {filtered.length > 0 ? (
            filtered.map(n => (
              <NotificationCard key={n.id} notif={n} onRead={markAsRead} />
            ))
          ) : (
            <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
              <Bell className="w-10 h-10 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">{t('empty')}</p>
              <p className="text-gray-300 text-xs mt-1">{t('emptyHint')}</p>
            </div>
          )}
        </div>
      )}

      {!loading && notifs.length > 0 && (
        <p className="text-center text-xs text-gray-400 mt-6">
          {t('total', { count: notifs.length })}
        </p>
      )}
    </div>
  )
}
