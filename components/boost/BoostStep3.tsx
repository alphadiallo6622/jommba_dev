'use client'

import { Smartphone, CreditCard, ChevronLeft } from 'lucide-react'
import { toast } from 'sonner'
import { useBoostStore } from '@/store/boost.store'

const PAYMENT_METHODS = [
  { id: 'mobile', label: 'Mobile Money',  icon: Smartphone  },
  { id: 'card',   label: 'Carte bancaire', icon: CreditCard  },
]

export default function BoostStep3() {
  const { selectedOption, goToStep, closeBoost } = useBoostStore()

  const handlePayment = () => {
    toast.success('Fonctionnalité de paiement bientôt disponible 🚀')
    closeBoost()
  }

  return (
    <div className="p-6">
      <div className="text-center mb-6 pr-8">
        <h2 className="text-lg font-semibold text-gray-900">
          {selectedOption?.label} — {selectedOption?.price}
        </h2>
        <p className="text-[#10B981] text-sm mt-1">
          Choisissez votre mode de paiement
        </p>
      </div>

      <div className="space-y-3 mb-6">
        {PAYMENT_METHODS.map((method) => (
          <button
            key={method.id}
            onClick={handlePayment}
            className="w-full flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:border-[#10B981] hover:bg-[#F0FDF4] transition-colors group"
          >
            <method.icon className="w-5 h-5 text-[#374151] group-hover:text-[#10B981]" />
            <span className="font-medium text-gray-900 text-sm group-hover:text-[#10B981]">
              {method.label}
            </span>
          </button>
        ))}
      </div>

      <button
        onClick={() => goToStep(2)}
        className="w-full text-center text-gray-400 text-sm flex items-center justify-center gap-1 hover:text-gray-600 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" /> Retour
      </button>
    </div>
  )
}
