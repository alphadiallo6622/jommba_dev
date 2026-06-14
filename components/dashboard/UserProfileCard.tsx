'use client'

import { useRouter } from 'next/navigation'
import { useCurrentUser } from '@/lib/use-current-user'

export default function UserProfileCard() {
  const router = useRouter()
  const mockUser = useCurrentUser()
  const { firstName, city, country, avatar, profileCompletion } = mockUser
  const isComplete = profileCompletion >= 100

  return (
    <div
      className="rounded-xl p-5"
      style={{ background: 'linear-gradient(135deg, #10B981 0%, #064E3B 100%)' }}
    >
      {/* Top row: avatar + greeting */}
      <div className="flex items-center gap-3">
        <img
          src={avatar}
          alt="Avatar"
          className="w-12 h-12 rounded-full object-cover border-2 border-white/30 shrink-0"
        />
        <div>
          <p className="text-white font-bold text-base">
            Salam, <span>{firstName}</span> ! 🌙
          </p>
          <p className="text-emerald-100 text-xs mt-0.5">
            🇸🇳 {city}, {country}
          </p>
        </div>
      </div>

      {/* Divider */}
      <div className="my-3 border-t border-white/20" />

      {/* Progress */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-white font-medium text-xs">Profil complété</span>
          <span className="text-white font-bold text-lg">{profileCompletion}%</span>
        </div>
        <div className="h-2 bg-white/30 rounded-full overflow-hidden">
          <div
            className="h-2 rounded-full bg-white transition-all"
            style={{ width: `${profileCompletion}%` }}
          />
        </div>
        {!isComplete && (
          <p
            onClick={() => router.push('/dashboard/parametres')}
            className="text-center text-xs text-emerald-200 mt-2 italic cursor-pointer hover:text-white transition-colors"
          >
            Cliquez pour compléter
          </p>
        )}
      </div>
    </div>
  )
}
