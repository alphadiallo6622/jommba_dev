'use client'

import { useEffect, useState } from 'react'
import { Clock, ChevronLeft } from 'lucide-react'
import { useBoostStore, BoostOption } from '@/store/boost.store'

/** Prix formaté à la française (2.5 -> "2,5 $"). */
function formatPrice(usd: number): string {
  return `${usd.toLocaleString('fr-FR')} $`
}

type BoostPricingResponse = {
  boosts: { id: string; durationLabel: string; priceUsd: number }[]
}

export default function BoostStep2() {
  const { selectOption, goToStep } = useBoostStore()
  const [options, setOptions] = useState<BoostOption[] | null>(null)

  // Les prix viennent des paramètres admin : jamais codés en dur ici, pour
  // rester alignés avec le montant réellement débité par /api/payments/boost.
  useEffect(() => {
    fetch('/api/boost/pricing')
      .then((r) => r.json())
      .then((data: BoostPricingResponse) =>
        setOptions(
          data.boosts.map((b) => ({
            id: b.id,
            label: `Boost ${b.durationLabel}`,
            duration: b.durationLabel,
            price: formatPrice(b.priceUsd),
          })),
        ),
      )
      .catch(() => setOptions([]))
  }, [])

  return (
    <div className="p-6">
      <h2 className="text-lg font-semibold text-gray-900 text-center mb-6 pr-8">
        Choisissez votre boost
      </h2>

      <div className="space-y-3 mb-6">
        {options === null ? (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-[68px] rounded-xl border border-gray-200 bg-gray-50 animate-pulse" />
            ))}
          </div>
        ) : options.length === 0 ? (
          <p className="text-center text-sm text-gray-400 py-6">
            Tarifs indisponibles pour le moment. Réessayez.
          </p>
        ) : options.map((option) => (
          <button
            key={option.id}
            onClick={() => selectOption(option)}
            className="w-full flex items-center justify-between p-4 rounded-xl border border-gray-200 hover:border-[#10B981] hover:bg-[#F0FDF4] transition-colors group"
          >
            <div className="text-left">
              <p className="font-semibold text-gray-900 text-sm group-hover:text-[#10B981]">
                {option.label}
              </p>
              <p className="text-gray-400 text-xs flex items-center gap-1 mt-0.5">
                <Clock className="w-3 h-3" />
                {option.duration}
              </p>
            </div>
            <span className="font-bold text-[#10B981] text-sm">
              {option.price}
            </span>
          </button>
        ))}
      </div>

      <button
        onClick={() => goToStep(1)}
        className="w-full text-center text-gray-400 text-sm flex items-center justify-center gap-1 hover:text-gray-600 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" /> Retour
      </button>
    </div>
  )
}
