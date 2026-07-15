'use client'

import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Crown } from 'lucide-react'
import { useCurrentUser } from '@/lib/use-current-user'

const MAX_PREMIUM = 6

export default function PhotoUpsellBanner() {
  const router = useRouter()
  const t = useTranslations('dashboard.profil.upsell')
  const { isPremium } = useCurrentUser()

  if (isPremium) return null

  return (
    <button
      onClick={() => router.push('/dashboard/premium')}
      className="w-full flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-4 hover:bg-amber-100 transition-colors text-left"
    >
      <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center shrink-0">
        <Crown className="w-4 h-4 text-amber-500" />
      </div>
      <div className="flex-1">
        <p className="text-amber-700 text-sm font-semibold leading-snug">
          {t('title', { max: MAX_PREMIUM })}
        </p>
        <p className="text-amber-500 text-xs mt-0.5">
          {t('desc')}
        </p>
      </div>
      <Crown className="w-4 h-4 text-amber-400 shrink-0" />
    </button>
  )
}
