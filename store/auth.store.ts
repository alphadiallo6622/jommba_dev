import { create } from 'zustand'
import { EMPTY_USER, type MockUser } from '@/lib/mock-user'

// Le store démarre avec un utilisateur NEUTRE (aucune donnée fictive) pendant
// que ProfileInitializer charge le vrai profil depuis Supabase.
// Après chargement, currentUser contient les données réelles de la BDD.

type AuthStore = {
  currentUser: MockUser
  isProfileLoaded: boolean
  setCurrentUser: (user: MockUser) => void
  logout: () => void
}

export const useAuthStore = create<AuthStore>()((set) => ({
  currentUser: EMPTY_USER,
  isProfileLoaded: false,
  setCurrentUser: (user) => set({ currentUser: user, isProfileLoaded: true }),
  logout: () => set({ currentUser: EMPTY_USER, isProfileLoaded: false }),
}))
