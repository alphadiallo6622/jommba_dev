export type ReceivedRequest = {
  id: number
  firstName: string
  lastInitial: string
  age: number
  photo: string
  city: string
  timeAgo: string
  isNew: boolean
}

export type SentRequest = {
  id: number
  firstName: string
  lastInitial: string
  age: number
  photo: string
  timeAgo: string
  status: 'en-attente' | 'acceptee' | 'refusee'
}

export type ContactEntry = {
  id: number
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

export const mockRecues: ReceivedRequest[] = [
  {
    id: 1,
    firstName: 'Diatou', lastInitial: 'S', age: 25,
    photo: 'https://i.pravatar.cc/150?img=5',
    city: 'Dakar', timeAgo: 'Hier', isNew: true,
  },
]

export const mockEnvoyees: SentRequest[] = [
  {
    id: 2,
    firstName: 'Soxna', lastInitial: 'S', age: 29,
    photo: 'https://i.pravatar.cc/150?img=8',
    timeAgo: 'Il y a 1h',
    status: 'refusee',
  },
]

export const mockContacts: ContactEntry[] = []

export const mockProfiles: Record<string, FullProfile> = {
  '2': {
    id: '2',
    firstName: 'Soxna', age: 29,
    photo: 'https://i.pravatar.cc/400?img=8',
    isPhotoBlurred: true,
    isPremium: true,
    location: 'Diaspora FR • Originaire SN Sénégal',
    tags: ['Célibataire', 'Finance', 'Autre'],
    requestStatus: 'refusee',
    marriageVision: 'Je vois le mariage comme un refuge où grandir spirituellement à deux, dans la douceur et la confiance.',
    seeking: 'Je cherche un homme responsable et respectueux, avec des intentions pures, fondé sur la religion.',
    religion: { madhhab: 'Maliki', mosque: 'Occasionnellement', arabic: 'Intermédiaire' },
    lifeProject: { hasChildren: 'Non', wantsChildren: 'Oui', canRelocate: 'À discuter', polygamy: "N'accepte pas" },
    interests: "J'aime la lecture, la religion c'est mon ataraxie et j'aime aussi cuisiner.",
    qualities: "Je suis sincère, authentique, entière, bienveillante, à l'écoute.",
    flaws: '',
    dealbreakers: "Le manque de respect et l'injustice",
    languages: 'Français, Anglais, Wolof',
  },
  '1': {
    id: '1',
    firstName: 'Diatou', age: 25,
    photo: 'https://i.pravatar.cc/400?img=5',
    isPhotoBlurred: false,
    isPremium: false,
    location: 'SN Dakar, Sénégal',
    tags: ['Célibataire', 'Commerce', 'Étudiante'],
    requestStatus: 'incoming',
    marriageVision: "Le mariage est un acte d'adoration, je le veux sincère et ancré dans la foi.",
    seeking: 'Un homme pieux, sérieux et attentionné, prêt à construire une famille.',
    religion: { madhhab: 'Maliki', mosque: 'Régulièrement', arabic: 'Débutant' },
    lifeProject: { hasChildren: 'Non', wantsChildren: 'Oui', canRelocate: 'Oui', polygamy: 'Non' },
    interests: 'Commerce, cuisine, lectures islamiques.',
    qualities: 'Sérieuse, douce, travailleuse.',
    flaws: '',
    dealbreakers: "La malhonnêteté",
    languages: 'Français, Wolof',
  },
  'profile-mamy': {
    id: 'profile-mamy',
    firstName: 'Mamy', age: 27,
    photo: 'https://i.pravatar.cc/400?img=25',
    isPhotoBlurred: false,
    isPremium: false,
    location: 'SN Dakar, Sénégal',
    tags: ['Célibataire', 'Enseignante', 'Bac+3'],
    requestStatus: 'incoming',
    marriageVision: 'Je cherche un mariage basé sur la sérénité, la foi et la confiance.',
    seeking: 'Un homme stable, pratiquant et attentionné.',
    religion: { madhhab: 'Maliki', mosque: 'Régulièrement', arabic: 'Débutant' },
    lifeProject: { hasChildren: 'Non', wantsChildren: 'Oui', canRelocate: 'Non', polygamy: 'Non' },
    interests: 'Lecture, pédagogie, jardinage.',
    qualities: 'Patiente, douce, organisée.',
    flaws: '',
    dealbreakers: 'Le manque de sincérité',
    languages: 'Français, Wolof',
  },
  'profile-rokhaya': {
    id: 'profile-rokhaya',
    firstName: 'Rokhaya', age: 31,
    photo: 'https://i.pravatar.cc/400?img=30',
    isPhotoBlurred: true,
    isPremium: true,
    location: 'SN Thiès, Sénégal',
    tags: ['Célibataire', 'Commerce', 'Divorcée'],
    requestStatus: 'incoming',
    marriageVision: 'Un foyer islamique solide, construit sur la miséricorde et la transparence.',
    seeking: 'Un homme mature, responsable et respectueux.',
    religion: { madhhab: 'Maliki', mosque: 'Occasionnellement', arabic: 'Notions' },
    lifeProject: { hasChildren: 'Oui', wantsChildren: 'Oui', canRelocate: 'À discuter', polygamy: "N'accepte pas" },
    interests: 'Commerce, cuisine, famille.',
    qualities: 'Déterminée, bienveillante, indépendante.',
    flaws: '',
    dealbreakers: "L'instabilité et le mensonge",
    languages: 'Français, Wolof, Sérère',
  },
}
