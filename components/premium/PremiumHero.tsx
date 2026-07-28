'use client'

import { useTranslations } from 'next-intl'
import { useCurrentUser } from '@/lib/use-current-user'

export default function PremiumHero() {
  const t = useTranslations('dashboard.premium.hero')
  const { firstName } = useCurrentUser()

  return (
    <section className="text-center py-6">
      {/* Alert banner */}
      <div className="inline-flex items-center bg-amber-600 text-white text-xs px-4 py-2 rounded-full mb-6">
        {t('badge')}
      </div>

      {/* Title */}
      <h1 className="font-serif text-4xl leading-tight text-gray-900 mb-4">
        <span className="block">{t('titleName', { name: firstName })}</span>
        <span className="block">
          {t('titleLine')}{' '}
          <span className="text-emerald-500">{t('titleHighlight')}</span>
        </span>
      </h1>

      {/* Subtitle */}
      <p className="text-gray-500 max-w-md mx-auto text-sm leading-relaxed mb-8">
        {t('subtitle')}
      </p>

      {/* Stats */}
      <div className="bg-yellow-50 border border-amber-200 rounded-xl grid grid-cols-3 divide-x divide-amber-200">
        {[
          { value: '3x',        label: t('stat1Label') },
          { value: '500+',      label: t('stat2Label') },
          { value: '100%',      label: t('stat3Label') },
        ].map(({ value, label }) => (
          <div key={label} className="py-5 flex flex-col items-center gap-1">
            <span className="text-2xl font-bold text-amber-600">{value}</span>
            <span className="text-xs text-gray-500">{label}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
