'use client'

import { Star, BadgeCheck } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { ExplorerProfile } from '@/lib/mock-explorer'
import { cn } from '@/lib/utils'
import { useIsOnline } from '@/components/providers/PresenceProvider'

type Props = {
  profile: ExplorerProfile
  highlightPhoto?: boolean
  isFavorite?: boolean
  onToggleFavorite?: () => void
  viewerIsPremium?: boolean
}

export default function ProfileSwipeCard({ profile, highlightPhoto, isFavorite, onToggleFavorite, viewerIsPremium }: Props) {
  const t = useTranslations('dashboard.explorer')
  const photoUrl   = profile.photos[0] ?? '/avatar-placeholder.svg'
  const photoCount = profile.photos.length
  const isOnline   = useIsOnline(profile.id)

  return (
    <div className={cn(
      'bg-white rounded-2xl overflow-hidden shadow-sm',
      profile.isEnAvant ? 'border-2 border-amber-400' : 'border border-gray-100',
    )}>
      {/* Photo */}
      <div className={cn(
        'relative bg-gray-200',
        highlightPhoto && 'ring-4 ring-emerald-500 ring-offset-2',
      )} style={{ aspectRatio: '3/4' }}>

        {/* En avant pill */}
        {profile.isEnAvant && (
          <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 bg-violet-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
            {t('featuredStar')}
          </div>
        )}

        {viewerIsPremium && isOnline && (
          <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 bg-white/90 text-emerald-600 text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            {t('online')}
          </div>
        )}

        {/* Photo indicators */}
        {photoCount > 1 && (
          <div className="absolute top-3 left-0 right-0 z-10 flex justify-center gap-1 px-3">
            {profile.photos.map((_, i) => (
              <div key={i} className="h-1 flex-1 rounded-full bg-white/60 max-w-12" />
            ))}
          </div>
        )}

        <img
          src={photoUrl}
          alt={`${profile.firstName} ${profile.lastInitial}.`}
          className={cn('w-full h-full object-cover', profile.photosBlurred && 'blur-md scale-105')}
        />

        {/* Bottom gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent pointer-events-none" />

        {/* Info overlay */}
        <div className="absolute bottom-4 left-4 right-4 text-white">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-xl font-bold drop-shadow-sm flex items-center gap-1.5">
              {profile.firstName} {profile.lastInitial}., {profile.age}
              <BadgeCheck className="w-4 h-4 text-sky-400 shrink-0" aria-label={t('verified')} />
            </h2>

            {/* Star / Favorite button */}
            {onToggleFavorite && (
              <button
                onClick={(e) => { e.stopPropagation(); onToggleFavorite() }}
                className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/40 transition-colors ml-2 shrink-0"
              >
                <Star className={cn(
                  'w-4 h-4 transition-colors',
                  isFavorite ? 'fill-amber-400 text-amber-400' : 'text-white',
                )} />
              </button>
            )}
          </div>

          <p className="text-xs text-white/80 flex items-center gap-1 mb-2">
            📍 {profile.location}
          </p>
          <div className="flex gap-2 flex-wrap">
            <span className="bg-white/25 text-white text-xs px-2.5 py-1 rounded-full backdrop-blur-sm">
              {profile.maritalStatus}
            </span>
            <span className="bg-white/25 text-white text-xs px-2.5 py-1 rounded-full backdrop-blur-sm">
              {profile.job}
            </span>
          </div>
        </div>
      </div>

      {/* Marriage vision */}
      <div className="px-4 py-3 border-t border-gray-100">
        <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-1">
          {t('marriageVisionLabel')}
        </p>
        <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
          {profile.marriageVision}
        </p>
      </div>
    </div>
  )
}
