'use client'

import { useTranslations } from 'next-intl'
import { useOnboardingStore } from '@/store/onboarding.store'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

type Props = { onNext: () => void; onBack: () => void }

const DAYS   = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0'))
const MONTH_VALUES = ['01','02','03','04','05','06','07','08','09','10','11','12'] as const
const currentYear = new Date().getFullYear()
const YEARS = Array.from({ length: 60 }, (_, i) => String(currentYear - 18 - i))

function calcAge(day: string, month: string, year: string): number | null {
  if (!day || !month || !year) return null
  const birth = new Date(+year, +month - 1, +day)
  const now   = new Date()
  let age = now.getFullYear() - birth.getFullYear()
  const m = now.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--
  return age
}

export default function StepAge({ onNext, onBack }: Props) {
  const t = useTranslations('onboarding')
  const { birthDate, setField } = useOnboardingStore()
  const day   = birthDate?.day   ?? ''
  const month = birthDate?.month ?? ''
  const year  = birthDate?.year  ?? ''

  const setDate = (part: 'day' | 'month' | 'year', value: string) => {
    setField('birthDate', { day, month, year, [part]: value })
  }

  const age = calcAge(day, month, year)
  const valid = !!age && age >= 18 && age <= 80

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-serif font-bold text-gray-900">{t('age.title')}</h2>
        <p className="text-sm text-gray-500">{t('age.subtitle')}</p>
      </div>

      {/* Age banner */}
      {age !== null && (
        <div className={cn(
          'rounded-xl p-4 text-center transition-all',
          valid ? 'bg-emerald-50 border border-emerald-200' : 'bg-red-50 border border-red-200',
        )}>
          <p className={cn('text-2xl font-bold', valid ? 'text-emerald-700' : 'text-red-600')}>
            {t('age.yearsOld', { age })}
          </p>
          {!valid && age < 18 && (
            <p className="text-xs text-red-500 mt-1">{t('age.tooYoung')}</p>
          )}
        </div>
      )}

      {/* Selects */}
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="text-xs font-semibold text-gray-600 block mb-1.5">{t('age.day')}</label>
          <select
            value={day}
            onChange={e => setDate('day', e.target.value)}
            className="w-full py-2.5 px-3 rounded-xl border border-gray-200 text-sm text-gray-900 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 bg-white"
          >
            <option value="">--</option>
            {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-600 block mb-1.5">{t('age.month')}</label>
          <select
            value={month}
            onChange={e => setDate('month', e.target.value)}
            className="w-full py-2.5 px-3 rounded-xl border border-gray-200 text-sm text-gray-900 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 bg-white"
          >
            <option value="">--</option>
            {MONTH_VALUES.map(m => <option key={m} value={m}>{t(`age.months.${m}`)}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-600 block mb-1.5">{t('age.year')}</label>
          <select
            value={year}
            onChange={e => setDate('year', e.target.value)}
            className="w-full py-2.5 px-3 rounded-xl border border-gray-200 text-sm text-gray-900 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 bg-white"
          >
            <option value="">----</option>
            {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {/* Navigation */}
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
