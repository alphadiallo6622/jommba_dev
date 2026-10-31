'use client'

import { Plus, Crown, BadgeCheck, Camera } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { ExplorerProfile } from '@/lib/mock-explorer'
import { translateProfileValue } from '@/lib/profile-values'
import { cn } from '@/lib/utils'
import { useIsOnline } from '@/components/providers/PresenceProvider'

type Props = {
  profile: ExplorerProfile
  /** Carte verrouillee par le mur payant : le visiteur doit passer Premium. */
  locked?: boolean
  viewerIsPremium?: boolean
}

export default function ProfileGridCard({ profile, locked, viewerIsPremium }: Props) {
  const router  = useRouter()
  const t = useTranslations('dashboard.explorer')
  const tv = useTranslations('dashboard.profileValues')
  const photoUrl = profile.photos[0] ?? '/avatar-placeholder.svg'
  const isOnline = useIsOnline(profile.id)
  // Le membre a choisi de flouter ses photos : la fiche reste ouverte, seule
  // l'image est voilee. Rien a voir avec un contenu reserve aux abonnes.
  const blurredByOwner = profile.photosBlurred

  return (
    <div className={cn(
      'group bg-white rounded-xl overflow-hidden border shadow-sm transition-[translate,scale,box-shadow] duration-300 ease-soft active:duration-75 hover:-translate-y-1 hover:shadow-lg active:scale-[0.98]',
      profile.isEnAvant ? 'border-amber-300' : 'border-gray-100',
    )}>
      {/* Photo area */}
      <div className="relative bg-gray-200 overflow-hidden" style={{ aspectRatio: '3/4' }}>
        {/* En avant badge */}
        {profile.isEnAvant && !locked && (
          <div className="absolute top-2 left-2 z-10 bg-violet-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
            {t('featured')}
          </div>
        )}

        {locked ? (
          /* Locked — click to go premium */
          <button
            className="w-full h-full relative block"
            onClick={() => router.push('/dashboard/premium')}
          >
            <img
              src={photoUrl}
              alt=""
              className="w-full h-full object-cover blur-sm scale-105"
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/20 gap-1">
              <Crown className="w-8 h-8 text-amber-400 drop-shadow-lg" />
              <span className="text-[10px] text-white font-semibold bg-black/40 px-2 py-0.5 rounded-full">
                {t('premium')}
              </span>
            </div>
          </button>
        ) : (
          <>
            <img
              src={photoUrl}
              alt={`${profile.firstName} ${profile.lastInitial}.`}
              className={cn(
                'w-full h-full object-cover cursor-pointer transition-transform duration-500 ease-soft group-hover:scale-[1.03]',
                blurredByOwner && 'blur-md scale-105',
              )}
              onClick={() => router.push(`/dashboard/profil/${profile.id}`)}
            />

            {blurredByOwner && (
              <span className="absolute bottom-2 left-2 z-10 flex items-center gap-1 bg-gray-800/70 text-white text-[9px] font-semibold px-1.5 py-0.5 rounded-full">
                <Camera className="w-2.5 h-2.5" />
                {t('photoBlurred')}
              </span>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />

            {viewerIsPremium && isOnline && (
              <div className="absolute top-2 right-2 flex items-center gap-1 bg-white/90 text-emerald-600 text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                {t('online')}
              </div>
            )}

            {/* Add button */}
            <button
              onClick={() => toast.success(t('grid.requestSent'))}
              className="absolute bottom-2 right-2 w-8 h-8 rounded-full flex items-center justify-center shadow-md hover:opacity-90 hover:scale-110 active:scale-90 transition-[opacity,scale] duration-150"
              style={{ background: '#10B981' }}
            >
              <Plus className="w-4 h-4 text-white" />
            </button>
          </>
        )}
      </div>

      {/* Info — always visible, but subdued when blurred */}
      <div className={cn('p-2.5 space-y-1', locked && 'opacity-50')}>
        <p className="text-sm font-semibold text-gray-900 truncate flex items-center gap-1">
          {profile.firstName} {profile.lastInitial}., {profile.age}
          <BadgeCheck className="w-3.5 h-3.5 text-sky-500 shrink-0" aria-label={t('verified')} />
        </p>
        <p className="text-xs text-gray-400 flex items-center gap-1 truncate">
          📍 {profile.location}
        </p>
        <div className="flex gap-1 flex-wrap">
          <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full truncate max-w-[80px]">
            {translateProfileValue(profile.maritalStatus, tv)}
          </span>
          <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full truncate max-w-[80px]">
            {profile.job}
          </span>
        </div>
      </div>
    </div>
  )
}
