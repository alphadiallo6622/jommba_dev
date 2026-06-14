'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  mockConversations, mockMessages, MOCK_AUTO_REPLIES,
  Message, Conversation,
} from '@/lib/mock-messages'
import { mockProfiles } from '@/lib/mock-demandes'
import { useCurrentUser } from '@/lib/use-current-user'
import ConversationHeader from './ConversationHeader'
import MessageArea from './MessageArea'
import MessageInput from './MessageInput'
import DiscussionRulesModal from './DiscussionRulesModal'

const MSGS_REQUIRED = 30

type Props = { id: string }

function now() {
  return new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

export default function ConversationPage({ id }: Props) {
  const router      = useRouter()
  const { isPremium } = useCurrentUser()

  const conv    = mockConversations.find(c => c.id === id)
  const profile = !conv ? mockProfiles[id] : null

  const fallback: Conversation | null = profile
    ? {
        id,
        firstName:   profile.firstName,
        lastInitial: profile.firstName[0],
        photo:       profile.photo,
        lastMessage: 'Démarrez la conversation...',
        timeAgo:     'Maintenant',
        isRead:      true,
        unreadCount: 0,
        isArchived:  false,
      }
    : null

  const activeConv = conv ?? fallback

  const [messages,      setMessages]      = useState<Message[]>(mockMessages[id] ?? [])
  const [rulesAccepted, setRulesAccepted] = useState(false)
  const [sentCount,     setSentCount]     = useState(0)

  const msgsRemaining = Math.max(0, MSGS_REQUIRED - sentCount)

  if (!activeConv) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-400 text-sm">Conversation introuvable</p>
      </div>
    )
  }

  const handleSend = (text: string) => {
    const newMsg: Message = {
      id:     `msg-${Date.now()}`,
      text,
      sender: 'me',
      time:   now(),
    }
    setMessages(prev => [...prev, newMsg])
    setSentCount(c => c + 1)

    setTimeout(() => {
      const reply = MOCK_AUTO_REPLIES[Math.floor(Math.random() * MOCK_AUTO_REPLIES.length)]
      setMessages(prev => [...prev, {
        id:     `msg-${Date.now()}-reply`,
        text:   reply,
        sender: 'other',
        time:   now(),
      }])
    }, 1500)
  }

  return (
    <div className="flex flex-col h-full">

      {/* Rules bottom-sheet on first open */}
      {!rulesAccepted && (
        <DiscussionRulesModal
          firstName={activeConv.firstName}
          lastInitial={activeConv.lastInitial}
          onConfirm={() => setRulesAccepted(true)}
          onClose={() => router.push('/dashboard/messages')}
        />
      )}

      <ConversationHeader
        conv={activeConv}
        msgsRemaining={msgsRemaining}
      />

      <MessageArea
        messages={messages}
        firstName={activeConv.firstName}
        lastInitial={activeConv.lastInitial}
      />

      <MessageInput onSend={handleSend} isPremium={isPremium} />

      {/* Spacer for mobile bottom nav */}
      <div className="md:hidden shrink-0 h-16" />
    </div>
  )
}
