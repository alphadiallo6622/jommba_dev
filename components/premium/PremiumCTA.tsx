'use client'

import { Crown, Shield } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'

export default function PremiumCTA() {
  const t = useTranslations('dashboard.premium.cta')
  return (
    <section className="py-4">
      <button
        onClick={() => toast.success(t('paymentSoon'))}
        className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold text-lg py-4 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-md"
      >
        <Crown className="w-5 h-5" />
        {t('button')}
      </button>

      <p className="text-center text-xs text-gray-400 mt-3">
        {t('instant')}
      </p>
      <p className="text-center text-xs text-gray-400 mt-1 flex items-center justify-center gap-1">
        <Shield className="w-3 h-3" />
        {t('certified')}
      </p>
    </section>
  )
}
