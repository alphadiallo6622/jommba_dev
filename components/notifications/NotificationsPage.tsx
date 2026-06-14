'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Bell, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { mockNotifications, type Notification, type NotifType } from '@/lib/mock-notifications'
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

export default function NotificationsPage() {
  const router = useRouter()
  const [notifs, setNotifs]       = useState<Notification[]>(mockNotifications)
  const [activeTab, setActiveTab] = useState<TabId>('tout')

  const unreadCount = notifs.filter(n => !n.isRead).length

  const markAsRead = (id: string) => {
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))
  }

  const markAllAsRead = () => {
    setNotifs(prev => prev.map(n => ({ ...n, isRead: true })))
  }

  const getCount  = (id: TabId) => notifs.filter(tabFilters[id]).length
  const filtered  = notifs.filter(tabFilters[activeTab])

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 pb-24">

      {/* Header */}
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

      {/* Tabs */}
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

      {/* Section label */}
      {filtered.length > 0 && (
        <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-3 px-1">
          Cette semaine
        </p>
      )}

      {/* List */}
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

      {notifs.length > 0 && (
        <p className="text-center text-xs text-gray-400 mt-6">
          {notifs.length} notification{notifs.length > 1 ? 's' : ''} au total
        </p>
      )}
    </div>
  )
}
