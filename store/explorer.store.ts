import { create } from 'zustand'
import type { ExplorerProfile } from '@/lib/mock-explorer'

export type TourHighlight = 'none' | 'photo' | 'add-btn' | 'flash-btn'

type ExplorerStore = {
  mode: 'swipe' | 'grid'
  profiles: ExplorerProfile[]
  grillUsesLeft: number
  currentProfileIndex: number
  filtersOpen: boolean
  activeFilters: string[]
  showPremiumModal: boolean
  tourHighlight: TourHighlight

  setMode: (mode: 'swipe' | 'grid') => void
  setProfiles: (profiles: ExplorerProfile[]) => void
  decrementGrillUses: () => void
  nextProfile: (total: number) => void
  toggleFilter: (filter: string) => void
  setFiltersOpen: (open: boolean) => void
  setShowPremiumModal: (show: boolean) => void
  setTourHighlight: (h: TourHighlight) => void
}

export const useExplorerStore = create<ExplorerStore>()((set) => ({
  mode: 'swipe',
  profiles: [],
  grillUsesLeft: 5,
  currentProfileIndex: 0,
  filtersOpen: false,
  activeFilters: [],
  showPremiumModal: false,
  tourHighlight: 'none',

  setMode: (mode) => set({ mode }),
  setProfiles: (profiles) => set({ profiles, currentProfileIndex: 0 }),
  decrementGrillUses: () => set((s) => ({ grillUsesLeft: Math.max(0, s.grillUsesLeft - 1) })),
  nextProfile: (total) => set((s) => ({ currentProfileIndex: (s.currentProfileIndex + 1) % total })),
  toggleFilter: (filter) => set((s) => ({
    activeFilters: s.activeFilters.includes(filter)
      ? s.activeFilters.filter(f => f !== filter)
      : [...s.activeFilters, filter],
  })),
  setFiltersOpen: (open) => set({ filtersOpen: open }),
  setShowPremiumModal: (show) => set({ showPremiumModal: show }),
  setTourHighlight: (h) => set({ tourHighlight: h }),
}))
