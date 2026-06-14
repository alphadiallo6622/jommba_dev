'use client'

'use client'

import { Zap } from 'lucide-react'
import { useCurrentUser } from '@/lib/use-current-user'

export default function BoostUnavailable() {
  const { isValidated } = useCurrentUser()
  if (isValidated) return null

  return (
    <div className="rounded-xl p-4 bg-amber-50 border border-amber-200">
      <div className="flex items-center gap-2 mb-1">
        <Zap className="w-4 h-4 text-amber-600 shrink-0" />
        <span className="font-bold text-amber-700 text-sm">Boost indisponible</span>
      </div>
      <p className="text-gray-500 text-xs leading-relaxed pl-6">
        Profil en attente de validation. Ton profil doit être validé par notre équipe avant de pouvoir le booster. Cela prend généralement moins de 24h.
      </p>
    </div>
  )
}
