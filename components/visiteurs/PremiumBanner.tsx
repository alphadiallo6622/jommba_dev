'use client'

import { Lock, Crown } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface Props {
  visitorsCount: number
  onCTA: () => void
}

export default function PremiumBanner({ visitorsCount, onCTA }: Props) {
  const t = useTranslations('dashboard.visiteurs')
  return (
    <div className="bg-amber-600 rounded-2xl p-8 text-center mb-8">
      <div className="flex justify-center mb-4">
        <Lock className="w-12 h-12 text-white" />
      </div>

      <h2 className="text-white font-bold text-xl mb-3">
        {t('bannerTitle')}
      </h2>

      <p className="text-white/90 text-sm mb-6">
        {t('bannerDesc', { count: visitorsCount })}
      </p>

      <button
        onClick={onCTA}
        className="bg-white text-amber-600 font-semibold px-6 py-3 rounded-xl flex items-center gap-2 mx-auto hover:bg-gray-50 transition-colors"
      >
        <Crown className="w-4 h-4" />
        {t('bannerCta')}
      </button>
    </div>
  )
}
