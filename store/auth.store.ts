import { create } from 'zustand'
import { mockUserFree, type MockUser } from '@/lib/mock-user'

// Le store est initialisé avec mockUserFree comme fallback pendant
// que ProfileInitializer charge le vrai profil depuis Supabase.
// Après chargement, currentUser contient les données réelles de la BDD.

type AuthStore = {
  currentUser: MockUser
  isProfileLoaded: boolean
  setCurrentUser: (user: MockUser) => void
  logout: () => void
}

export const useAuthStore = create<AuthStore>()((set) => ({
  currentUser: mockUserFree,
  isProfileLoaded: false,
  setCurrentUser: (user) => set({ currentUser: user, isProfileLoaded: true }),
  logout: () => set({ currentUser: mockUserFree, isProfileLoaded: false }),
}))
