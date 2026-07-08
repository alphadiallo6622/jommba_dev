// lib/mock-user.ts
// ⚠ Nom historique — ne contient plus aucune donnée fictive.
// Définit la forme du profil courant (MockUser, nom conservé pour éviter un
// renommage massif) et un utilisateur NEUTRE utilisé comme état initial du
// store le temps que ProfileInitializer hydrate le vrai profil Supabase.

export type MockUser = {
  id: string
  firstName: string
  lastName: string
  gender: 'homme' | 'femme' | null
  age: number
  height: number
  city: string
  country: string
  avatar: string
  profileCompletion: number
  isPremium: boolean
  isValidated: boolean
  email: string
  stats: { views: number; visitors: number; favorites: number; requests: number }
  dailyRequests: { used: number; total: number }
  tags: string[]
  marriageVision: string
  seeking: string
  religion: { madhhab: string; mosque: string; arabic: string }
  lifeProject: { hasChildren: string; wantsChildren: string; canRelocate: string; polygamy: string }
  interests: string
  qualities: string
  flaws: string
  dealbreakers: string
  languages: string
  visibility: 'active' | 'pause' | 'discussion'
}

// État initial vide — aucune fausse identité ne doit jamais s'afficher.
export const EMPTY_USER: MockUser = {
  id: '',
  firstName: '',
  lastName: '',
  gender: null,
  age: 0,
  height: 0,
  city: '',
  country: '',
  email: '',
  avatar: '/avatar-placeholder.svg',
  profileCompletion: 0,
  isPremium: false,
  isValidated: false,
  stats: { views: 0, visitors: 0, favorites: 0, requests: 0 },
  dailyRequests: { used: 0, total: 0 },
  tags: [],
  marriageVision: '',
  seeking: '',
  religion: { madhhab: '', mosque: '', arabic: '' },
  lifeProject: { hasChildren: '', wantsChildren: '', canRelocate: '', polygamy: '' },
  interests: '',
  qualities: '',
  flaws: '',
  dealbreakers: '',
  languages: '',
  visibility: 'active',
}
