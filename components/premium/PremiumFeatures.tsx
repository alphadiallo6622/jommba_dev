'use client'

import { useTranslations } from 'next-intl'
import { features } from '@/lib/mock-premium'

type FeatureItem = { title: string; description: string; free: string; premium: string }

export default function PremiumFeatures() {
  const t = useTranslations('dashboard.premium.features')
  const items = t.raw('items') as FeatureItem[]

  return (
    <section className="py-6">
      <h2 className="text-center font-bold text-xl text-gray-900 mb-1">
        {t('title')}
      </h2>
      <p className="text-center text-gray-400 text-sm mb-6">
        {t('subtitle')}
      </p>

      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
        {features.map((feature, i) => {
          const Icon = feature.icon
          const item = items[i]
          return (
            <div
              key={i}
              className={`flex items-start gap-3 p-4 ${i < features.length - 1 ? 'border-b border-gray-50' : ''}`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${feature.iconBg}`}>
                <Icon className={`w-5 h-5 ${feature.iconColor}`} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                  <span className="font-semibold text-sm text-gray-900">{item.title}</span>
                  {feature.isNew && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-600 font-medium">
                      {t('new')}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400 leading-relaxed mb-2">{item.description}</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-red-50 text-red-400 font-medium">
                    🚫 {item.free}
                  </span>
                  <span className="text-gray-300 text-xs">→</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 font-medium">
                    ✓ {item.premium}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
