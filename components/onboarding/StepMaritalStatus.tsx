'use client'

import { useTranslations } from 'next-intl'
import { useOnboardingStore } from '@/store/onboarding.store'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

type Props = { onNext: () => void; onBack: () => void }

const OPTIONS = [
  { value: 'celibataire', key: 'single',   emoji: '💍' },
  { value: 'divorce',     key: 'divorced', emoji: '📄' },
  { value: 'veuf',        key: 'widowed',  emoji: '🤲' },
  { value: 'marie',       key: 'married',  emoji: '👪' },
] as const

export default function StepMaritalStatus({ onNext, onBack }: Props) {
  const t = useTranslations('onboarding')
  const { maritalStatus, setField } = useOnboardingStore()

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-serif font-bold text-gray-900">{t('marital.title')}</h2>
        <p className="text-sm text-gray-500">{t('marital.subtitle')}</p>
      </div>

      <div className="space-y-3">
        {OPTIONS.map(({ value, key, emoji }) => (
          <button
            key={value}
            type="button"
            onClick={() => setField('maritalStatus', value)}
            className={cn(
              'w-full flex items-center gap-4 px-4 py-3.5 rounded-xl border-2 text-left transition-all',
              maritalStatus === value
                ? 'border-emerald-500 bg-emerald-50'
                : 'border-gray-200 bg-white hover:border-emerald-300',
            )}
          >
            <span className="text-2xl">{emoji}</span>
            <div>
              <p className={cn('text-sm font-semibold', maritalStatus === value ? 'text-emerald-700' : 'text-gray-800')}>
                {t(`marital.${key}`)}
              </p>
              <p className="text-xs text-gray-500">{t(`marital.${key}Desc`)}</p>
            </div>
            {maritalStatus === value && (
              <div className="ml-auto w-5 h-5 rounded-full flex items-center justify-center" style={{ background: '#10B981' }}>
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
          </button>
        ))}
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
          disabled={!maritalStatus}
          className="flex-1 py-2.5 rounded-xl text-white font-semibold text-sm transition-opacity hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
          style={{ background: '#10B981' }}
        >
          {t('nav.continue')} <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
