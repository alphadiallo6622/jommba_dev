'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations, useLocale } from 'next-intl'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import type { Message, Conversation } from '@/lib/mock-messages'
import { useCurrentUser } from '@/lib/use-current-user'
import { useAuth } from '@/components/providers/AuthProvider'
import { createClient } from '@/lib/supabase/client'
import {
  areContacts,
  getOrCreateConversationChecked,
  fetchMessages,
  sendMessage,
  markConversationRead,
  formatTimeAgo,
} from '@/lib/supabase/messages-service'
import type { Message as DbMessage } from '@/lib/supabase/types'
import { notifyByEmail } from '@/lib/notify-email'
import ConversationHeader from './ConversationHeader'
import MessageArea from './MessageArea'
import MessageInput from './MessageInput'
import DiscussionRulesModal from './DiscussionRulesModal'

const MSGS_REQUIRED = 30

type Props = { id: string }  // id = user_id de l'autre participant

function toUiMessage(m: DbMessage, myId: string, locale: string): Message {
  return {
    id:     m.id,
    text:   m.content,
    sender: m.sender_id === myId ? 'me' : 'other',
    time:   new Date(m.created_at).toLocaleTimeString(locale === 'en' ? 'en-GB' : 'fr-FR', { hour: '2-digit', minute: '2-digit' }),
  }
}

export default function ConversationPage({ id }: Props) {
  const router        = useRouter()
  const t             = useTranslations('dashboard.messages')
  const locale        = useLocale()
  const { isPremium, firstName: myFirstName } = useCurrentUser()
  const { user }      = useAuth()

  const [conv, setConv]                   = useState<Conversation | null>(null)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [messages, setMessages]           = useState<Message[]>([])
  const [loading, setLoading]             = useState(true)
  const [blocked, setBlocked]             = useState(false)
  // Renseigné quand le blocage vient du plafond de conversations Free (et non
  // d'une absence de contact mutuel) : le message et le CTA diffèrent alors.
  const [limitMessage, setLimitMessage]   = useState<string | null>(null)
  const [rulesAccepted, setRulesAccepted] = useState(false)
  const [rulesChecked, setRulesChecked]   = useState(false)
  const [sentCount, setSentCount]         = useState(0)
  const convIdRef = useRef<string | null>(null)

  // Clé de persistance de l'acceptation des règles, propre à la paire (moi ↔ autre).
  const rulesStorageKey = user ? `jommba:rules-accepted:${user.id}:${id}` : null

  // Au chargement, on relit l'acceptation déjà donnée pour ce contact : le popup
  // ne doit s'afficher qu'une seule fois par profil, pas à chaque ouverture.
  useEffect(() => {
    if (!rulesStorageKey) return
    try {
      setRulesAccepted(localStorage.getItem(rulesStorageKey) === '1')
    } catch { /* localStorage indisponible : on affichera le popup */ }
    setRulesChecked(true)
  }, [rulesStorageKey])

  const acceptRules = () => {
    if (rulesStorageKey) {
      try { localStorage.setItem(rulesStorageKey, '1') } catch { /* ignore */ }
    }
    setRulesAccepted(true)
  }

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

        // Plafond de conversations simultanées pour les membres Free : une
        // conversation déjà ouverte passe toujours, seule une nouvelle est
        // refusée (l'écran affiche alors le même état « bloqué »).
        const result = await getOrCreateConversationChecked(user.id, id, isPremium)
        if (!result.ok) {
          if (!cancelled) {
            if (result.reason === 'limit') { setLimitMessage(result.message); setBlocked(true) }
            setLoading(false)
          }
          return
        }
        const conversation = result.conversation

        const dbMessages = await fetchMessages(conversation.id)
        await markConversationRead(conversation.id, user.id)

        if (cancelled) return
        convIdRef.current = conversation.id
        setConversationId(conversation.id)
        setMessages(dbMessages.map(m => toUiMessage(m, user.id, locale)))
        setSentCount(dbMessages.filter(m => m.sender_id === user.id).length)
        setConv({
          id,
          firstName:   p?.first_name ?? '…',
          lastInitial: (p?.last_name ?? '').charAt(0),
          photo:       p?.avatar_url ?? '/avatar-placeholder.svg',
          lastMessage: dbMessages.at(-1)?.content ?? '',
          timeAgo:     formatTimeAgo(dbMessages.at(-1)?.created_at ?? null, locale),
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
  }, [user, id, locale, isPremium])

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
        setMessages(prev => prev.some(x => x.id === m.id) ? prev : [...prev, toUiMessage(m, user.id, locale)])
        markConversationRead(conversationId, user.id)
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [user, conversationId, locale])

  const msgsRemaining = Math.max(0, MSGS_REQUIRED - sentCount)

  const handleSend = async (text: string) => {
    if (!user || !convIdRef.current) return
    const optimistic: Message = {
      id:     `tmp-${Date.now()}`,
      text,
      sender: 'me',
      time:   new Date().toLocaleTimeString(locale === 'en' ? 'en-GB' : 'fr-FR', { hour: '2-digit', minute: '2-digit' }),
    }
    setMessages(prev => [...prev, optimistic])
    setSentCount(c => c + 1)

    const saved = await sendMessage(convIdRef.current, user.id, id, text)
    if (!saved) {
      setMessages(prev => prev.filter(m => m.id !== optimistic.id))
      setSentCount(c => Math.max(0, c - 1))
      toast.error(t('sendError'))
      return
    }
    setMessages(prev => prev.map(m => m.id === optimistic.id ? toUiMessage(saved, user.id, locale) : m))
    notifyByEmail(id, 'message', myFirstName || t('unknownMember'))
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
          {limitMessage ? 'Limite atteinte' : t('blockedTitle')}
        </p>
        <p className="text-gray-400 text-xs">
          {limitMessage ?? t('blockedDesc')}
        </p>
        <button
          onClick={() => router.push(limitMessage ? '/dashboard/premium' : `/dashboard/profil/${id}`)}
          className="mt-2 bg-[#10B981] text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-[#059669] transition-colors"
        >
          {limitMessage ? 'Passer Premium' : t('viewProfile')}
        </button>
      </div>
    )
  }

  if (!conv) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-400 text-sm">{t('notFound')}</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">

      {/* Rules bottom-sheet — affiché une seule fois par contact (persistance localStorage) */}
      {rulesChecked && !rulesAccepted && (
        <DiscussionRulesModal
          firstName={conv.firstName}
          lastInitial={conv.lastInitial}
          onConfirm={acceptRules}
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
