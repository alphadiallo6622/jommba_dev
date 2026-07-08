export type Conversation = {
  id: string
  firstName: string
  lastInitial: string
  photo: string
  lastMessage: string
  timeAgo: string
  isRead: boolean
  unreadCount: number
  isArchived: boolean
}

export type Message = {
  id: string
  text: string
  sender: 'me' | 'other'
  time: string
}

// ⚠ Nom historique — ne contient plus aucune donnée fictive (types uniquement).
// Les conversations et messages réels viennent de Supabase.
