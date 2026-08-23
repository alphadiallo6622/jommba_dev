'use client'

import { useTranslations } from 'next-intl'
import { useOnboardingStore } from '@/store/onboarding.store'
import { ArrowLeft, ArrowRight, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

type Props = { onNext: () => void; onBack: () => void }

// La valeur stockée reste stable (canonique FR) ; seul le libellé est traduit.
const MARRIAGE_VISIONS = [
  { value: 'Mariage dès que possible',   key: 'asap' },
  { value: 'Dans les 6 mois',            key: 'sixMonths' },
  { value: 'Dans l\'année',              key: 'thisYear' },
  { value: 'Pas pressé(e)',              key: 'noRush' },
  { value: 'Après connaissance sérieuse', key: 'afterKnowing' },
  { value: 'Besoin d\'istikhara',        key: 'istikhara' },
] as const
const SOUGHT_QUALITIES = [
  { value: 'Pratiquant(e)',  key: 'practicing' },
  { value: 'Sérieux(se)',    key: 'serious' },
  { value: 'Bon caractère',  key: 'goodCharacter' },
  { value: 'Famille unie',   key: 'unitedFamily' },
  { value: 'Travailleur(se)', key: 'hardworking' },
  { value: 'Discret(e)',     key: 'discreet' },
  { value: 'Patient(e)',     key: 'patient' },
  { value: 'Généreux(se)',   key: 'generous' },
] as const
const POLYGAMY_OPTIONS = [
  { value: 'non',   key: 'no' },
  { value: 'oui',   key: 'yes' },
  { value: 'selon', key: 'conditional' },
] as const
const CHILDREN_OPTIONS = [
  { value: 'oui', key: 'have' },
  { value: 'non', key: 'none' },
] as const

const MAX_PILLS = 3

export default function StepValues({ onNext, onBack }: Props) {
  const t = useTranslations('onboarding')
  const { values, setField } = useOnboardingStore()

  const toggle = (group: 'marriageVision' | 'soughtQualities', item: string) => {
    const current = values[group]
    if (current.includes(item)) {
      setField('values', { ...values, [group]: current.filter(i => i !== item) })
    } else if (current.length < MAX_PILLS) {
      setField('values', { ...values, [group]: [...current, item] })
    }
  }

  const valid =
    values.marriageVision.length > 0 &&
    values.soughtQualities.length > 0 &&
    values.polygamy !== '' &&
    values.children !== ''

  return (
    <div className="space-y-7">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-serif font-bold text-gray-900">{t('values.title')}</h2>
        <p className="text-sm text-gray-500">{t('values.subtitle')}</p>
      </div>

      {/* Marriage vision */}
      <div>
        <label className="text-xs font-semibold text-gray-700 block mb-2">
          {t('values.marriageVision')}
          <span className="ml-2 font-normal text-gray-400">({values.marriageVision.length}/{MAX_PILLS})</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {MARRIAGE_VISIONS.map(({ value, key }) => {
            const selected = values.marriageVision.includes(value)
            const disabled = !selected && values.marriageVision.length >= MAX_PILLS
            return (
              <button
                key={value}
                type="button"
                onClick={() => toggle('marriageVision', value)}
                disabled={disabled}
                className={cn(
                  'px-3 py-1.5 rounded-full text-xs font-medium border transition-all',
                  selected  ? 'border-emerald-500 bg-emerald-500 text-white' : '',
                  !selected && !disabled ? 'border-gray-200 bg-white text-gray-600 hover:border-emerald-300' : '',
                  disabled  ? 'border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed' : '',
                )}
              >
                {t(`values.visions.${key}`)}
              </button>
            )
          })}
        </div>
      </div>

      {/* Sought qualities */}
      <div>
        <label className="text-xs font-semibold text-gray-700 block mb-2">
          {t('values.soughtQualities')}
          <span className="ml-2 font-normal text-gray-400">({values.soughtQualities.length}/{MAX_PILLS})</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {SOUGHT_QUALITIES.map(({ value, key }) => {
            const selected = values.soughtQualities.includes(value)
            const disabled = !selected && values.soughtQualities.length >= MAX_PILLS
            return (
              <button
                key={value}
                type="button"
                onClick={() => toggle('soughtQualities', value)}
                disabled={disabled}
                className={cn(
                  'px-3 py-1.5 rounded-full text-xs font-medium border transition-all',
                  selected  ? 'border-emerald-500 bg-emerald-500 text-white' : '',
                  !selected && !disabled ? 'border-gray-200 bg-white text-gray-600 hover:border-emerald-300' : '',
                  disabled  ? 'border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed' : '',
                )}
              >
                {t(`values.qualities.${key}`)}
              </button>
            )
          })}
        </div>
      </div>

      {/* Polygamy */}
      <div>
        <label className="text-xs font-semibold text-gray-700 block mb-2">{t('values.polygamy')}</label>
        <div className="space-y-2">
          {POLYGAMY_OPTIONS.map(({ value, key }) => (
            <button
              key={value}
              type="button"
              onClick={() => setField('values', { ...values, polygamy: value })}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-sm text-left transition-all',
                values.polygamy === value
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700 font-semibold'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-emerald-300',
              )}
            >
              <div className={cn(
                'w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0',
                values.polygamy === value ? 'border-emerald-500' : 'border-gray-300',
              )}>
                {values.polygamy === value && <div className="w-2 h-2 rounded-full bg-emerald-500" />}
              </div>
              {t(`values.polygamyOptions.${key}`)}
            </button>
          ))}
        </div>
      </div>

      {/* Children */}
      <div>
        <label className="text-xs font-semibold text-gray-700 block mb-2">{t('values.children')}</label>
        <div className="grid grid-cols-2 gap-2">
          {CHILDREN_OPTIONS.map(({ value, key }) => (
            <button
              key={value}
              type="button"
              onClick={() => setField('values', { ...values, children: value })}
              className={cn(
                'px-3 py-2.5 rounded-xl border-2 text-xs font-medium text-center transition-all',
                values.children === value
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-emerald-300',
              )}
            >
              {t(`values.childrenOptions.${key}`)}
            </button>
          ))}
        </div>
      </div>

      {/* Bio note */}
      <div className="flex items-start gap-2.5 bg-blue-50 border border-blue-100 rounded-xl p-3.5">
        <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
        <p className="text-xs text-blue-600 leading-relaxed">
          {t('values.bioNote')}
        </p>
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
