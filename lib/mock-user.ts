export type MockUser = {
  id: string
  firstName: string
  lastName: string
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
  dealbreakers: string
  languages: string
}

export const mockUserFree: MockUser = {
  id: 'user-abou-001',
  firstName: 'Abou',
  lastName: 'Diallo',
  age: 32,
  height: 180,
  city: 'Dakar',
  country: 'SN',
  email: 'abou.diallo@jommba.com',
  avatar: 'https://i.pravatar.cc/150?img=3',
  profileCompletion: 86,
  isPremium: false,
  isValidated: false,
  stats: { views: 0, visitors: 0, favorites: 0, requests: 0 },
  dailyRequests: { used: 0, total: 3 },
  tags: ['Célibataire', 'Comptable', 'Bac+3'],
  marriageVision: 'Je vois le mariage comme un projet de vie sérieux, fondé sur la religion et la confiance mutuelle.',
  seeking: 'Une femme pieuse, douce et sérieuse, avec qui construire une famille dans la bonne voie.',
  religion: { madhhab: 'Maliki', mosque: 'Régulièrement', arabic: 'Intermédiaire' },
  lifeProject: { hasChildren: 'Non', wantsChildren: 'Oui', canRelocate: 'À discuter', polygamy: 'Ouvert' },
  interests: 'Football, lecture islamique, voyages, cuisine.',
  qualities: 'Responsable, sincère, patient, attaché à mes valeurs.',
  dealbreakers: "La malhonnêteté et le manque de pudeur.",
  languages: 'Français, Wolof, Arabe (notions)',
}

export const mockUserPremium: MockUser = {
  id: 'user-alpha-001',
  firstName: 'Alpha',
  lastName: 'Diallo',
  age: 29,
  height: 175,
  city: 'Dakar',
  country: 'SN',
  email: 'alphadiallo2308@gmail.com',
  avatar: 'https://i.pravatar.cc/150?img=8',
  profileCompletion: 100,
  isPremium: true,
  isValidated: true,
  stats: { views: 247, visitors: 89, favorites: 34, requests: 12 },
  dailyRequests: { used: 3, total: 999 },
  tags: ['Célibataire', 'Ingénieur', 'Bac+5'],
  marriageVision: 'Le mariage est la moitié de la religion. Je cherche une compagne sincère avec qui bâtir une famille unie dans la foi et la bienveillance.',
  seeking: 'Une femme cultivée, pieuse et équilibrée, qui partage mes valeurs et mes projets de vie.',
  religion: { madhhab: 'Maliki', mosque: 'Régulièrement', arabic: 'Avancé' },
  lifeProject: { hasChildren: 'Non', wantsChildren: 'Oui', canRelocate: 'Oui', polygamy: 'Non' },
  interests: 'Lecture, sport, voyages halal, bénévolat, technologie.',
  qualities: 'Ambitieux, doux, respectueux, fiable et très attaché à la famille.',
  dealbreakers: "Le mensonge, le manque de respect et l'absence de pratique religieuse.",
  languages: 'Français, Wolof, Anglais, Arabe',
}

export const mockUsers: MockUser[] = [mockUserFree, mockUserPremium]

// Default export kept for backward compatibility — resolved by auth store at runtime
export const mockUser = mockUserFree

export const mockProfiles = [
  { id: 1,  name: 'Amy L.',         age: 24, city: 'Dakar',       job: 'Tailleur',                score: 100, img: 1,  isPremium: true  },
  { id: 2,  name: 'Khadidiatou S.', age: 25, city: 'Kafrrine',    job: 'Gestionnaire prestation',  score: 100, img: 5,  isPremium: true  },
  { id: 3,  name: 'Aichatou C.',    age: 19, city: 'Dieye',       job: 'Élève',                   score: 100, img: 9,  isPremium: true  },
  { id: 4,  name: 'Rokhaya N.',     age: 35, city: 'Dakar',       job: 'Commerçant',              score: 88,  img: 10, isPremium: false },
  { id: 5,  name: 'Linguere L.',    age: 28, city: 'Diourbel',    job: "Rien pour l'instant",     score: 90,  img: 12, isPremium: true  },
  { id: 6,  name: 'Ramatoulaye N.', age: 28, city: 'Dakar',       job: 'Étudiante',               score: 86,  img: 15, isPremium: false },
  { id: 7,  name: 'Mariama N.',     age: 22, city: 'Dakar',       job: 'Aide soignante',          score: 86,  img: 20, isPremium: false },
  { id: 8,  name: 'Rokhaya C.',     age: 33, city: 'Tambacounda', job: 'Nettoyage',               score: 84,  img: 25, isPremium: false },
  { id: 9,  name: 'Penda T.',       age: 23, city: 'Dakar',       job: 'Arts Graphiques',         score: 83,  img: 30, isPremium: false },
  { id: 10, name: 'Oumy M.',        age: 23, city: 'Dakar',       job: 'Commerce',                score: 83,  img: 35, isPremium: true  },
  { id: 11, name: 'Marietou D.',    age: 23, city: 'Dakar',       job: 'Étudiante',               score: 83,  img: 40, isPremium: false },
  { id: 12, name: 'Anta C.',        age: 31, city: 'Dakar',       job: "Professeure d'anglais",   score: 83,  img: 45, isPremium: false },
]
