'use client'

import { useState } from 'react'
import { useOnboardingStore } from '@/store/onboarding.store'
import { cn } from '@/lib/utils'

type Props = { onNext: () => void }

export default function StepGender({ onNext }: Props) {
  const { gender, setField } = useOnboardingStore()
  const [showModal, setShowModal] = useState(false)
  const [pending, setPending] = useState<'homme' | 'femme' | null>(null)

  const select = (g: 'homme' | 'femme') => {
    if (gender && gender !== g) return // already chosen — irreversible
    if (!gender) {
      setPending(g)
      setShowModal(true)
    }
  }

  const confirm = () => {
    if (!pending) return
    setField('gender', pending)
    setShowModal(false)
    onNext()
  }

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-serif font-bold text-gray-900">Tu es…</h2>
        <p className="text-sm text-gray-500">Ce choix est définitif et ne pourra pas être modifié.</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {([
          { value: 'homme', emoji: '🧔', label: 'Un homme' },
          { value: 'femme', emoji: '👩', label: 'Une femme' },
        ] as const).map(({ value, emoji, label }) => (
          <button
            key={value}
            type="button"
            onClick={() => select(value)}
            disabled={!!gender && gender !== value}
            className={cn(
              'flex flex-col items-center justify-center gap-3 py-10 rounded-2xl border-2 transition-all font-semibold text-sm',
              gender === value
                ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                : 'border-gray-200 bg-white text-gray-700 hover:border-emerald-300 hover:bg-emerald-50/50',
              gender && gender !== value ? 'opacity-40 cursor-not-allowed' : '',
            )}
          >
            <span className="text-4xl">{emoji}</span>
            {label}
          </button>
        ))}
      </div>

      {/* Confirmation modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-6">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm space-y-4 shadow-2xl">
            <div className="text-center space-y-2">
              <div className="text-3xl">{pending === 'homme' ? '🧔' : '👩'}</div>
              <h3 className="text-lg font-serif font-bold text-gray-900">Confirmer ce choix ?</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Tu t&rsquo;identifies comme <strong>{pending === 'homme' ? 'un homme' : 'une femme'}</strong>.
                Ce choix est <strong>irréversible</strong> et ne pourra plus être modifié après confirmation.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={confirm}
                className="flex-1 py-2.5 rounded-xl text-white font-semibold text-sm hover:opacity-90 transition-opacity"
                style={{ background: '#10B981' }}
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
