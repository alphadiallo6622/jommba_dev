'use client'

import { useState } from 'react'
import { Smartphone, CreditCard, ChevronLeft } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { useBoostStore } from '@/store/boost.store'
import SquareCardForm from '@/components/payments/SquareCardForm'

export default function BoostStep3() {
  const { selectedOption, goToStep, closeBoost } = useBoostStore()
  const router = useRouter()
  // null = choix du mode ; 'card' = formulaire carte affiché.
  const [method, setMethod] = useState<'card' | null>(null)

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

      {method === 'card' ? (
        <div className="mb-6">
          <SquareCardForm
            mode="boost"
            boostId={selectedOption?.id}
            submitLabel={`Payer ${selectedOption?.price}`}
            onSuccess={() => {
              toast.success('Boost activé ! 🚀')
              closeBoost()
              router.refresh()
            }}
          />
        </div>
      ) : (
        <div className="space-y-3 mb-6">
          <button
            onClick={() => toast.info('Le paiement Mobile Money arrive bientôt.')}
            className="w-full flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:border-[#10B981] hover:bg-[#F0FDF4] transition-colors group"
          >
            <Smartphone className="w-5 h-5 text-[#374151] group-hover:text-[#10B981]" />
            <span className="font-medium text-gray-900 text-sm group-hover:text-[#10B981]">
              Mobile Money
            </span>
          </button>
          <button
            onClick={() => setMethod('card')}
            className="w-full flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:border-[#10B981] hover:bg-[#F0FDF4] transition-colors group"
          >
            <CreditCard className="w-5 h-5 text-[#374151] group-hover:text-[#10B981]" />
            <span className="font-medium text-gray-900 text-sm group-hover:text-[#10B981]">
              Carte bancaire
            </span>
          </button>
        </div>
      )}

      <button
        onClick={() => (method === 'card' ? setMethod(null) : goToStep(2))}
        className="w-full text-center text-gray-400 text-sm flex items-center justify-center gap-1 hover:text-gray-600 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" /> Retour
      </button>
    </div>
  )
}
