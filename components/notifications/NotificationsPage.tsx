'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Bell, Check, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/providers/AuthProvider'
import { type Notification, type NotifType } from '@/lib/mock-notifications'
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

const tabs: { id: TabId; label: string }[] = [
  { id: 'tout',     label: 'Tout'     },
  { id: 'visites',  label: 'Visites'  },
  { id: 'demandes', label: 'Demandes' },
  { id: 'messages', label: 'Messages' },
  { id: 'profil',   label: 'Profil'   },
  { id: 'premium',  label: 'Premium'  },
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
  const { user } = useAuth()
  const [notifs, setNotifs]       = useState<Notification[]>([])
  const [loading, setLoading]     = useState(true)
  const [activeTab, setActiveTab] = useState<TabId>('tout')

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
        (data ?? []).map((n) => ({
          id:          n.id,
          type:        (DB_TYPE_MAP[n.type] ?? 'profil') as NotifType,
          title:       n.title,
          description: n.body,
          date:        formatDate(n.created_at),
          isRead:      n.is_read,
          targetId:    (n.data as Record<string, string> | null)?.target_id,
        }))
      )
    } catch (err) {
      console.error('[NotificationsPage] fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [user])

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
            Notifications <Bell className="w-5 h-5 text-[#10B981]" />
          </h1>
        </div>
        <button
          onClick={markAllAsRead}
          disabled={unreadCount === 0}
          className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors disabled:opacity-40"
          title="Tout marquer comme lu"
        >
          <Check className="w-4 h-4 text-gray-600" />
        </button>
      </div>

      {unreadCount > 0 && (
        <p className="text-sm text-[#10B981] font-medium mb-4 ml-12">
          • {unreadCount} non lue{unreadCount > 1 ? 's' : ''}
        </p>
      )}

      <div className="flex gap-2 mb-5 flex-wrap">
        {tabs.map(({ id, label }) => {
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
              {label}
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
          Récentes
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
              <p className="text-gray-400 text-sm">Aucune notification</p>
              <p className="text-gray-300 text-xs mt-1">Essayez une autre catégorie</p>
            </div>
          )}
        </div>
      )}

      {!loading && notifs.length > 0 && (
        <p className="text-center text-xs text-gray-400 mt-6">
          {notifs.length} notification{notifs.length > 1 ? 's' : ''} au total
        </p>
      )}
    </div>
  )
}

function formatDate(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (diff < 60)     return "À l'instant"
  if (diff < 3600)   return `Il y a ${Math.floor(diff / 60)} min`
  if (diff < 86400)  return `Il y a ${Math.floor(diff / 3600)} h`
  if (diff < 172800) return 'Hier'
  return `Il y a ${Math.floor(diff / 86400)} j`
}
