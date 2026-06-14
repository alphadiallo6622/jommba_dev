'use client'

import { Clock, ChevronLeft } from 'lucide-react'
import { useBoostStore, BoostOption } from '@/store/boost.store'

const BOOST_OPTIONS: BoostOption[] = [
  { id: '24h', label: 'Boost 24h',     duration: '24h',     price: '2,5 $' },
  { id: '3j',  label: 'Boost 3 jours', duration: '3 jours', price: '5 $'   },
  { id: '7j',  label: 'Boost 7 jours', duration: '7 jours', price: '8 $'   },
]

export default function BoostStep2() {
  const { selectOption, goToStep } = useBoostStore()

  return (
    <div className="p-6">
      <h2 className="text-lg font-semibold text-gray-900 text-center mb-6 pr-8">
        Choisissez votre boost
      </h2>

      <div className="space-y-3 mb-6">
        {BOOST_OPTIONS.map((option) => (
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
