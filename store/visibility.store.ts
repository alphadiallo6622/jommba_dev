import { create } from 'zustand'

export type VisibilityMode = 'actif' | 'pause' | 'discussion'

type VisibilityStore = {
  mode: VisibilityMode
  setMode: (mode: VisibilityMode) => void
}

export const useVisibilityStore = create<VisibilityStore>((set) => ({
  mode: 'actif',
  setMode: (mode) => set({ mode }),
}))
