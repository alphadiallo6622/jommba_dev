import {
  Eye, Search, MessageCircle, Wifi, Star, Zap, Clock,
  Bot, Mic, Camera, BadgeCheck,
  type LucideIcon,
} from 'lucide-react'

export type Plan = {
  id: string
  label: string
  discount: string
  pricePerMonth: string
  totalPrice: number
  boostBadge: string | null
  isPopular: boolean
  isRecommended: boolean
}

export type Feature = {
  icon: LucideIcon
  iconBg: string
  iconColor: string
  title: string
  description: string
  badge: { free: string; premium: string }
  isNew?: boolean
}

export type Testimonial = {
  daysLabel: string
  statusLabel: string
  quote: string
  author: string
  city: string
}

export type FAQ = {
  question: string
  answer: string
}

export const plans: Plan[] = [
  {
    id: '15j',
    label: 'Premium 15 Jours',
    discount: '-60%',
    pricePerMonth: '12 $/mois',
    totalPrice: 6,
    boostBadge: null,
    isPopular: false,
    isRecommended: false,
  },
  {
    id: '1m',
    label: 'Premium 1 Mois',
    discount: '-33%',
    pricePerMonth: '10 $/mois',
    totalPrice: 10,
    boostBadge: 'x3 boost',
    isPopular: true,
    isRecommended: true,
  },
  {
    id: '3m',
    label: 'Premium 3 Mois',
    discount: '-50%',
    pricePerMonth: '5 $/mois',
    totalPrice: 15,
    boostBadge: 'x5 boosts',
    isPopular: false,
    isRecommended: false,
  },
  {
    id: '6m',
    label: 'Premium 6 Mois',
    discount: '-58%',
    pricePerMonth: '4,17 $/mois',
    totalPrice: 25,
    boostBadge: 'x8 boosts',
    isPopular: false,
    isRecommended: false,
  },
]

export const features: Feature[] = [
  {
    icon: Eye,
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-500',
    title: "Vois qui t'a mis en favori",
    description: "Découvre toutes les personnes qui te trouvent intéressant(e). Le plus puissant signal d'intérêt.",
    badge: { free: 'Bloqué', premium: 'Débloqué' },
  },
  {
    icon: Search,
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-500',
    title: 'Découvre qui te repère',
    description: 'Identifie qui a cliqué sur votre profil. Fini les doutes.',
    badge: { free: 'Bloqué', premium: 'Débloqué' },
  },
  {
    icon: MessageCircle,
    iconBg: 'bg-green-100',
    iconColor: 'text-green-500',
    title: 'Contacts sans limite',
    description: 'Tu as Jommba sur un profil ? Tu peux le contacter, sans attendre demain.',
    badge: { free: 'Limité', premium: 'Illimité' },
  },
  {
    icon: Wifi,
    iconBg: 'bg-teal-100',
    iconColor: 'text-teal-500',
    title: 'Vois qui est connecté',
    description: 'Ton profil apparaît en temps réel. Écris au bon moment, reçois des réponses plus vite.',
    badge: { free: 'Bloqué', premium: 'Débloqué' },
    isNew: true,
  },
  {
    icon: Star,
    iconBg: 'bg-yellow-100',
    iconColor: 'text-yellow-500',
    title: 'Sois vu(e) en premier',
    description: "Ton profil apparaît en tête des recherches. Plus de visibilité, plus de chances.",
    badge: { free: 'Bloqué', premium: 'Débloqué' },
  },
  {
    icon: Zap,
    iconBg: 'bg-orange-100',
    iconColor: 'text-orange-500',
    title: 'Boosts de profil inclus',
    description: 'Propulse ton profil en première position pendant 24h. Boosts offerts selon ton abonnement.',
    badge: { free: 'Bloqué', premium: 'Débloqué' },
  },
  {
    icon: Clock,
    iconBg: 'bg-red-100',
    iconColor: 'text-red-500',
    title: 'Validation immédiate',
    description: "Ton compte est validé instantanément, sans attendre les 24h habituelles.",
    badge: { free: "Jusqu'à 24h", premium: 'Immédiate' },
  },
  {
    icon: Bot,
    iconBg: 'bg-indigo-100',
    iconColor: 'text-indigo-500',
    title: 'Coach Cheikh Abdallah illimité',
    description: "Pose toutes tes questions sur le mariage halal, la séduction, ton profil — IA t'accompagne 24h/24.",
    badge: { free: '1 personnalisé', premium: 'Illimité' },
  },
  {
    icon: Mic,
    iconBg: 'bg-pink-100',
    iconColor: 'text-pink-500',
    title: 'Messages vocaux',
    description: 'Fais sonner ta voix. Envoie des messages vocaux pour créer une connexion plus authentique.',
    badge: { free: 'Bloqué', premium: 'Débloqué' },
    isNew: true,
  },
  {
    icon: Camera,
    iconBg: 'bg-cyan-100',
    iconColor: 'text-cyan-500',
    title: 'Montre qui tu es vraiment',
    description: '3 photos pour donner ta personnalité, un profil complet attire 4x plus.',
    badge: { free: '1 seule', premium: '4 photos' },
  },
  {
    icon: BadgeCheck,
    iconBg: 'bg-green-100',
    iconColor: 'text-green-500',
    title: 'Badge de sérieux',
    description: "Le badge vert signale que tu es là pour de vrai. Ça filtre les curieux.",
    badge: { free: 'Bloqué', premium: 'Débloqué' },
  },
]

export const testimonials: Testimonial[] = [
  {
    daysLabel: '2 jours',
    statusLabel: 'En discussion',
    quote: "Avant Premium, mon profil était invisible. Dès le 2ème jour, j'ai vu 12 frères avaient visité mon profil. J'ai contacté celui qui revenait souvent.",
    author: 'Fatou N.',
    city: 'Dakar',
  },
  {
    daysLabel: '1 jour',
    statusLabel: 'Fiancée',
    quote: "Je n'y croyais plus vraiment, mais Jommba m'a surpris. En moins de 24h après le Premium, j'avais 3 contacts sérieux.",
    author: 'Aminata K.',
    city: 'Thiès',
  },
  {
    daysLabel: '3 jours',
    statusLabel: 'Marié',
    quote: "La validation immédiate m'a permis de démarrer rapidement. Le coach m'a beaucoup aidé à rédiger mon profil.",
    author: 'Ibrahim S.',
    city: 'Paris, FR',
  },
  {
    daysLabel: '5 jours',
    statusLabel: 'En discussion',
    quote: "Le badge de sérieux change tout. Les personnes qui m'écrivent sont vraiment là pour se marier.",
    author: 'Mariama D.',
    city: 'Abidjan',
  },
  {
    daysLabel: '7 jours',
    statusLabel: 'Fiancé',
    quote: "Grâce aux boosts inclus, mon profil est apparu en tête. J'ai eu 20 visites le premier jour.",
    author: 'Moussa B.',
    city: 'Dakar',
  },
]

export const faqs: FAQ[] = [
  {
    question: 'Quels modes de paiement sont acceptés ?',
    answer: 'Mobile Money (Orange Money, Free Money, Wave) et Carte bancaire (Visa, Mastercard). Paiement sécurisé via Bissrys & PayTech.',
  },
  {
    question: 'Mon paiement est-il sécurisé ?',
    answer: 'Oui, 100%. Nous utilisons des prestataires certifiés. Vos données bancaires ne sont jamais stockées sur nos serveurs.',
  },
  {
    question: 'Puis-je annuler mon abonnement ?',
    answer: "Oui, à tout moment depuis les Paramètres → Abonnement → Annuler. Vous conservez vos avantages jusqu'à la fin de la période payée.",
  },
  {
    question: 'Comment fonctionne le renouvellement ?',
    answer: "Le renouvellement est automatique sauf si vous annulez avant la date de renouvellement.",
  },
  {
    question: 'Combien de temps pour voir des résultats ?',
    answer: "La plupart des membres Premium reçoivent des contacts dans les 24-48h suivant l'activation.",
  },
  {
    question: 'Puis-je faire confiance à Jommba ?',
    answer: 'Jommba est une plateforme sérieuse et vérifiée. Tous les profils sont validés manuellement par notre équipe.',
  },
  {
    question: 'Que se passe-t-il si je ne trouve personne ?',
    answer: "Nos conseillers sont disponibles pour t'accompagner. Le coach IA est inclus dans le Premium pour te guider.",
  },
]
