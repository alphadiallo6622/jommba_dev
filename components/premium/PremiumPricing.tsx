'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Tag } from 'lucide-react'
import { plans } from '@/lib/mock-premium'
import { cn } from '@/lib/utils'
import type { AppliedPromo } from '@/app/dashboard/premium/page'

export interface PremiumPricingData {
  prices: Record<string, number>
  /** Tarif plein de la durée, avant remise d'engagement (affiché barré). */
  fullPrices: Record<string, number>
  monthlyEquivalents: Record<string, number>
  discounts: Record<string, string | null>
}

interface Props {
  selectedPlan: string
  setSelectedPlan: (id: string) => void
  pricing: PremiumPricingData | null
  appliedPromo: AppliedPromo | null
  onPromoApplied: (promo: AppliedPromo | null) => void
}

export default function PremiumPricing({ selectedPlan, setSelectedPlan, pricing, appliedPromo, onPromoApplied }: Props) {
  const t = useTranslations('dashboard.premium.pricing')
  const [showPromo, setShowPromo] = useState(false)
  const [promoCode, setPromoCode] = useState('')
  const [promoError, setPromoError] = useState<string | null>(null)
  const [applying, setApplying] = useState(false)

  const handleApplyPromo = async () => {
    if (!promoCode.trim() || applying) return
    setApplying(true)
    setPromoError(null)
    try {
      const res = await fetch('/api/promo/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: promoCode, planId: selectedPlan }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok || !json.valid) {
        setPromoError(json.error ?? 'Code promo invalide.')
        onPromoApplied(null)
        return
      }
      onPromoApplied({ code: json.code, discountedPrice: json.discountedPrice })
    } catch {
      setPromoError('Une erreur est survenue. Réessayez.')
    } finally {
      setApplying(false)
    }
  }

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
          const totalPrice = pricing?.prices[plan.id] ?? null
          const fullPrice = pricing?.fullPrices[plan.id] ?? null
          const discount = pricing?.discounts[plan.id] ?? null
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
                    <p className="text-xs text-gray-400 mt-0.5">
                      {pricing ? `${pricing.monthlyEquivalents[plan.id]} $/mois` : '—'}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="flex items-baseline gap-1 justify-end">
                    {fullPrice !== null && fullPrice > (totalPrice ?? 0) && (
                      <span className="text-xs text-gray-400 line-through">{fullPrice} $</span>
                    )}
                    <div className="flex items-baseline gap-0.5">
                      <span className="text-xl font-bold text-gray-900">
                        {totalPrice ?? '—'}
                      </span>
                      <span className="text-xs text-gray-400">$</span>
                    </div>
                  </div>
                  {discount && (
                    <span className="text-xs text-amber-600 font-medium">{discount}</span>
                  )}
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* Promo code */}
      <div className="mt-5 text-center">
        {appliedPromo ? (
          <div className="flex items-center justify-center gap-2 text-sm text-emerald-600 font-medium">
            <Tag className="w-3.5 h-3.5" />
            Code {appliedPromo.code} appliqué — {appliedPromo.discountedPrice} $
            <button
              onClick={() => { onPromoApplied(null); setPromoCode(''); setShowPromo(false) }}
              className="text-gray-400 underline hover:text-gray-600"
            >
              Retirer
            </button>
          </div>
        ) : !showPromo ? (
          <button
            onClick={() => setShowPromo(true)}
            className="text-sm text-gray-400 underline inline-flex items-center gap-1 hover:text-gray-600 transition-colors"
          >
            <Tag className="w-3.5 h-3.5" />
            {t('havePromo')}
          </button>
        ) : (
          <div>
            <div className="flex gap-2">
              <input
                type="text"
                value={promoCode}
                onChange={(e) => { setPromoCode(e.target.value); setPromoError(null) }}
                placeholder={t('promoPlaceholder')}
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-400 bg-white"
              />
              <button
                onClick={handleApplyPromo}
                disabled={applying || !promoCode.trim()}
                className="bg-amber-500 text-white text-sm px-4 py-2 rounded-lg font-medium hover:bg-amber-600 transition-colors shrink-0 disabled:opacity-50"
              >
                {applying ? '…' : t('apply')}
              </button>
            </div>
            {promoError && (
              <p className="mt-2 text-xs text-red-600">{promoError}</p>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
