'use client'

import { MOCK_PROFILES } from '@/lib/mock-explorer'
import { useCurrentUser } from '@/lib/use-current-user'
import ProfileGridCard from './ProfileGridCard'

const FREE_CARD_COUNT = 8

export default function GridView() {
  const { isPremium } = useCurrentUser()

  return (
    <div className="pb-8">
      <p className="text-xs text-gray-400 text-center mb-4">
        {MOCK_PROFILES.length} profils ·{' '}
        {isPremium
          ? <span className="text-[#10B981] font-medium">Tous visibles</span>
          : `${FREE_CARD_COUNT} visibles gratuitement`
        }
      </p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {MOCK_PROFILES.map((profile, i) => (
          <ProfileGridCard
            key={profile.id}
            profile={profile}
            blurred={!isPremium && i >= FREE_CARD_COUNT}
          />
        ))}
      </div>
    </div>
  )
}
