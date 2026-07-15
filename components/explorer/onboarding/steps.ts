import type { TourHighlight } from '@/store/explorer.store'

// Métadonnées d'étape (structure). Les libellés sont traduits
// (dashboard.explorer.tour.stepN*) et résolus dans OnboardingGuide.tsx.
export type TourStepMeta = {
  id: number
  highlight: TourHighlight
  buttonVariant: 'green' | 'amber'
}

// Étape résolue (avec libellés traduits) passée à TourModal.
export type TourStep = TourStepMeta & {
  title: string
  body: string
  buttonLabel: string
}

export const TOUR_STEPS: TourStepMeta[] = [
  { id: 1, highlight: 'none',      buttonVariant: 'green' },
  { id: 2, highlight: 'photo',     buttonVariant: 'green' },
  { id: 3, highlight: 'add-btn',   buttonVariant: 'green' },
  { id: 4, highlight: 'flash-btn', buttonVariant: 'green' },
  { id: 5, highlight: 'none',      buttonVariant: 'amber' },
]

export const TOUR_STORAGE_KEY = 'jommba_explorer_tour_done'
