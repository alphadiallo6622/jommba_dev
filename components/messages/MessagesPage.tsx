'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { MessageCircle, Search, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/components/providers/AuthProvider'
import {
  fetchConversationList,
  formatTimeAgo,
  type ConversationListEntry,
} from '@/lib/supabase/messages-service'
import VoiceMessageBanner from './VoiceMessageBanner'
import ConversationCard from './ConversationCard'

type Tab = 'tous' | 'non-lus' | 'lus'

export default function MessagesPage() {
  const t = useTranslations('dashboard.messages')
  const locale = useLocale()
  const { user } = useAuth()
  const [activeTab, setActiveTab]     = useState<Tab>('tous')
  const [searchQuery, setSearchQuery] = useState('')
  const [conversations, setConversations] = useState<ConversationListEntry[]>([])
  const [loading, setLoading]         = useState(true)

  const fetchData = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      setConversations(await fetchConversationList(user.id))
    } catch (err) {
      console.error('[MessagesPage] fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => { fetchData() }, [fetchData])

  const tabs = [
    { id: 'tous'    as Tab, label: t('tabs.all'),    count: conversations.length                       },
    { id: 'non-lus' as Tab, label: t('tabs.unread'), count: conversations.filter(c => !c.isRead).length },
    { id: 'lus'     as Tab, label: t('tabs.read'),   count: conversations.filter(c =>  c.isRead).length },
  ]

  const filtered = useMemo(() => {
    return conversations
      .filter(c => {
        if (activeTab === 'non-lus') return !c.isRead
        if (activeTab === 'lus')     return  c.isRead
        return true
      })
      .filter(c =>
        searchQuery === '' ||
        `${c.firstName} ${c.lastInitial}`.toLowerCase().includes(searchQuery.toLowerCase())
      )
  }, [conversations, activeTab, searchQuery])

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#064E3B] flex items-center gap-2">
          {t('title')}
          <MessageCircle className="w-6 h-6 text-[#10B981]" />
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          {loading ? '…' : t('count', { count: conversations.length })}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {tabs.map(({ id, label, count }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={cn(
              'flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              activeTab === id
                ? 'bg-[#10B981] text-white'
                : 'bg-white text-gray-500 hover:text-gray-700',
            )}
          >
            {label}
            {count > 0 && (
              <span className={cn(
                'text-xs w-5 h-5 rounded-full flex items-center justify-center font-semibold',
                activeTab === id
                  ? 'bg-white/20 text-white'
                  : 'bg-[#E1F5EE] text-[#10B981]',
              )}>
                {count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Voice messages upsell */}
      <VoiceMessageBanner />

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder={t('searchPlaceholder')}
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white border border-gray-100 rounded-xl text-sm focus:outline-none focus:border-[#10B981] transition-colors"
        />
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-[#10B981]" />
        </div>
      )}

      {/* Conversations */}
      {!loading && (
        <div className="space-y-2">
          {filtered.length > 0 ? (
            filtered.map(conv => (
              <ConversationCard
                key={conv.conversationId}
                conv={{
                  id:          conv.otherUserId,
                  firstName:   conv.firstName,
                  lastInitial: conv.lastInitial,
                  photo:       conv.photo,
                  lastMessage: conv.lastMessage,
                  timeAgo:     formatTimeAgo(conv.lastMessageAt, locale),
                  isRead:      conv.isRead,
                  unreadCount: conv.unreadCount,
                  isArchived:  false,
                }}
              />
            ))
          ) : (
            <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
              <MessageCircle className="w-10 h-10 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">{t('empty')}</p>
              <p className="text-gray-300 text-xs mt-1">
                {t('emptyHint')}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
