'use client'

import { MessageCircle, Heart, Eye, Star } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'

const items = [
  {
    icon: MessageCircle,
    labelKey: 'messages',
    subKey: 'messagesSub',
    iconBg: 'bg-pink-100',
    iconColor: 'text-pink-500',
    badge: null,
    href: '/dashboard/messages',
  },
  {
    icon: Heart,
    labelKey: 'requests',
    subKey: 'requestsSub',
    iconBg: 'bg-pink-100',
    iconColor: 'text-pink-500',
    badge: null,
    href: '/dashboard/demandes',
  },
  {
    icon: Eye,
    labelKey: 'visitors',
    subKey: 'visitorsSub',
    iconBg: 'bg-violet-100',
    iconColor: 'text-violet-500',
    badge: '!',
    href: '/dashboard/visiteurs',
  },
  {
    icon: Star,
    labelKey: 'favorites',
    subKey: 'favoritesSub',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-500',
    badge: null,
    href: '/dashboard/favoris',
  },
] as const

export default function QuickNav() {
  const router = useRouter()
  const t = useTranslations('dashboard.quickNav')

  return (
    <div className="bg-white rounded-xl p-3">
      <div className="grid grid-cols-4 gap-2">
        {items.map(({ icon: Icon, labelKey, subKey, iconBg, iconColor, badge, href }) => (
          <button
            key={labelKey}
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
              <p className="text-xs font-semibold text-gray-800">{t(labelKey)}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">{t(subKey)}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
