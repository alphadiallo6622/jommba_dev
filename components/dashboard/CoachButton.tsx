'use client'

import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useCoachStore } from '@/store/coach.store'

export default function CoachButton() {
  const pathname = usePathname()
  const t = useTranslations('dashboard.coach')
  const { isOpen, openCoach } = useCoachStore()

  if (pathname.startsWith('/dashboard/messages')) return null

  return (
    <button
      onClick={openCoach}
      className={`fixed bottom-24 right-4 md:bottom-6 md:right-6 z-40 flex items-center gap-1.5 pl-0.5 pr-3 py-0.5 rounded-full shadow-lg transition-all border-2 border-amber-400 ${
        isOpen
          ? 'bg-[#059669] scale-95'
          : 'bg-[#10B981] hover:bg-[#059669] hover:scale-105'
      }`}
      aria-label={t('aria')}
    >
      <img
        src="/coach.png"
        alt={t('avatarAlt')}
        className="w-7 h-7 rounded-full object-cover object-top shrink-0"
      />
      <span className="text-white text-xs font-semibold">{t('label')}</span>
    </button>
  )
}
