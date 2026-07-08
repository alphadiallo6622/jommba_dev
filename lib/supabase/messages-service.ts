'use client'

import { createClient } from './client'
import type { Conversation as DbConversation, Message as DbMessage } from './types'

// Entrée enrichie pour la liste des conversations (côté UI)
export type ConversationListEntry = {
  conversationId: string
  otherUserId:    string
  firstName:      string
  lastInitial:    string
  photo:          string
  lastMessage:    string
  lastMessageAt:  string | null
  isRead:         boolean
  unreadCount:    number
}

// La contrainte unique porte sur (participant_1, participant_2) : on normalise
// l'ordre de la paire pour éviter les doublons (A,B) / (B,A).
function orderPair(a: string, b: string): [string, string] {
  return a < b ? [a, b] : [b, a]
}

// Vérifie que les deux membres sont en contact (demande acceptée) —
// règle métier Jommba : pas de messagerie sans accord mutuel.
export async function areContacts(myId: string, otherId: string): Promise<boolean> {
  const supabase = createClient()
  const { data } = await supabase
    .from('likes')
    .select('id')
    .eq('type', 'request')
    .eq('status', 'accepted')
    .or(`and(sender_id.eq.${myId},receiver_id.eq.${otherId}),and(sender_id.eq.${otherId},receiver_id.eq.${myId})`)
    .limit(1)
  return (data ?? []).length > 0
}

export async function getOrCreateConversation(myId: string, otherId: string): Promise<DbConversation | null> {
  const supabase = createClient()
  const [p1, p2] = orderPair(myId, otherId)

  const { data: existing } = await supabase
    .from('conversations')
    .select('*')
    .eq('participant_1', p1)
    .eq('participant_2', p2)
    .maybeSingle()
  if (existing) return existing as DbConversation

  const { data: created, error } = await supabase
    .from('conversations')
    .insert({ participant_1: p1, participant_2: p2, last_message_at: null })
    .select()
    .single()

  if (error) {
    // Course possible : l'autre participant vient de la créer
    const { data: retry } = await supabase
      .from('conversations')
      .select('*')
      .eq('participant_1', p1)
      .eq('participant_2', p2)
      .maybeSingle()
    return (retry as DbConversation) ?? null
  }
  return created as DbConversation
}

export async function fetchMessages(conversationId: string): Promise<DbMessage[]> {
  const supabase = createClient()
  const { data } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })
  return (data ?? []) as DbMessage[]
}

export async function sendMessage(
  conversationId: string,
  senderId: string,
  receiverId: string,
  content: string,
): Promise<DbMessage | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('messages')
    .insert({ conversation_id: conversationId, sender_id: senderId, receiver_id: receiverId, content, is_read: false })
    .select()
    .single()
  return error ? null : (data as DbMessage)
}

// Marque comme lus tous les messages reçus dans la conversation.
export async function markConversationRead(conversationId: string, myId: string): Promise<void> {
  const supabase = createClient()
  await supabase
    .from('messages')
    .update({ is_read: true })
    .eq('conversation_id', conversationId)
    .eq('receiver_id', myId)
    .eq('is_read', false)
}

function formatTimeAgo(dateStr: string | null): string {
  if (!dateStr) return ''
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (diff < 60)     return "À l'instant"
  if (diff < 3600)   return `Il y a ${Math.floor(diff / 60)} min`
  if (diff < 86400)  return `Il y a ${Math.floor(diff / 3600)} h`
  if (diff < 172800) return 'Hier'
  return `Il y a ${Math.floor(diff / 86400)} j`
}

export { formatTimeAgo }

// Liste des conversations avec profil de l'autre participant,
// dernier message et nombre de non-lus.
export async function fetchConversationList(myId: string): Promise<ConversationListEntry[]> {
  const supabase = createClient()

  const { data: convs } = await supabase
    .from('conversations')
    .select('*')
    .order('last_message_at', { ascending: false, nullsFirst: false })
  const conversations = (convs ?? []) as DbConversation[]
  if (conversations.length === 0) return []

  const convIds  = conversations.map(c => c.id)
  const otherIds = [...new Set(conversations.map(c => c.participant_1 === myId ? c.participant_2 : c.participant_1))]

  type ProfileRow = { user_id: string; first_name: string; last_name: string | null; avatar_url: string | null }
  const [{ data: profiles }, { data: lastMsgs }, { data: unread }] = await Promise.all([
    supabase.from('profiles')
      .select('user_id, first_name, last_name, avatar_url')
      .in('user_id', otherIds),
    supabase.from('messages')
      .select('conversation_id, content, created_at')
      .in('conversation_id', convIds)
      .order('created_at', { ascending: false })
      .limit(300),
    supabase.from('messages')
      .select('conversation_id')
      .in('conversation_id', convIds)
      .eq('receiver_id', myId)
      .eq('is_read', false),
  ])

  const profileMap = new Map<string, ProfileRow>()
  for (const p of (profiles ?? []) as ProfileRow[]) profileMap.set(p.user_id, p)

  const lastMsgMap = new Map<string, { content: string; created_at: string }>()
  for (const m of (lastMsgs ?? []) as { conversation_id: string; content: string; created_at: string }[]) {
    if (!lastMsgMap.has(m.conversation_id)) lastMsgMap.set(m.conversation_id, m)
  }

  const unreadMap = new Map<string, number>()
  for (const m of (unread ?? []) as { conversation_id: string }[]) {
    unreadMap.set(m.conversation_id, (unreadMap.get(m.conversation_id) ?? 0) + 1)
  }

  return conversations.map(c => {
    const otherId = c.participant_1 === myId ? c.participant_2 : c.participant_1
    const p       = profileMap.get(otherId)
    const last    = lastMsgMap.get(c.id)
    const nUnread = unreadMap.get(c.id) ?? 0
    return {
      conversationId: c.id,
      otherUserId:    otherId,
      firstName:      p?.first_name ?? '…',
      lastInitial:    (p?.last_name ?? '').charAt(0) || '?',
      photo:          p?.avatar_url ?? '/avatar-placeholder.svg',
      lastMessage:    last?.content ?? 'Démarrez la conversation...',
      lastMessageAt:  last?.created_at ?? c.last_message_at,
      isRead:         nUnread === 0,
      unreadCount:    nUnread,
    }
  })
}
