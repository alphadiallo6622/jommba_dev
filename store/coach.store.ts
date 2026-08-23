import { create } from 'zustand'

export type ChatMessage = {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

type CoachStore = {
  isOpen: boolean
  isMinimized: boolean
  messages: ChatMessage[]
  isLoading: boolean
  openCoach: () => void
  closeCoach: () => void
  toggleMinimize: () => void
  addMessage: (msg: ChatMessage) => void
  setLoading: (loading: boolean) => void
  updateLastMessage: (content: string) => void
}

const getTime = () =>
  new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })

// Le contenu du message d'accueil est rendu depuis les traductions dans
// CoachModal (repéré par son id) : le store est créé hors de React et n'a donc
// pas accès à la locale.
const welcomeMessage: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  content: '',
  timestamp: getTime(),
}

export const useCoachStore = create<CoachStore>((set) => ({
  isOpen: false,
  isMinimized: false,
  messages: [welcomeMessage],
  isLoading: false,
  openCoach:          ()        => set({ isOpen: true, isMinimized: false }),
  closeCoach:         ()        => set({ isOpen: false }),
  toggleMinimize:     ()        => set(s => ({ isMinimized: !s.isMinimized })),
  addMessage:         (msg)     => set(s => ({ messages: [...s.messages, msg] })),
  setLoading:         (loading) => set({ isLoading: loading }),
  updateLastMessage:  (content) => set(s => ({
    messages: s.messages.map((m, i) =>
      i === s.messages.length - 1 ? { ...m, content } : m
    ),
  })),
}))
