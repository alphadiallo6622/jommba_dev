'use client'

import { useState } from 'react'
import { Smartphone, CreditCard } from 'lucide-react'
import { plans } from '@/lib/mock-premium'
import { cn } from '@/lib/utils'

interface Props {
  selectedPlan: string
}

export default function PremiumPayment({ selectedPlan }: Props) {
  const [paymentMethod, setPaymentMethod] = useState<'mobile' | 'card'>('mobile')

  const currentPlan = plans.find((p) => p.id === selectedPlan)
  const total = currentPlan?.totalPrice ?? 10

  return (
    <section className="py-4">
      <h2 className="font-bold text-lg text-gray-900 mb-4">Comment veux-tu payer ?</h2>

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
          <span className="text-sm font-medium text-gray-800 block mb-1.5">Mobile Money</span>
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
          <span className="text-sm font-medium text-gray-800 block mb-1.5">Carte bancaire</span>
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
        <span className="text-gray-500 text-sm">Total à payer</span>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold text-gray-900">
            {total}
          </span>
          <span className="text-sm text-gray-500">$</span>
        </div>
      </div>
    </section>
  )
}
