import { create } from 'zustand'
import type { ExplorerProfile } from '@/lib/mock-explorer'

export type FavoriteEntry = {
  profile: ExplorerProfile
  addedAt: string
}

type FavorisStore = {
  favorites: FavoriteEntry[]
  addFavorite:    (profile: ExplorerProfile) => void
  removeFavorite: (id: number) => void
  isFavorite:     (id: number) => boolean
}

export const useFavorisStore = create<FavorisStore>()((set, get) => ({
  favorites: [],

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
