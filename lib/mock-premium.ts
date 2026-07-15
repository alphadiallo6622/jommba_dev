import {
  Eye, Search, MessageCircle, Wifi, Star, Zap, Clock,
  Bot, Mic, Camera, BadgeCheck,
  type LucideIcon,
} from 'lucide-react'

// Structure uniquement (icônes, couleurs, ids, prix). Les libellés
// (titres, descriptions, badges, plans, avis, FAQ) sont traduits
// (dashboard.premium.*) et résolus dans les composants via next-intl,
// par index/id correspondant à cet ordre.

export type PlanMeta = {
  id: string
  discount: string
  totalPrice: number
  isPopular: boolean
  isRecommended: boolean
}

export type FeatureMeta = {
  icon: LucideIcon
  iconBg: string
  iconColor: string
  isNew?: boolean
}

export const plans: PlanMeta[] = [
  { id: '15j', discount: '-60%', totalPrice: 6,  isPopular: false, isRecommended: false },
  { id: '1m',  discount: '-33%', totalPrice: 10, isPopular: true,  isRecommended: true  },
  { id: '3m',  discount: '-50%', totalPrice: 15, isPopular: false, isRecommended: false },
  { id: '6m',  discount: '-58%', totalPrice: 25, isPopular: false, isRecommended: false },
]

export const features: FeatureMeta[] = [
  { icon: Eye,          iconBg: 'bg-blue-100',   iconColor: 'text-blue-500'   },
  { icon: Search,       iconBg: 'bg-purple-100', iconColor: 'text-purple-500' },
  { icon: MessageCircle,iconBg: 'bg-green-100',  iconColor: 'text-green-500'  },
  { icon: Wifi,         iconBg: 'bg-teal-100',   iconColor: 'text-teal-500', isNew: true },
  { icon: Star,         iconBg: 'bg-yellow-100', iconColor: 'text-yellow-500' },
  { icon: Zap,          iconBg: 'bg-orange-100', iconColor: 'text-orange-500' },
  { icon: Clock,        iconBg: 'bg-red-100',    iconColor: 'text-red-500'    },
  { icon: Bot,          iconBg: 'bg-indigo-100', iconColor: 'text-indigo-500' },
  { icon: Mic,          iconBg: 'bg-pink-100',   iconColor: 'text-pink-500', isNew: true },
  { icon: Camera,       iconBg: 'bg-cyan-100',   iconColor: 'text-cyan-500'   },
  { icon: BadgeCheck,   iconBg: 'bg-green-100',  iconColor: 'text-green-500'  },
]
