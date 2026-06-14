'use client'

import { useRouter } from 'next/navigation'
import { Camera, Crown, Plus } from 'lucide-react'

const MAX_FREE    = 3
const MAX_PREMIUM = 6

type Props = {
  photo: string
  isPremium: boolean
  onMainPhotoClick?: () => void
  onAddPhoto?: () => void
}

export default function PhotoGallery({ photo, isPremium, onMainPhotoClick, onAddPhoto }: Props) {
  const router = useRouter()
  const max = isPremium ? MAX_PREMIUM : MAX_FREE
  // Extra slots = max - 1 (main already occupies 1 slot)
  const extraSlots = max - 1

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 mb-3">
      <div className="flex items-center gap-2 mb-3">
        <Camera className="w-4 h-4 text-gray-500" />
        <span className="text-sm font-semibold text-gray-700">
          Photos (1/{max})
        </span>
        {isPremium && (
          <span className="text-[9px] font-bold bg-amber-500 text-white px-1.5 py-0.5 rounded-full">PREMIUM</span>
        )}
      </div>

      <div className="flex gap-2 flex-wrap">
        {/* Main photo */}
        <div
          className={`relative w-16 h-16 rounded-xl overflow-hidden shrink-0 ${onMainPhotoClick ? 'cursor-pointer' : ''}`}
          onClick={onMainPhotoClick}
        >
          <img src={photo} alt="Principale" className="w-full h-full object-cover" />
          <span className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[9px] text-center py-0.5">
            Principale
          </span>
        </div>

        {isPremium ? (
          /* Premium: show add slots */
          Array.from({ length: extraSlots }).map((_, i) => (
            <button
              key={i}
              onClick={onAddPhoto}
              className="w-16 h-16 rounded-xl border-2 border-dashed border-emerald-200 bg-[#E1F5EE]/50 flex flex-col items-center justify-center shrink-0 hover:border-[#10B981] hover:bg-[#E1F5EE] transition-colors group"
            >
              <Plus className="w-4 h-4 text-emerald-300 group-hover:text-[#10B981] transition-colors" />
            </button>
          ))
        ) : (
          /* Free: show locked premium slots */
          [1, 2, 3].map(i => (
            <button
              key={i}
              onClick={() => router.push('/dashboard/premium')}
              className="w-16 h-16 rounded-xl bg-amber-50 border border-amber-200 flex flex-col items-center justify-center shrink-0 hover:bg-amber-100 transition-colors"
            >
              <Crown className="w-4 h-4 text-amber-400 mb-0.5" />
              <span className="text-[9px] text-amber-500 font-medium">Premium</span>
            </button>
          ))
        )}
      </div>
    </div>
  )
}
