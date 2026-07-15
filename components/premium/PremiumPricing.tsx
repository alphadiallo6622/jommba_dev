'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Tag } from 'lucide-react'
import { plans } from '@/lib/mock-premium'
import { cn } from '@/lib/utils'

interface Props {
  selectedPlan: string
  setSelectedPlan: (id: string) => void
}

export default function PremiumPricing({ selectedPlan, setSelectedPlan }: Props) {
  const t = useTranslations('dashboard.premium.pricing')
  const [showPromo, setShowPromo] = useState(false)
  const [promoCode, setPromoCode] = useState('')

  return (
    <section className="py-6">
      <h2 className="text-center font-bold text-xl text-gray-900 mb-1">
        {t('title')}
      </h2>
      <p className="text-center text-gray-400 text-sm mb-5">
        {t('subtitle')}
      </p>

      <div className="flex flex-col gap-3">
        {plans.map((plan) => {
          const isActive = selectedPlan === plan.id
          return (
            <button
              key={plan.id}
              onClick={() => setSelectedPlan(plan.id)}
              className={cn(
                'w-full rounded-xl p-4 text-left transition-all duration-200',
                isActive
                  ? 'border-2 border-amber-500 bg-yellow-50'
                  : 'border border-gray-200 bg-white hover:border-amber-300'
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap flex-1">
                  {/* Radio dot */}
                  <div className={cn(
                    'w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5',
                    isActive ? 'border-amber-500' : 'border-gray-300'
                  )}>
                    {isActive && <div className="w-2 h-2 rounded-full bg-amber-500" />}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-semibold text-sm text-gray-900">{t(`plans.${plan.id}.label`)}</span>
                      {plan.isPopular && (
                        <span className="bg-emerald-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-medium">
                          {t('popular')}
                        </span>
                      )}
                      {t.has(`plans.${plan.id}.boostBadge`) && (
                        <span className="bg-emerald-50 text-emerald-600 text-[10px] px-1.5 py-0.5 rounded-full font-medium">
                          {t(`plans.${plan.id}.boostBadge`)}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{t(`plans.${plan.id}.pricePerMonth`)}</p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="flex items-baseline gap-0.5 justify-end">
                    <span className="text-xl font-bold text-gray-900">
                      {plan.totalPrice}
                    </span>
                    <span className="text-xs text-gray-400">$</span>
                  </div>
                  {plan.discount && (
                    <span className="text-xs text-amber-600 font-medium">{plan.discount}</span>
                  )}
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* Promo code */}
      <div className="mt-5 text-center">
        {!showPromo ? (
          <button
            onClick={() => setShowPromo(true)}
            className="text-sm text-gray-400 underline inline-flex items-center gap-1 hover:text-gray-600 transition-colors"
          >
            <Tag className="w-3.5 h-3.5" />
            {t('havePromo')}
          </button>
        ) : (
          <div className="flex gap-2">
            <input
              type="text"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              placeholder={t('promoPlaceholder')}
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-400 bg-white"
            />
            <button className="bg-amber-500 text-white text-sm px-4 py-2 rounded-lg font-medium hover:bg-amber-600 transition-colors shrink-0">
              {t('apply')}
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
