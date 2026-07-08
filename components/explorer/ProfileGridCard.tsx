'use client'

import { Plus, Crown, BadgeCheck } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ExplorerProfile } from '@/lib/mock-explorer'
import { cn } from '@/lib/utils'
import { useIsOnline } from '@/components/providers/PresenceProvider'

type Props = {
  profile: ExplorerProfile
  blurred?: boolean
  viewerIsPremium?: boolean
}

export default function ProfileGridCard({ profile, blurred, viewerIsPremium }: Props) {
  const router  = useRouter()
  const photoUrl = profile.photos[0] ?? '/avatar-placeholder.svg'
  const isOnline = useIsOnline(profile.id)

  return (
    <div className={cn(
      'bg-white rounded-xl overflow-hidden border shadow-sm',
      profile.isEnAvant ? 'border-amber-300' : 'border-gray-100',
    )}>
      {/* Photo area */}
      <div className="relative bg-gray-200" style={{ aspectRatio: '3/4' }}>
        {/* En avant badge */}
        {profile.isEnAvant && !blurred && (
          <div className="absolute top-2 left-2 z-10 bg-violet-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
            En avant
          </div>
        )}

        {blurred ? (
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
                Premium
              </span>
            </div>
          </button>
        ) : (
          <>
            <img
              src={photoUrl}
              alt={`${profile.firstName} ${profile.lastInitial}.`}
              className="w-full h-full object-cover cursor-pointer"
              onClick={() => router.push(`/dashboard/profil/${profile.id}`)}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />

            {viewerIsPremium && isOnline && (
              <div className="absolute top-2 right-2 flex items-center gap-1 bg-white/90 text-emerald-600 text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                En ligne
              </div>
            )}

            {/* Add button */}
            <button
              onClick={() => toast.success('Demande envoyée ✓')}
              className="absolute bottom-2 right-2 w-8 h-8 rounded-full flex items-center justify-center shadow-md hover:opacity-90 transition-opacity"
              style={{ background: '#10B981' }}
            >
              <Plus className="w-4 h-4 text-white" />
            </button>
          </>
        )}
      </div>

      {/* Info — always visible, but subdued when blurred */}
      <div className={cn('p-2.5 space-y-1', blurred && 'opacity-50')}>
        <p className="text-sm font-semibold text-gray-900 truncate flex items-center gap-1">
          {profile.firstName} {profile.lastInitial}., {profile.age}
          <BadgeCheck className="w-3.5 h-3.5 text-sky-500 shrink-0" aria-label="Profil vérifié" />
        </p>
        <p className="text-xs text-gray-400 flex items-center gap-1 truncate">
          📍 {profile.location}
        </p>
        <div className="flex gap-1 flex-wrap">
          <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full truncate max-w-[80px]">
            {profile.maritalStatus}
          </span>
          <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full truncate max-w-[80px]">
            {profile.job}
          </span>
        </div>
      </div>
    </div>
  )
}
