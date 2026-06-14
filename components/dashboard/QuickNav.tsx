'use client'

import { MessageCircle, Heart, Eye, Star } from 'lucide-react'
import { useRouter } from 'next/navigation'

const items = [
  {
    icon: MessageCircle,
    label: 'Messages',
    sub: 'Conversations',
    iconBg: 'bg-pink-100',
    iconColor: 'text-pink-500',
    badge: null,
    href: '/dashboard/messages',
  },
  {
    icon: Heart,
    label: 'Demandes',
    sub: 'Reçues',
    iconBg: 'bg-pink-100',
    iconColor: 'text-pink-500',
    badge: null,
    href: '/dashboard/demandes',
  },
  {
    icon: Eye,
    label: 'Visiteurs',
    sub: 'Premium',
    iconBg: 'bg-violet-100',
    iconColor: 'text-violet-500',
    badge: '!',
    href: '/dashboard/visiteurs',
  },
  {
    icon: Star,
    label: 'Favoris',
    sub: 'Mes coups de ♥',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-500',
    badge: null,
    href: '/dashboard/favoris',
  },
]

export default function QuickNav() {
  const router = useRouter()

  return (
    <div className="bg-white rounded-xl p-3">
      <div className="grid grid-cols-4 gap-2">
        {items.map(({ icon: Icon, label, sub, iconBg, iconColor, badge, href }) => (
          <button
            key={label}
            onClick={() => router.push(href)}
            className="flex flex-col items-center gap-2 py-3 px-1 rounded-xl hover:bg-gray-50 transition-colors duration-200 relative"
          >
            <div className={`relative w-10 h-10 rounded-full ${iconBg} flex items-center justify-center`}>
              <Icon className={`w-5 h-5 ${iconColor}`} />
              {badge && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-orange-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {badge}
                </span>
              )}
            </div>
            <div className="text-center">
              <p className="text-xs font-semibold text-gray-800">{label}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">{sub}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
