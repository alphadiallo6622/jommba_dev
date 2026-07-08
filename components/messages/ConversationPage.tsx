'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import type { Message, Conversation } from '@/lib/mock-messages'
import { useCurrentUser } from '@/lib/use-current-user'
import { useAuth } from '@/components/providers/AuthProvider'
import { createClient } from '@/lib/supabase/client'
import {
  areContacts,
  getOrCreateConversation,
  fetchMessages,
  sendMessage,
  markConversationRead,
  formatTimeAgo,
} from '@/lib/supabase/messages-service'
import type { Message as DbMessage } from '@/lib/supabase/types'
import ConversationHeader from './ConversationHeader'
import MessageArea from './MessageArea'
import MessageInput from './MessageInput'
import DiscussionRulesModal from './DiscussionRulesModal'

const MSGS_REQUIRED = 30

type Props = { id: string }  // id = user_id de l'autre participant

function toUiMessage(m: DbMessage, myId: string): Message {
  return {
    id:     m.id,
    text:   m.content,
    sender: m.sender_id === myId ? 'me' : 'other',
    time:   new Date(m.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
  }
}

export default function ConversationPage({ id }: Props) {
  const router        = useRouter()
  const { isPremium } = useCurrentUser()
  const { user }      = useAuth()

  const [conv, setConv]                   = useState<Conversation | null>(null)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [messages, setMessages]           = useState<Message[]>([])
  const [loading, setLoading]             = useState(true)
  const [blocked, setBlocked]             = useState(false)
  const [rulesAccepted, setRulesAccepted] = useState(false)
  const [sentCount, setSentCount]         = useState(0)
  const convIdRef = useRef<string | null>(null)

  // Chargement initial : profil de l'autre, vérification contact, conversation, messages
  useEffect(() => {
    if (!user) return
    let cancelled = false
    const supabase = createClient()

    async function init() {
      if (!user) return
      setLoading(true)
      try {
        // Règle métier : la messagerie n'est ouverte qu'entre contacts acceptés
        const allowed = await areContacts(user.id, id)
        if (!allowed) {
          if (!cancelled) { setBlocked(true); setLoading(false) }
          return
        }

        const { data: p } = await supabase
          .from('profiles')
          .select('first_name, last_name, avatar_url')
          .eq('user_id', id)
          .single()

        const conversation = await getOrCreateConversation(user.id, id)
        if (!conversation) {
          if (!cancelled) setLoading(false)
          return
        }

        const dbMessages = await fetchMessages(conversation.id)
        await markConversationRead(conversation.id, user.id)

        if (cancelled) return
        convIdRef.current = conversation.id
        setConversationId(conversation.id)
        setMessages(dbMessages.map(m => toUiMessage(m, user.id)))
        setSentCount(dbMessages.filter(m => m.sender_id === user.id).length)
        setConv({
          id,
          firstName:   p?.first_name ?? '…',
          lastInitial: (p?.last_name ?? p?.first_name ?? '?').charAt(0),
          photo:       p?.avatar_url ?? '/avatar-placeholder.svg',
          lastMessage: dbMessages.at(-1)?.content ?? 'Démarrez la conversation...',
          timeAgo:     formatTimeAgo(dbMessages.at(-1)?.created_at ?? null),
          isRead:      true,
          unreadCount: 0,
          isArchived:  false,
        })
      } catch (err) {
        console.error('[ConversationPage] init error:', err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    init()
    return () => { cancelled = true }
  }, [user, id])

  // Temps réel : réception des messages de l'autre participant
  useEffect(() => {
    if (!user || !conversationId) return
    const supabase = createClient()

    const channel = supabase
      .channel(`conversation-${conversationId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      }, (payload) => {
        const m = payload.new as DbMessage
        if (m.sender_id === user.id) return  // déjà affiché localement à l'envoi
        setMessages(prev => prev.some(x => x.id === m.id) ? prev : [...prev, toUiMessage(m, user.id)])
        markConversationRead(conversationId, user.id)
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [user, conversationId])

  const msgsRemaining = Math.max(0, MSGS_REQUIRED - sentCount)

  const handleSend = async (text: string) => {
    if (!user || !convIdRef.current) return
    const optimistic: Message = {
      id:     `tmp-${Date.now()}`,
      text,
      sender: 'me',
      time:   new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    }
    setMessages(prev => [...prev, optimistic])
    setSentCount(c => c + 1)

    const saved = await sendMessage(convIdRef.current, user.id, id, text)
    if (!saved) {
      setMessages(prev => prev.filter(m => m.id !== optimistic.id))
      setSentCount(c => Math.max(0, c - 1))
      toast.error("Message non envoyé. Réessaie.")
      return
    }
    setMessages(prev => prev.map(m => m.id === optimistic.id ? toUiMessage(saved, user.id) : m))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-6 h-6 animate-spin text-[#10B981]" />
      </div>
    )
  }

  if (blocked) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 px-6 text-center">
        <p className="text-gray-500 text-sm font-medium">
          Vous devez être en contact pour discuter.
        </p>
        <p className="text-gray-400 text-xs">
          Envoie une demande de contact et attends son acceptation pour ouvrir la discussion.
        </p>
        <button
          onClick={() => router.push(`/dashboard/profil/${id}`)}
          className="mt-2 bg-[#10B981] text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-[#059669] transition-colors"
        >
          Voir le profil
        </button>
      </div>
    )
  }

  if (!conv) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-400 text-sm">Conversation introuvable</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">

      {/* Rules bottom-sheet on first open */}
      {!rulesAccepted && (
        <DiscussionRulesModal
          firstName={conv.firstName}
          lastInitial={conv.lastInitial}
          onConfirm={() => setRulesAccepted(true)}
          onClose={() => router.push('/dashboard/messages')}
        />
      )}

      <ConversationHeader
        conv={conv}
        msgsRemaining={msgsRemaining}
      />

      <MessageArea
        messages={messages}
        firstName={conv.firstName}
        lastInitial={conv.lastInitial}
      />

      <MessageInput onSend={handleSend} isPremium={isPremium} />

      {/* Spacer for mobile bottom nav */}
      <div className="md:hidden shrink-0 h-16" />
    </div>
  )
}
