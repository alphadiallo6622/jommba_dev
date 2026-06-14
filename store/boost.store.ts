import { create } from 'zustand'

export type BoostOption = {
  id: string
  label: string
  duration: string
  price: string
}

type BoostStep = 1 | 2 | 3 | null

type BoostStore = {
  step: BoostStep
  selectedOption: BoostOption | null
  openBoost: () => void
  goToStep: (step: BoostStep) => void
  selectOption: (option: BoostOption) => void
  closeBoost: () => void
}

export const useBoostStore = create<BoostStore>((set) => ({
  step: null,
  selectedOption: null,
  openBoost:      ()       => set({ step: 1, selectedOption: null }),
  goToStep:       (step)   => set({ step }),
  selectOption:   (option) => set({ selectedOption: option, step: 3 }),
  closeBoost:     ()       => set({ step: null, selectedOption: null }),
}))
