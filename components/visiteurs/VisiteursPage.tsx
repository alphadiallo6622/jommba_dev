'use client'

import { useRouter } from 'next/navigation'
import { Eye } from 'lucide-react'
import { useCurrentUser } from '@/lib/use-current-user'
import { mockVisitors } from '@/lib/mock-visitors'
import PremiumBanner from './PremiumBanner'
import VisitorCardLocked from './VisitorCardLocked'
import VisitorCardUnlocked from './VisitorCardUnlocked'

export default function VisiteursPage() {
  const router   = useRouter()
  const { isPremium } = useCurrentUser()
  const visitors  = mockVisitors

  const handleGoToPremium = () => router.push('/dashboard/premium')

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">

      {/* Header — toujours visible */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-emerald-900 flex items-center gap-2">
          Mes visiteurs
          <Eye className="w-6 h-6 text-emerald-500" />
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          {visitors.length} personne{visitors.length > 1 ? 's ont' : ' a'} consulté ton profil
        </p>
      </div>

      {/* Bannière upsell — non-Premium uniquement */}
      {!isPremium && (
        <PremiumBanner
          visitorsCount={visitors.length}
          onCTA={handleGoToPremium}
        />
      )}

      {/* Grille visiteurs */}
      {visitors.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {visitors.map((visitor) =>
            isPremium ? (
              <VisitorCardUnlocked key={visitor.id} visitor={visitor} />
            ) : (
              <VisitorCardLocked
                key={visitor.id}
                visitor={visitor}
                onUnlock={handleGoToPremium}
              />
            )
          )}
        </div>
      ) : isPremium ? (
        /* État vide Premium */
        <div className="text-center py-20">
          <Eye className="w-12 h-12 text-gray-200 mx-auto mb-4" />
          <p className="text-gray-400 font-medium">Aucun visiteur pour l&apos;instant</p>
          <p className="text-gray-300 text-sm mt-2">
            Complète ton profil pour attirer plus de visites
          </p>
        </div>
      ) : null}

    </div>
  )
}
