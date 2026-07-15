'use client'

import { MapPin, Clock, X, Check } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { ReceivedRequest } from '@/lib/mock-demandes'

type Props = {
  request: ReceivedRequest
  onAccept: (id: string) => void
  onRefuse: (id: string) => void
}

export default function ReceivedRequestCard({ request, onAccept, onRefuse }: Props) {
  const router = useRouter()
  const t = useTranslations('dashboard.demandes')

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
      <button
        className="flex items-center gap-3 mb-4 w-full text-left"
        onClick={() => router.push(`/dashboard/profil/${request.id}`)}
      >
        <img
          src={request.photo}
          alt={request.firstName}
          className="w-12 h-12 rounded-full object-cover"
        />
        <div className="flex-1">
          <p className="font-semibold text-gray-900">
            {request.firstName} {request.lastInitial}., {request.age}
          </p>
          <div className="flex items-center gap-3 text-gray-400 text-xs mt-1">
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" /> {request.city}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" /> {request.timeAgo}
            </span>
          </div>
        </div>
        {request.isNew && (
          <span className="bg-[#10B981] text-white text-xs px-2 py-1 rounded-full font-medium shrink-0">
            {t('newBadge')}
          </span>
        )}
      </button>

      <div className="flex gap-3">
        <button
          onClick={() => onRefuse(request.id)}
          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border border-gray-200 text-gray-500 text-sm hover:bg-gray-50 transition-colors"
        >
          <X className="w-4 h-4" /> {t('refuse')}
        </button>
        <button
          onClick={() => onAccept(request.id)}
          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-[#10B981] text-white text-sm hover:bg-[#059669] transition-colors"
        >
          <Check className="w-4 h-4" /> {t('accept')}
        </button>
      </div>
    </div>
  )
}
