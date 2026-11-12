'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Smartphone, CreditCard, ChevronLeft } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { useBoostStore } from '@/store/boost.store'
import SquareCardForm from '@/components/payments/SquareCardForm'
import MobileMoneyForm from '@/components/payments/MobileMoneyForm'

export default function BoostStep3() {
  const t = useTranslations('dashboard.boost')
  const { selectedOption, goToStep, closeBoost } = useBoostStore()
  const router = useRouter()
  // null = choix du mode ; 'card'/'mobile' = formulaire correspondant affiché.
  const [method, setMethod] = useState<'card' | 'mobile' | null>(null)

  // Montant USD numérique extrait du libellé de prix (ex. « 3 $ » → 3) pour
  // l'estimation GNF affichée. Le serveur reste autoritaire sur le montant.
  const amountUsd =
    Number(String(selectedOption?.price ?? '').replace(/[^\d.,]/g, '').replace(',', '.')) || 0

  const onPaid = () => {
    toast.success(t('activated'))
    closeBoost()
    router.refresh()
  }

  return (
    <div className="p-6">
      <div className="text-center mb-6 pr-8">
        <h2 className="text-lg font-semibold text-gray-900">
          {selectedOption?.label} — {selectedOption?.price}
        </h2>
        <p className="text-[#10B981] text-sm mt-1">
          {t('choosePayment')}
        </p>
      </div>

      {method === 'card' ? (
        <div className="mb-6">
          <SquareCardForm
            mode="boost"
            boostId={selectedOption?.id}
            submitLabel={t('pay', { price: selectedOption?.price ?? '' })}
            onSuccess={onPaid}
          />
        </div>
      ) : method === 'mobile' ? (
        <div className="mb-6">
          <MobileMoneyForm
            kind="boost"
            boostId={selectedOption?.id}
            amountUsd={amountUsd}
            onSuccess={onPaid}
          />
        </div>
      ) : (
        <div className="space-y-3 mb-6">
          <button
            onClick={() => setMethod('mobile')}
            className="w-full flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:border-[#10B981] hover:bg-[#F0FDF4] transition-colors group"
          >
            <Smartphone className="w-5 h-5 text-[#374151] group-hover:text-[#10B981]" />
            <span className="font-medium text-gray-900 text-sm group-hover:text-[#10B981]">
              {t('mobileMoney')}
            </span>
          </button>
          <button
            onClick={() => setMethod('card')}
            className="w-full flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:border-[#10B981] hover:bg-[#F0FDF4] transition-colors group"
          >
            <CreditCard className="w-5 h-5 text-[#374151] group-hover:text-[#10B981]" />
            <span className="font-medium text-gray-900 text-sm group-hover:text-[#10B981]">
              {t('card')}
            </span>
          </button>
        </div>
      )}

      <button
        onClick={() => (method ? setMethod(null) : goToStep(2))}
        className="w-full text-center text-gray-400 text-sm flex items-center justify-center gap-1 hover:text-gray-600 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" /> {t('back')}
      </button>
    </div>
  )
}
