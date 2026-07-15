'use client'

import { RotateCcw, Shield, Lock } from 'lucide-react'
import { useTranslations } from 'next-intl'

const ICONS = [RotateCcw, Shield, Lock]

export default function PremiumGuarantees() {
  const t = useTranslations('dashboard.premium')
  const guarantees = t.raw('guarantees') as string[]
  return (
    <section className="py-2">
      <div className="bg-yellow-50 border border-amber-200 rounded-xl p-4 flex flex-col gap-3">
        {guarantees.map((text, i) => {
          const Icon = ICONS[i] ?? Shield
          return (
            <div key={i} className="flex items-center gap-3">
              <Icon className="w-4 h-4 text-emerald-500 shrink-0" />
              <span className="text-sm text-gray-700">{text}</span>
            </div>
          )
        })}
      </div>
    </section>
  )
}
