'use client'

import { useTranslations } from 'next-intl'
import { useOnboardingStore } from '@/store/onboarding.store'
import { ArrowLeft, ArrowRight, Briefcase, Ruler } from 'lucide-react'
import { cn } from '@/lib/utils'

type Props = { onNext: () => void; onBack: () => void }

// La valeur stockée reste stable (canonique FR) ; seul le libellé est traduit.
const EDUCATION_OPTIONS = [
  { value: 'Aucun diplôme',    key: 'none' },
  { value: 'Brevet',           key: 'brevet' },
  { value: 'Baccalauréat',     key: 'bac' },
  { value: 'Bac +2 / BTS',     key: 'bac2' },
  { value: 'Licence / Bac +3', key: 'licence' },
  { value: 'Master / Bac +5',  key: 'master' },
  { value: 'Doctorat',         key: 'doctorate' },
] as const

export default function StepProfessional({ onNext, onBack }: Props) {
  const t = useTranslations('onboarding')
  const { profession, educationLevel, height, setField } = useOnboardingStore()

  const valid = profession.trim().length >= 2 && educationLevel !== '' && height !== ''

  return (
    <div className="space-y-7">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-serif font-bold text-gray-900">{t('professional.title')}</h2>
        <p className="text-sm text-gray-500">{t('professional.subtitle')}</p>
      </div>

      {/* Profession */}
      <div>
        <label className="text-xs font-semibold text-gray-700 block mb-1.5">{t('professional.profession')}</label>
        <div className="relative">
          <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder={t('professional.professionPlaceholder')}
            value={profession}
            onChange={e => setField('profession', e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
          />
        </div>
      </div>

      {/* Education */}
      <div>
        <label className="text-xs font-semibold text-gray-700 block mb-2">{t('professional.education')}</label>
        <div className="flex flex-wrap gap-2">
          {EDUCATION_OPTIONS.map(({ value, key }) => (
            <button
              key={value}
              type="button"
              onClick={() => setField('educationLevel', value)}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs font-medium border transition-all',
                educationLevel === value
                  ? 'border-emerald-500 bg-emerald-500 text-white'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-emerald-300',
              )}
            >
              {t(`professional.educationOptions.${key}`)}
            </button>
          ))}
        </div>
      </div>

      {/* Height */}
      <div>
        <label className="text-xs font-semibold text-gray-700 block mb-1.5">{t('professional.height')}</label>
        <div className="relative">
          <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="number"
            placeholder={t('professional.heightPlaceholder')}
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
          <ArrowLeft className="w-4 h-4" /> {t('nav.back')}
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!valid}
          className="flex-1 py-2.5 rounded-xl text-white font-semibold text-sm transition-opacity hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
          style={{ background: '#10B981' }}
        >
          {t('nav.continue')} <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
