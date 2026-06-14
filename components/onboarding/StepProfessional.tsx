'use client'

import { useOnboardingStore } from '@/store/onboarding.store'
import { ArrowLeft, ArrowRight, Briefcase, Ruler } from 'lucide-react'
import { cn } from '@/lib/utils'

type Props = { onNext: () => void; onBack: () => void }

const EDUCATION_OPTIONS = [
  'Aucun diplôme', 'Brevet', 'Baccalauréat', 'Bac +2 / BTS', 'Licence / Bac +3', 'Master / Bac +5', 'Doctorat',
]

export default function StepProfessional({ onNext, onBack }: Props) {
  const { profession, educationLevel, height, setField } = useOnboardingStore()

  const valid = profession.trim().length >= 2 && educationLevel !== '' && height !== ''

  return (
    <div className="space-y-7">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-serif font-bold text-gray-900">Ton profil professionnel</h2>
        <p className="text-sm text-gray-500">Ces infos sont visibles sur ton profil.</p>
      </div>

      {/* Profession */}
      <div>
        <label className="text-xs font-semibold text-gray-700 block mb-1.5">Profession</label>
        <div className="relative">
          <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Ex: Ingénieur, Médecin, Enseignant…"
            value={profession}
            onChange={e => setField('profession', e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
          />
        </div>
      </div>

      {/* Education */}
      <div>
        <label className="text-xs font-semibold text-gray-700 block mb-2">Niveau d&rsquo;études</label>
        <div className="flex flex-wrap gap-2">
          {EDUCATION_OPTIONS.map(opt => (
            <button
              key={opt}
              type="button"
              onClick={() => setField('educationLevel', opt)}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs font-medium border transition-all',
                educationLevel === opt
                  ? 'border-emerald-500 bg-emerald-500 text-white'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-emerald-300',
              )}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      {/* Height */}
      <div>
        <label className="text-xs font-semibold text-gray-700 block mb-1.5">Taille (cm)</label>
        <div className="relative">
          <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="number"
            placeholder="Ex: 175"
            min={140}
            max={220}
            value={height}
            onChange={e => setField('height', e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
          />
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Retour
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!valid}
          className="flex-1 py-2.5 rounded-xl text-white font-semibold text-sm transition-opacity hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
          style={{ background: '#10B981' }}
        >
          Continuer <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
