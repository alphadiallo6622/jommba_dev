'use client'

import { useState, useMemo } from 'react'
import { MessageCircle, Search } from 'lucide-react'
import { mockConversations } from '@/lib/mock-messages'
import { cn } from '@/lib/utils'
import VoiceMessageBanner from './VoiceMessageBanner'
import ConversationCard from './ConversationCard'

type Tab = 'tous' | 'non-lus' | 'lus' | 'archivees'

export default function MessagesPage() {
  const [activeTab, setActiveTab]   = useState<Tab>('tous')
  const [searchQuery, setSearchQuery] = useState('')

  const nonArchived = mockConversations.filter(c => !c.isArchived)

  const tabs = [
    { id: 'tous'      as Tab, label: 'Tous',      count: nonArchived.length                         },
    { id: 'non-lus'   as Tab, label: 'Non lus',   count: nonArchived.filter(c => !c.isRead).length  },
    { id: 'lus'       as Tab, label: 'Lus',       count: nonArchived.filter(c => c.isRead).length   },
    { id: 'archivees' as Tab, label: 'Archivées', count: mockConversations.filter(c => c.isArchived).length },
  ]

  const filtered = useMemo(() => {
    return mockConversations
      .filter(c => {
        if (activeTab === 'non-lus')   return !c.isRead && !c.isArchived
        if (activeTab === 'lus')       return  c.isRead && !c.isArchived
        if (activeTab === 'archivees') return  c.isArchived
        return !c.isArchived
      })
      .filter(c =>
        searchQuery === '' ||
        `${c.firstName} ${c.lastInitial}`.toLowerCase().includes(searchQuery.toLowerCase())
      )
  }, [activeTab, searchQuery])

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#064E3B] flex items-center gap-2">
          Messages
          <MessageCircle className="w-6 h-6 text-[#10B981]" />
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          {nonArchived.length} conversation{nonArchived.length > 1 ? 's' : ''}
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
          placeholder="Rechercher une conversation..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white border border-gray-100 rounded-xl text-sm focus:outline-none focus:border-[#10B981] transition-colors"
        />
      </div>

      {/* Conversations */}
      <div className="space-y-2">
        {filtered.length > 0 ? (
          filtered.map(conv => <ConversationCard key={conv.id} conv={conv} />)
        ) : (
          <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
            <MessageCircle className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">Aucune conversation</p>
          </div>
        )}
      </div>
    </div>
  )
}
