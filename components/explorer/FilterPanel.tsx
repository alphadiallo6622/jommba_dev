'use client'

import { useEffect, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { ChevronDown, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useExplorerStore } from '@/store/explorer.store'
import { cn } from '@/lib/utils'

const COUNTRIES = ['Sénégal', 'France', 'Guinée', 'Canada', 'Belgique', 'Maroc']

// Valeur canonique (utilisée pour le filtrage) + clé de libellé traduit.
const QUICK_FILTERS = [
  { value: 'Photo',       key: 'photo' },
  { value: 'Célibataire', key: 'single' },
  { value: '18-25',       key: 'age1825' },
  { value: '26-35',       key: 'age2635' },
  { value: '36+',         key: 'age36' },
] as const
const FILTER_TABS = [
  { id: 'filters', labelKey: 'tabFilters' },
  { id: 'country', labelKey: 'tabCountry' },
] as const

function CountrySelect({
  selected,
  onToggle,
  label,
}: {
  selected: string[]
  onToggle: (country: string) => void
  label: string
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selectedCountries = selected.filter(f => COUNTRIES.includes(f))

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-gray-200 text-sm text-left hover:border-emerald-300 transition-colors"
      >
        <span className={cn(selectedCountries.length > 0 ? 'text-gray-900' : 'text-gray-400')}>
          {selectedCountries.length > 0 ? selectedCountries.join(', ') : label}
        </span>
        <ChevronDown className={cn('w-4 h-4 text-gray-400 transition-transform', open && 'rotate-180')} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute z-10 mt-2 w-full max-h-56 overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-lg py-1"
          >
            {COUNTRIES.map(country => {
              const active = selected.includes(country)
              return (
                <button
                  key={country}
                  type="button"
                  onClick={() => onToggle(country)}
                  className={cn(
                    'w-full flex items-center justify-between px-4 py-2 text-sm text-left hover:bg-gray-50 transition-colors',
                    active ? 'text-emerald-600 font-medium' : 'text-gray-700',
                  )}
                >
                  {country}
                  {active && <span className="text-emerald-500">✓</span>}
                </button>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function FilterPanel() {
  const t = useTranslations('dashboard.explorer.filters')
  const { filtersOpen, activeFilters, setFiltersOpen, toggleFilter } = useExplorerStore()
  const [activeTab, setActiveTab] = useState('filters')

  return (
    <AnimatePresence>
      {filtersOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/30"
            onClick={() => setFiltersOpen(false)}
          />

          {/* Bottom sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-2xl shadow-2xl"
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-gray-200" />
            </div>

            <div className="px-6 pb-8 pt-3 space-y-5">
              {/* Header */}
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-900 text-lg">{t('title')}</h3>
                <button
                  onClick={() => setFiltersOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex gap-2">
                {FILTER_TABS.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      'px-4 py-2 rounded-full text-sm font-medium border transition-all',
                      activeTab === tab.id
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-600'
                        : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300',
                    )}
                  >
                    {t(tab.labelKey)}
                  </button>
                ))}
              </div>

              {/* Quick filters */}
              {activeTab === 'filters' && (
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">{t('quickFilters')}</p>
                  <div className="flex flex-wrap gap-2">
                    {QUICK_FILTERS.map(({ value, key }) => {
                      const active = activeFilters.includes(value)
                      return (
                        <button
                          key={value}
                          onClick={() => toggleFilter(value)}
                          className={cn(
                            'px-4 py-2 rounded-full text-sm font-medium border transition-all',
                            active
                              ? 'bg-emerald-50 border-emerald-500 text-emerald-600'
                              : 'bg-white border-gray-200 text-gray-600 hover:border-emerald-300',
                          )}
                        >
                          {t(`quick.${key}`)}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {activeTab === 'country' && (
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">{t('country')}</p>
                  <CountrySelect selected={activeFilters} onToggle={toggleFilter} label={t('countryPlaceholder')} />
                </div>
              )}

              <button
                onClick={() => setFiltersOpen(false)}
                className="w-full py-3 rounded-xl text-white font-semibold text-sm hover:opacity-90 transition-opacity"
                style={{ background: '#10B981' }}
              >
                {t('apply')}
                {activeFilters.length > 0 && ` (${activeFilters.length})`}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
