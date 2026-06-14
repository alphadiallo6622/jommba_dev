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

export const mockConversations: Conversation[] = [
  {
    id: 'conv-001',
    firstName: 'Fatima',
    lastInitial: 'S',
    photo: 'https://i.pravatar.cc/150?img=5',
    lastMessage: 'Démarrez la conversation...',
    timeAgo: 'Il y a 11h',
    isRead: true,
    unreadCount: 0,
    isArchived: false,
  },
]

export const mockMessages: Record<string, Message[]> = {
  'conv-001': [],
}

export const MOCK_AUTO_REPLIES = [
  'Wa alaykum salam 🙏',
  'Alhamdulillah, merci pour ton message',
  "In sha Allah on pourra en discuter",
  'Barak Allahu fik',
]
