'use client'

import { Compass } from 'lucide-react'
import { useCurrentUser } from '@/lib/use-current-user'
import { useExplorerStore } from '@/store/explorer.store'
import ProfileGridCard from './ProfileGridCard'

const FREE_CARD_COUNT = 8

export default function GridView() {
  const { isPremium } = useCurrentUser()
  const profiles = useExplorerStore(s => s.profiles)

  if (profiles.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 text-center py-20 px-8">
        <Compass className="w-12 h-12 text-gray-200 mx-auto mb-4" />
        <p className="font-semibold text-gray-700 mb-1">Aucun profil à découvrir pour l&apos;instant</p>
        <p className="text-gray-400 text-sm">
          Reviens un peu plus tard — de nouveaux membres nous rejoignent chaque jour, in sha Allah.
        </p>
      </div>
    )
  }

  return (
    <div className="pb-8">
      <p className="text-xs text-gray-400 text-center mb-4">
        {profiles.length} profils ·{' '}
        {isPremium
          ? <span className="text-[#10B981] font-medium">Tous visibles</span>
          : `${FREE_CARD_COUNT} visibles gratuitement`
        }
      </p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {profiles.map((profile, i) => (
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
