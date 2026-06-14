'use client'

import { Lock, Clock, Crown } from 'lucide-react'
import type { Visitor } from '@/lib/mock-visitors'

interface Props {
  visitor: Visitor
  onUnlock: () => void
}

export default function VisitorCardLocked({ visitor, onUnlock }: Props) {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
      {/* Blurred photo zone */}
      <div className="relative">
        <img
          src={visitor.photo}
          alt=""
          className="w-full aspect-[3/4] object-cover blur-md scale-110"
        />
        {/* Lock overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/10">
          <Lock className="w-8 h-8 text-white drop-shadow-lg" />
        </div>
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

      {/* Blurred info */}
      <div className="p-3">
        <p className="text-gray-300 text-sm font-medium blur-sm select-none">
          Nom masqué
        </p>
        <p className="text-gray-200 text-xs blur-sm select-none mt-1">
          • Ville, Pays
        </p>

        {/* Unlock button */}
        <button
          onClick={onUnlock}
          className="w-full mt-3 bg-amber-100 text-amber-600 text-sm font-medium py-2 rounded-lg flex items-center justify-center gap-1 hover:bg-amber-200 transition-colors"
        >
          <Crown className="w-3 h-3" />
          Débloquer ce profil
        </button>
      </div>
    </div>
  )
}
