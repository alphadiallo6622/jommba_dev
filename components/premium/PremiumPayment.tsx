'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Smartphone, CreditCard } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import SquareCardForm from '@/components/payments/SquareCardForm'
import MobileMoneyForm from '@/components/payments/MobileMoneyForm'
import type { PremiumPricingData } from '@/components/premium/PremiumPricing'
import type { AppliedPromo } from '@/app/dashboard/premium/page'

interface Props {
  selectedPlan: string
  pricing: PremiumPricingData | null
  appliedPromo: AppliedPromo | null
}

export default function PremiumPayment({ selectedPlan, pricing, appliedPromo }: Props) {
  const t = useTranslations('dashboard.premium.payment')
  const router = useRouter()
  const [paymentMethod, setPaymentMethod] = useState<'mobile' | 'card'>('card')
  // Taux USD→GNF (pour afficher le montant en GNF quand Mobile Money est choisi).
  const [gnfRate, setGnfRate] = useState<number | null>(null)

  const basePrice = pricing?.prices[selectedPlan] ?? 10
  const total = appliedPromo?.discountedPrice ?? basePrice

  useEffect(() => {
    let active = true
    fetch('/api/premium/mobile-money-config')
      .then((r) => r.json())
      .then((c) => {
        if (active && typeof c?.usdToGnf === 'number' && c.usdToGnf > 0) setGnfRate(c.usdToGnf)
      })
      .catch(() => {})
    return () => {
      active = false
    }
  }, [])

  // En Mobile Money on affiche le montant en GNF ; en Carte (Square) on garde le $.
  const showGnf = paymentMethod === 'mobile' && gnfRate != null
  const toGnf = (usd: number) => new Intl.NumberFormat('fr-FR').format(Math.round(usd * (gnfRate ?? 0)))

  return (
    <section className="py-4">
      <h2 className="font-bold text-lg text-gray-900 mb-4">{t('title')}</h2>

      <div className="grid grid-cols-2 gap-3 mb-6">
        {/* Mobile Money */}
        <button
          onClick={() => setPaymentMethod('mobile')}
          className={cn(
            'rounded-xl p-4 text-center transition-all duration-200',
            paymentMethod === 'mobile'
              ? 'border-2 border-orange-400 bg-orange-50'
              : 'border border-gray-200 bg-white hover:border-orange-200'
          )}
        >
          <Smartphone className="w-6 h-6 text-orange-500 mx-auto mb-1.5" />
          <span className="text-sm font-medium text-gray-800 block mb-1.5">{t('mobileMoney')}</span>
          <div className="flex justify-center gap-1 flex-wrap">
            {['Orange', 'MTN'].map((b) => (
              <span key={b} className="text-[10px] bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded font-medium">
                {b}
              </span>
            ))}
          </div>
        </button>

        {/* Carte bancaire */}
        <button
          onClick={() => setPaymentMethod('card')}
          className={cn(
            'rounded-xl p-4 text-center transition-all duration-200',
            paymentMethod === 'card'
              ? 'border-2 border-blue-400 bg-blue-50'
              : 'border border-gray-200 bg-white hover:border-blue-200'
          )}
        >
          <CreditCard className="w-6 h-6 text-blue-500 mx-auto mb-1.5" />
          <span className="text-sm font-medium text-gray-800 block mb-1.5">{t('card')}</span>
          <div className="flex justify-center gap-1">
            {['Visa', 'Mastercard'].map((b) => (
              <span key={b} className="text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded font-medium">
                {b}
              </span>
            ))}
          </div>
        </button>
      </div>

      {/* Total */}
      <div className="mt-1 flex items-center justify-between rounded-2xl bg-emerald-50/60 px-4 py-3">
        <span className="text-sm font-medium text-gray-600">{t('total')}</span>
        <div className="flex items-baseline gap-2">
          {appliedPromo && (
            <span className="text-sm text-gray-400 line-through">
              {showGnf ? `${toGnf(basePrice)} GNF` : `${basePrice} $`}
            </span>
          )}
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-extrabold tracking-tight text-emerald-600">
              {showGnf ? toGnf(total) : total}
            </span>
            <span className="text-base font-semibold text-emerald-500">{showGnf ? 'GNF' : '$'}</span>
          </div>
        </div>
      </div>

      {/* Formulaire de paiement selon la méthode choisie */}
      {paymentMethod === 'card' ? (
        <div className="mt-5">
          <SquareCardForm
            mode="subscribe"
            planId={selectedPlan}
            promoCode={appliedPromo?.code}
            accent="green"
            submitLabel={`${t('subscribe')} · ${total} $`}
            onSuccess={() => {
              toast.success(t('success'))
              router.refresh()
            }}
          />
        </div>
      ) : (
        // Mobile Money (Sayele) — Guinée / GNF. Additionnel, indépendant de Square.
        <MobileMoneyForm
          planId={selectedPlan}
          promoCode={appliedPromo?.code}
          amountUsd={total}
          onSuccess={() => {
            toast.success(t('success'))
            router.refresh()
          }}
        />
      )}
    </section>
  )
}
