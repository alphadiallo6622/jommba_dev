export type ReceivedRequest = {
  id: string
  firstName: string
  lastInitial: string
  age: number
  photo: string
  city: string
  timeAgo: string
  isNew: boolean
}

export type SentRequest = {
  id: string
  firstName: string
  lastInitial: string
  age: number
  photo: string
  timeAgo: string
  status: 'en-attente' | 'acceptee' | 'refusee'
}

export type ContactEntry = {
  id: string
  firstName: string
  lastInitial: string
  age: number
  photo: string
  city: string
  timeAgo: string
}

export type FullProfile = {
  id: string
  firstName: string
  age: number
  photo: string
  isPhotoBlurred: boolean
  isPremium: boolean
  location: string
  tags: string[]
  requestStatus: 'en-attente' | 'acceptee' | 'refusee' | 'none' | 'incoming'
  marriageVision: string
  seeking: string
  religion: { madhhab: string; mosque: string; arabic: string }
  lifeProject: { hasChildren: string; wantsChildren: string; canRelocate: string; polygamy: string }
  interests: string
  qualities: string
  flaws: string
  dealbreakers: string
  languages: string
}

// ⚠ Nom historique — ne contient plus aucune donnée fictive (types uniquement).
// Les données réelles viennent de Supabase (likes, conversations, profiles).
