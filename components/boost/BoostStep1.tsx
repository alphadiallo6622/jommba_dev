'use client'

import { useTranslations } from 'next-intl'
import { Rocket, TrendingUp, Crown } from 'lucide-react'
import { useBoostStore } from '@/store/boost.store'

export default function BoostStep1() {
  const t = useTranslations('dashboard.boost')
  const { goToStep, closeBoost } = useBoostStore()

  return (
    <div className="p-8 text-center">
      {/* Rocket icon */}
      <div className="w-16 h-16 rounded-full bg-[#E1F5EE] flex items-center justify-center mx-auto mb-6">
        <Rocket className="w-8 h-8 text-[#10B981]" />
      </div>

      <h2 className="text-xl font-bold text-gray-900 mb-3">
        {t('title')}
      </h2>

      <p className="text-gray-500 text-sm leading-relaxed mb-5">
        {t('subtitle')}
      </p>

      {/* Badges */}
      <div className="flex items-center justify-center gap-4 mb-6">
        <span className="flex items-center gap-1 text-sm text-[#10B981]">
          <TrendingUp className="w-4 h-4" /> {t('visibilityBadge')}
        </span>
        <span className="flex items-center gap-1 text-sm text-[#D97706]">
          <Crown className="w-4 h-4" /> {t('premiumBadge')}
        </span>
      </div>

      <button
        onClick={() => goToStep(2)}
        className="w-full flex items-center justify-center gap-2 bg-[#10B981] text-white font-semibold py-3 rounded-xl hover:bg-[#059669] transition-colors mb-3"
      >
        <Rocket className="w-4 h-4" />
        {t('buy')}
      </button>

      <button
        onClick={closeBoost}
        className="w-full py-3 text-gray-400 text-sm hover:text-gray-600 transition-colors rounded-xl hover:bg-gray-50"
      >
        {t('later')}
      </button>
    </div>
  )
}
