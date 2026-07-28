'use client'

import { SlidersHorizontal, Lock, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useExplorerStore } from '@/store/explorer.store'

const CRITERIA = [
  'madhhab', 'education', 'region', 'projetHijra', 'polygamie',
  'souhaitEnfants', 'situation', 'enfants', 'peutDemenager',
] as const

export default function AdvancedFiltersModal() {
  const router = useRouter()
  const t = useTranslations('dashboard.explorer.advancedFiltersModal')
  const { showAdvancedFiltersModal, setShowAdvancedFiltersModal, setAdvancedFilterTouched } = useExplorerStore()

  if (!showAdvancedFiltersModal) return null

  const close = () => setShowAdvancedFiltersModal(false)

  const handlePremium = () => {
    close()
    setAdvancedFilterTouched(false)
    router.push('/dashboard/premium')
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-6"
      style={{ background: 'rgba(0,0,0,0.55)' }}
    >
      <div className="bg-white rounded-2xl p-8 w-full max-w-sm shadow-2xl space-y-6">
        <div className="flex justify-end -mt-2 -mr-2">
          <button
            onClick={close}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <div className="text-center space-y-3 -mt-6">
          <div className="w-16 h-16 rounded-full bg-amber-100 mx-auto flex items-center justify-center">
            <SlidersHorizontal className="w-7 h-7 text-amber-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">{t('title')}</h2>
          <p className="text-sm text-gray-500 leading-relaxed">{t('desc')}</p>
        </div>

        <div className="flex flex-wrap gap-2 justify-center">
          {CRITERIA.map(key => (
            <span
              key={key}
              className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 text-xs font-medium px-3 py-1.5 rounded-full"
            >
              <Lock className="w-3 h-3" />
              {t(`criteria.${key}`)}
            </span>
          ))}
        </div>

        <p className="text-center text-sm italic text-gray-500">
          {t('tagline')}
        </p>

        <button
          onClick={handlePremium}
          className="w-full bg-amber-600 text-white py-3 rounded-xl font-semibold text-sm hover:bg-amber-500 transition-colors"
        >
          {t('cta')}
        </button>
        <button
          onClick={close}
          className="w-full text-sm text-gray-500 hover:text-gray-700 transition-colors -mt-3"
        >
          {t('later')}
        </button>
      </div>
    </div>
  )
}
