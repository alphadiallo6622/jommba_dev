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

// ⚠ Nom historique — ne contient plus aucune donnée fictive (types uniquement).
// Les notifications réelles viennent de Supabase (table notifications).
