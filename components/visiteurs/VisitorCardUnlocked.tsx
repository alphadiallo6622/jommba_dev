'use client'

import { Clock, MapPin } from 'lucide-react'
import { toast } from 'sonner'
import type { Visitor } from '@/lib/mock-visitors'

interface Props {
  visitor: Visitor
}

export default function VisitorCardUnlocked({ visitor }: Props) {
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
          Il y a {visitor.hoursAgo}h
        </span>
        {/* New badge */}
        {visitor.isNew && (
          <span className="absolute bottom-2 left-2 bg-emerald-500 text-white text-xs px-2 py-1 rounded-full font-medium">
            Nouveau
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
          onClick={() => toast.success('Profil bientôt accessible')}
          className="w-full mt-3 bg-emerald-500 text-white text-sm font-medium py-2 rounded-lg flex items-center justify-center gap-1 hover:bg-emerald-600 transition-colors"
        >
          Voir le profil →
        </button>
      </div>
    </div>
  )
}
