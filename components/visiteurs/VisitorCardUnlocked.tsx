'use client'

import { useRouter } from 'next/navigation'
import { Clock, MapPin } from 'lucide-react'
import { useTranslations } from 'next-intl'
import type { Visitor } from '@/lib/mock-visitors'
import { formatHoursAgo } from '@/lib/format-time-ago'

interface Props {
  visitor: Visitor
}

export default function VisitorCardUnlocked({ visitor }: Props) {
  const router = useRouter()
  const t = useTranslations('dashboard.visiteurs')
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
      {/* Normal photo */}
      <div className="relative">
        <img
          src={visitor.photo}
          alt={visitor.firstName}
          className="w-full aspect-[3/4] object-cover"
        />
        {/* Time badge */}
        <span className="absolute top-2 right-2 bg-emerald-900 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {formatHoursAgo(visitor.hoursAgo, t)}
        </span>
        {/* New badge */}
        {visitor.isNew && (
          <span className="absolute bottom-2 left-2 bg-emerald-500 text-white text-xs px-2 py-1 rounded-full font-medium">
            {t('new')}
          </span>
        )}
      </div>

      {/* Visible info */}
      <div className="p-3">
        <p className="text-gray-800 text-sm font-semibold">
          {visitor.firstName} {visitor.lastInitial}., {visitor.age}
        </p>
        <p className="text-gray-400 text-xs mt-0.5 flex items-center gap-1">
          <MapPin className="w-3 h-3" />
          {visitor.city}, {visitor.country}
        </p>

        {/* View profile button */}
        <button
          onClick={() => router.push(`/dashboard/profil/${visitor.id}`)}
          className="w-full mt-3 bg-emerald-500 text-white text-sm font-medium py-2 rounded-lg flex items-center justify-center gap-1 hover:bg-emerald-600 transition-colors"
        >
          {t('viewProfile')}
        </button>
      </div>
    </div>
  )
}
