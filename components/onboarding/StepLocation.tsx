'use client'

import { useTranslations } from 'next-intl'
import { useOnboardingStore } from '@/store/onboarding.store'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

type Props = { onNext: () => void; onBack: () => void }

const AFRICA_COUNTRIES = [
  'Algérie', 'Cameroun', 'Côte d\'Ivoire', 'Guinée', 'Mali', 'Maroc',
  'Mauritanie', 'Niger', 'Sénégal', 'Somalie', 'Tchad', 'Tunisie',
]
const DIASPORA_COUNTRIES = [
  'Belgique', 'Canada', 'Espagne', 'États-Unis', 'France', 'Allemagne',
  'Italie', 'Pays-Bas', 'Royaume-Uni', 'Suisse',
]
const SENEGAL_REGIONS = [
  'Dakar', 'Thiès', 'Diourbel', 'Saint-Louis', 'Tambacounda',
  'Kaolack', 'Ziguinchor', 'Louga', 'Fatick', 'Kolda',
]

export default function StepLocation({ onNext, onBack }: Props) {
  const t = useTranslations('onboarding')
  const { location, setField } = useOnboardingStore()
  const type = location?.type ?? null

  const setType = (t: 'afrique' | 'diaspora') => {
    setField('location', { type: t, country: '', region: '', residenceCountry: '' })
  }

  const setCountry = (country: string) => {
    setField('location', { ...location!, country, region: '' })
  }

  const setRegion = (region: string) => {
    setField('location', { ...location!, region })
  }

  const setResidenceCountry = (residenceCountry: string) => {
    setField('location', { ...location!, residenceCountry })
  }

  const valid = !!location?.type && !!location?.country

  return (
    <div className="space-y-7">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-serif font-bold text-gray-900">{t('location.title')}</h2>
        <p className="text-sm text-gray-500">{t('location.subtitle')}</p>
      </div>

      {/* Afrique / Diaspora toggle */}
      <div className="grid grid-cols-2 gap-3">
        {([
          { value: 'afrique',  emoji: '🌍', label: t('location.africa'),   desc: t('location.africaDesc') },
          { value: 'diaspora', emoji: '✈️', label: t('location.diaspora'), desc: t('location.diasporaDesc') },
        ] as const).map(({ value, emoji, label, desc }) => (
          <button
            key={value}
            type="button"
            onClick={() => setType(value)}
            className={cn(
              'flex flex-col items-center justify-center gap-1.5 py-5 rounded-xl border-2 transition-all text-sm',
              type === value
                ? 'border-emerald-500 bg-emerald-50 text-emerald-700 font-semibold'
                : 'border-gray-200 bg-white text-gray-600 hover:border-emerald-300',
            )}
          >
            <span className="text-xl">{emoji}</span>
            <span className="font-semibold">{label}</span>
            <span className="text-xs text-gray-400 font-normal">{desc}</span>
          </button>
        ))}
      </div>

      {/* Country select */}
      {type && (
        <div>
          <label className="text-xs font-semibold text-gray-700 block mb-1.5">
            {type === 'afrique' ? t('location.countryOfResidence') : t('location.countryOfOrigin')}
          </label>
          <select
            value={location?.country ?? ''}
            onChange={e => setCountry(e.target.value)}
            className="w-full py-2.5 px-3 rounded-xl border border-gray-200 text-sm text-gray-900 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 bg-white"
          >
            <option value="">{t('location.selectCountry')}</option>
            {(type === 'afrique' ? AFRICA_COUNTRIES : AFRICA_COUNTRIES).map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      )}

      {/* Region — dropdown pour le Sénégal, champ libre pour les autres pays africains */}
      {type === 'afrique' && location?.country === 'Sénégal' && (
        <div>
          <label className="text-xs font-semibold text-gray-700 block mb-1.5">{t('location.region')}</label>
          <select
            value={location?.region ?? ''}
            onChange={e => setRegion(e.target.value)}
            className="w-full py-2.5 px-3 rounded-xl border border-gray-200 text-sm text-gray-900 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 bg-white"
          >
            <option value="">{t('location.selectRegion')}</option>
            {SENEGAL_REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
      )}
      {type === 'afrique' && location?.country && location.country !== 'Sénégal' && (
        <div>
          <label className="text-xs font-semibold text-gray-700 block mb-1.5">{t('location.city')}</label>
          <input
            type="text"
            value={location?.region ?? ''}
            onChange={e => setRegion(e.target.value)}
            placeholder={t('location.cityPlaceholderAfrica')}
            className="w-full py-2.5 px-3 rounded-xl border border-gray-200 text-sm text-gray-900 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 bg-white"
          />
        </div>
      )}

      {/* Diaspora residence country */}
      {type === 'diaspora' && location?.country && (
        <div>
          <label className="text-xs font-semibold text-gray-700 block mb-1.5">{t('location.currentResidenceCountry')}</label>
          <select
            value={location?.residenceCountry ?? ''}
            onChange={e => setResidenceCountry(e.target.value)}
            className="w-full py-2.5 px-3 rounded-xl border border-gray-200 text-sm text-gray-900 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 bg-white"
          >
            <option value="">{t('location.select')}</option>
            {DIASPORA_COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      )}

      {/* Diaspora ville */}
      {type === 'diaspora' && location?.residenceCountry && (
        <div>
          <label className="text-xs font-semibold text-gray-700 block mb-1.5">{t('location.city')}</label>
          <input
            type="text"
            value={location?.region ?? ''}
            onChange={e => setRegion(e.target.value)}
            placeholder={t('location.cityPlaceholderDiaspora')}
            className="w-full py-2.5 px-3 rounded-xl border border-gray-200 text-sm text-gray-900 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 bg-white"
          />
        </div>
      )}

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
