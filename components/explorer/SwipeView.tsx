'use client'

import { useState } from 'react'
import { X, MessageCircle, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { MOCK_PROFILES } from '@/lib/mock-explorer'
import { useExplorerStore } from '@/store/explorer.store'
import { useFavorisStore } from '@/store/favoris.store'
import { cn } from '@/lib/utils'
import ProfileSwipeCard from './ProfileSwipeCard'
import ProfileDetails from './ProfileDetails'

export default function SwipeView() {
  const { currentProfileIndex, nextProfile, tourHighlight } = useExplorerStore()
  const { isFavorite, addFavorite, removeFavorite } = useFavorisStore()
  const [isSliding, setIsSliding] = useState(false)

  const profile = MOCK_PROFILES[currentProfileIndex % MOCK_PROFILES.length]

  const animateAndNext = (onDone?: () => void) => {
    if (isSliding) return
    setIsSliding(true)
    setTimeout(() => {
      nextProfile(MOCK_PROFILES.length)
      setIsSliding(false)
      onDone?.()
    }, 300)
  }

  const handleSkip  = () => animateAndNext()
  const handleFlash = () => animateAndNext(() => toast.success('Message flash envoyé ⚡'))
  const handleAdd   = () => animateAndNext(() => toast.success('Demande envoyée ✓'))

  const handleToggleFavorite = () => {
    if (isFavorite(profile.id)) {
      removeFavorite(profile.id)
      toast.success('Retiré des favoris')
    } else {
      addFavorite(profile)
      toast.success('Ajouté aux favoris ⭐')
    }
  }

  return (
    <div className="space-y-0">
      {/* Card */}
      <div className={cn(
        'transition-all duration-300',
        isSliding && '-translate-x-full opacity-0',
      )}>
        <ProfileSwipeCard
          profile={profile}
          highlightPhoto={tourHighlight === 'photo'}
          isFavorite={isFavorite(profile.id)}
          onToggleFavorite={handleToggleFavorite}
        />
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-center gap-4 py-5 bg-gray-50 sticky bottom-0 z-10">
        {/* Skip */}
        <button
          onClick={handleSkip}
          disabled={isSliding}
          className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center hover:bg-red-200 transition-colors disabled:opacity-50"
          title="Passer"
        >
          <X className="w-5 h-5 text-red-500" />
        </button>

        {/* Flash message */}
        <button
          onClick={handleFlash}
          disabled={isSliding}
          className={cn(
            'w-12 h-12 rounded-full flex items-center justify-center transition-all disabled:opacity-50',
            tourHighlight === 'flash-btn'
              ? 'bg-amber-400 ring-4 ring-amber-300 ring-offset-1'
              : 'bg-amber-100 hover:bg-amber-200',
          )}
          title="Message flash"
        >
          <MessageCircle className={cn(
            'w-5 h-5',
            tourHighlight === 'flash-btn' ? 'text-white' : 'text-amber-500',
          )} />
        </button>

        {/* Add */}
        <button
          onClick={handleAdd}
          disabled={isSliding}
          className={cn(
            'h-12 px-5 rounded-full flex items-center gap-2 transition-all disabled:opacity-50 hover:opacity-90',
            tourHighlight === 'add-btn' && 'ring-4 ring-emerald-400 ring-offset-1',
          )}
          style={{ background: '#10B981' }}
          title="Ajouter"
        >
          <Plus className="w-4 h-4 text-white" />
          <span className="text-white font-semibold text-sm">Ajouter</span>
        </button>
      </div>

      {/* Profile details */}
      <div className={cn(
        'transition-all duration-300',
        isSliding && 'opacity-0',
      )}>
        <ProfileDetails profile={profile} />
      </div>
    </div>
  )
}
