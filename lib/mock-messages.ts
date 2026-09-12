export type Conversation = {
  id: string
  firstName: string
  lastInitial: string
  photo: string
  lastMessage: string
  /** Le dernier message est un vocal : la liste affiche un libellé dédié. */
  lastIsVoice?: boolean
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
  /** Vocal : chemin dans le bucket privé (l'URL signée est demandée à la lecture). */
  audioPath?: string | null
  /** Durée mesurée à l'enregistrement — les WebM de MediaRecorder n'ont pas
   *  toujours de métadonnée de durée, on ne peut pas la lire depuis le fichier. */
  audioDurationMs?: number | null
  /** Vocal en cours d'envoi : bulle affichée avant la fin de l'upload. */
  audioPending?: boolean
}

// ⚠ Nom historique — ne contient plus aucune donnée fictive (types uniquement).
// Les conversations et messages réels viennent de Supabase.
