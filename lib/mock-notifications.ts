export type NotifType = 'demande' | 'decline' | 'profil' | 'message' | 'visite' | 'premium'

export type Notification = {
  id: string
  type: NotifType
  title: string
  description: string
  date: string
  isRead: boolean
  targetId?: string
}

export const mockNotifications: Notification[] = [
  {
    id: 'notif-1',
    type: 'demande',
    title: 'Nouvelle demande reçue',
    description: 'Mamy B., 27 ans · Dakar, souhaite te contacter.',
    date: 'Il y a 10 min',
    isRead: false,
    targetId: 'profile-mamy',
  },
  {
    id: 'notif-2',
    type: 'demande',
    title: 'Nouvelle demande reçue',
    description: 'Rokhaya T., 31 ans · Thiès, a envoyé une demande.',
    date: 'Il y a 2h',
    isRead: false,
    targetId: 'profile-rokhaya',
  },
  {
    id: 'notif-3',
    type: 'visite',
    title: 'Ton profil a été visité',
    description: "Quelqu'un a consulté ton profil récemment.",
    date: 'Il y a 3h',
    isRead: false,
  },
  {
    id: 'notif-4',
    type: 'message',
    title: 'Nouveau message',
    description: "Fatima S. t'a envoyé un message.",
    date: 'Il y a 11h',
    isRead: false,
    targetId: 'conv-001',
  },
  {
    id: 'notif-5',
    type: 'decline',
    title: 'Demande déclinée',
    description: "Soxna S. n'a pas retenu ta demande.",
    date: 'Hier',
    isRead: true,
  },
  {
    id: 'notif-6',
    type: 'profil',
    title: 'Profil validé ✓',
    description: "Félicitations ! Ton profil a été validé par l'équipe Jommba.",
    date: 'Il y a 2 jours',
    isRead: true,
    targetId: 'user-abou-001',
  },
  {
    id: 'notif-7',
    type: 'premium',
    title: 'Passe à Premium',
    description: 'Booste ta visibilité et accède à plus de profils.',
    date: 'Il y a 3 jours',
    isRead: true,
  },
]
