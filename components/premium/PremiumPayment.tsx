'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Smartphone, CreditCard } from 'lucide-react'
import { toast } from 'sonner'
import { plans } from '@/lib/mock-premium'
import { cn } from '@/lib/utils'
import SquareCardForm from '@/components/payments/SquareCardForm'

interface Props {
  selectedPlan: string
}

export default function PremiumPayment({ selectedPlan }: Props) {
  const t = useTranslations('dashboard.premium.payment')
  const router = useRouter()
  const [paymentMethod, setPaymentMethod] = useState<'mobile' | 'card'>('card')

  const currentPlan = plans.find((p) => p.id === selectedPlan)
  const total = currentPlan?.totalPrice ?? 10

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
            {['Orange', 'Free', 'Wave'].map((b) => (
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
      <div className="flex justify-between items-center border-t border-gray-100 pt-4">
        <span className="text-gray-500 text-sm">{t('total')}</span>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold text-gray-900">
            {total}
          </span>
          <span className="text-sm text-gray-500">$</span>
        </div>
      </div>

      {/* Formulaire de paiement selon la méthode choisie */}
      {paymentMethod === 'card' ? (
        <div className="mt-5">
          <SquareCardForm
            mode="subscribe"
            planId={selectedPlan}
            submitLabel={`${t('subscribe')} · ${total} $`}
            onSuccess={() => {
              toast.success(t('success'))
              router.refresh()
            }}
          />
        </div>
      ) : (
        // Mobile Money : prestataire non encore branché (Square ne le gère pas).
        <button
          onClick={() => toast.info(t('mobileSoon'))}
          className="mt-5 w-full rounded-xl bg-orange-500 py-3 font-semibold text-white transition-colors hover:bg-orange-600"
        >
          {t('subscribe')} · {total} $
        </button>
      )}
    </section>
  )
}
