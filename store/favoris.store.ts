import { create } from 'zustand'
import type { ExplorerProfile } from '@/lib/mock-explorer'

export type FavoriteEntry = {
  profile: ExplorerProfile
  addedAt: string
}

type FavorisStore = {
  favorites: FavoriteEntry[]
  hydrate:        (entries: FavoriteEntry[]) => void
  addFavorite:    (profile: ExplorerProfile) => void
  removeFavorite: (id: string) => void
  isFavorite:     (id: string) => boolean
}

export const useFavorisStore = create<FavorisStore>()((set, get) => ({
  favorites: [],

  // Remplace le contenu du store par les favoris chargés depuis Supabase
  hydrate: (entries) => set({ favorites: entries }),

  addFavorite: (profile) => {
    if (get().isFavorite(profile.id)) return
    set((s) => ({
      favorites: [...s.favorites, { profile, addedAt: new Date().toISOString() }],
    }))
  },

  removeFavorite: (id) =>
    set((s) => ({ favorites: s.favorites.filter((f) => f.profile.id !== id) })),

  isFavorite: (id) => get().favorites.some((f) => f.profile.id === id),
}))
