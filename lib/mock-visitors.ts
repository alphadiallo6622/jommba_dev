export type Visitor = {
  id: string
  photo: string
  firstName: string
  lastInitial: string
  age: number
  city: string
  country: string
  hoursAgo: number
  isNew: boolean
}

// ⚠ Nom historique — ne contient plus aucune donnée fictive (type uniquement).
// Les visiteurs réels viennent de Supabase (profile_visitors).
