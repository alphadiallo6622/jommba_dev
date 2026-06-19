'use client'

import { useState } from 'react'
import { X, MessageCircle, Plus, UserPlus } from 'lucide-react'
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
  const [isSliding, setIsSliding]         = useState(false)
  const [skipConfirmOpen, setSkipConfirm] = useState(false)

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

  const handleSkip        = () => { setSkipConfirm(false); animateAndNext() }
  const handleSkipRequest = () => setSkipConfirm(true)
  const handleFlash       = () => animateAndNext(() => toast.success('Message flash envoyé ⚡'))
  const handleAdd         = () => { setSkipConfirm(false); animateAndNext(() => toast.success('Demande envoyée ✓')) }

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
      {/* Card + skip confirmation overlay */}
      <div className="relative">
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

        {/* Skip confirmation popup */}
        {skipConfirmOpen && (
          <div className="absolute inset-0 flex items-center justify-center p-4 z-20">
            <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-xs relative">
              <button
                onClick={() => setSkipConfirm(false)}
                className="absolute top-3 right-3 w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>

              <h3 className="text-center font-bold text-gray-900 text-lg mb-2">
                Attends une seconde !
              </h3>
              <p className="text-center text-gray-500 text-sm mb-5">
                Tu es sur le point de passer <span className="font-semibold text-gray-800">{profile.firstName}</span>.
                Peut-être que c&apos;est la bonne personne pour toi&nbsp;?
              </p>

              <button
                onClick={handleAdd}
                className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 rounded-xl transition-colors mb-3"
              >
                <UserPlus className="w-4 h-4" />
                Ajouter ce profil
              </button>
              <button
                onClick={handleSkip}
                className="w-full py-3 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 text-sm font-medium transition-colors"
              >
                Passer quand même
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-center gap-4 py-5 bg-gray-50 sticky bottom-0 z-10">
        {/* Skip */}
        <button
          onClick={handleSkipRequest}
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
