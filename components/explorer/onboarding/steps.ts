import type { TourHighlight } from '@/store/explorer.store'

export type TourStep = {
  id: number
  title: string
  body: string
  buttonLabel: string
  highlight: TourHighlight
  buttonVariant: 'green' | 'amber'
}

export const TOUR_STEPS: TourStep[] = [
  {
    id: 1,
    title: 'Bienvenue sur Jommba ! 🌙',
    body: 'Découvrez comment trouver votre moitié en quelques gestes simples.',
    buttonLabel: 'Commencer →',
    highlight: 'none',
    buttonVariant: 'green',
  },
  {
    id: 2,
    title: 'Photos des membres',
    body: "C'est ici que vous verrez les photos des membres de la communauté.",
    buttonLabel: 'Suivant →',
    highlight: 'photo',
    buttonVariant: 'green',
  },
  {
    id: 3,
    title: 'Ajoutez en ami',
    body: "Intéressé ? Appuyez sur le bouton vert pour envoyer une demande. Si la personne accepte, vous pourrez discuter !",
    buttonLabel: 'Suivant →',
    highlight: 'add-btn',
    buttonVariant: 'green',
  },
  {
    id: 4,
    title: 'Message Flash ⚡',
    body: "Envoyez un message flash pour vous démarquer ! La personne le recevra même sans être connectée.",
    buttonLabel: 'Suivant →',
    highlight: 'flash-btn',
    buttonVariant: 'green',
  },
  {
    id: 5,
    title: "Vous êtes prêt ! 🎉",
    body: "Bonne découverte ! Que cette aventure vous mène vers une belle rencontre insha'Allah.",
    buttonLabel: "✓ C'est parti !",
    highlight: 'none',
    buttonVariant: 'amber',
  },
]

export const TOUR_STORAGE_KEY = 'jommba_explorer_tour_done'
