'use client'

import { useState } from 'react'
import { MessageCircle, Heart } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function DailyTip() {
  const [liked, setLiked] = useState(false)

  return (
    <div className="bg-white rounded-lg p-4 flex items-start gap-3">
      <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
        <MessageCircle className="w-4 h-4 text-emerald-600" />
      </div>

      <div className="flex-1 min-w-0">
        <span className="text-[10px] font-bold tracking-wider text-gray-400 block mb-0.5">CONSEIL DU JOUR</span>
        <h3 className="font-bold text-gray-900 text-sm">Qualité &gt; Quantité</h3>
        <p className="text-gray-500 text-xs mt-1 leading-relaxed">
          Mieux vaut 3 échanges sincères que 30 conversations superficielles.
        </p>
      </div>

      <button
        onClick={() => setLiked(l => !l)}
        className="shrink-0 mt-1 transition-transform active:scale-90"
        aria-label="J'aime ce conseil"
      >
        <Heart
          className={cn(
            'w-5 h-5 transition-colors',
            liked ? 'fill-red-500 text-red-500' : 'text-gray-300'
          )}
        />
      </button>
    </div>
  )
}
