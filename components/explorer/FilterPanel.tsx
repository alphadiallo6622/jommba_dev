'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { ChevronDown, Lock, Search, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useExplorerStore } from '@/store/explorer.store'
import { useCurrentUser } from '@/lib/use-current-user'
import { COUNTRIES } from '@/lib/countries'
import { ALL_COUNTRIES_VALUE } from '@/lib/explorer-filters'
import { cn } from '@/lib/utils'

// Valeur canonique (utilisée pour le filtrage) + clé de libellé traduit.
const QUICK_FILTERS = [
  { value: 'Photo',       key: 'photo' },
  { value: 'Célibataire', key: 'single' },
  { value: '18-25',       key: 'age1825' },
  { value: '26-35',       key: 'age2635' },
  { value: '36+',         key: 'age36' },
] as const

const ADVANCED_FIELDS = [
  'madhhab', 'education', 'polygamie', 'region', 'projetHijra', 'peutDemenager', 'situation', 'enfants', 'souhaitEnfants',
] as const

const FILTER_TABS = [
  { id: 'filters',  labelKey: 'tabFilters' },
  { id: 'country',  labelKey: 'tabCountry' },
  { id: 'advanced', labelKey: 'tabAdvanced' },
] as const

function CountrySelect({
  selected,
  onToggle,
  label,
  searchPlaceholder,
  allLabel,
}: {
  selected: string[]
  onToggle: (country: string) => void
  label: string
  searchPlaceholder: string
  allLabel: string
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selectedCountries = selected.filter(f => COUNTRIES.some(c => c.name === f))
  const allSelected = selected.includes(ALL_COUNTRIES_VALUE)

  const filteredCountries = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return COUNTRIES
    return COUNTRIES.filter(c => c.name.toLowerCase().includes(q))
  }, [query])

  let buttonText = label
  if (allSelected) buttonText = allLabel
  else if (selectedCountries.length > 0) buttonText = selectedCountries.join(', ')

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-gray-200 text-sm text-left hover:border-emerald-300 transition-colors"
      >
        <span className={cn('truncate', (allSelected || selectedCountries.length > 0) ? 'text-gray-900' : 'text-gray-400')}>
          {buttonText}
        </span>
        <ChevronDown className={cn('w-4 h-4 shrink-0 text-gray-400 transition-transform', open && 'rotate-180')} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute z-10 mt-2 w-full rounded-xl border border-gray-200 bg-white shadow-lg overflow-hidden"
          >
            <div className="p-2 border-b border-gray-100">
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  autoFocus
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-emerald-400"
                />
              </div>
            </div>

            <div className="max-h-56 overflow-y-auto py-1">
              <button
                type="button"
                onClick={() => onToggle(ALL_COUNTRIES_VALUE)}
                className={cn(
                  'w-full flex items-center justify-between px-4 py-2 text-sm text-left hover:bg-gray-50 transition-colors font-medium',
                  allSelected ? 'text-emerald-600' : 'text-gray-700',
                )}
              >
                {allLabel}
                {allSelected && <span className="text-emerald-500">✓</span>}
              </button>

              {filteredCountries.map(country => {
                const active = selected.includes(country.name)
                return (
                  <button
                    key={country.code}
                    type="button"
                    onClick={() => onToggle(country.name)}
                    className={cn(
                      'w-full flex items-center justify-between px-4 py-2 text-sm text-left hover:bg-gray-50 transition-colors',
                      active ? 'text-emerald-600 font-medium' : 'text-gray-700',
                    )}
                  >
                    {country.name}
                    {active && <span className="text-emerald-500">✓</span>}
                  </button>
                )
              })}
              {filteredCountries.length === 0 && (
                <p className="px-4 py-3 text-sm text-gray-400">—</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function FilterPanel() {
  const t = useTranslations('dashboard.explorer.filters')
  const {
    filtersOpen, activeFilters, setFiltersOpen, toggleFilter,
    setAdvancedFilterTouched, applyFilters, setShowAdvancedFiltersModal,
  } = useExplorerStore()
  const { isPremium } = useCurrentUser()
  const [activeTab, setActiveTab] = useState('filters')

  // Sélectionner "Tous les pays" retire les pays individuels (et inversement).
  const handleToggleCountry = (value: string) => {
    if (value === ALL_COUNTRIES_VALUE) {
      const others = activeFilters.filter(f => !COUNTRIES.some(c => c.name === f) && f !== ALL_COUNTRIES_VALUE)
      const isAllSelected = activeFilters.includes(ALL_COUNTRIES_VALUE)
      useExplorerStore.setState({ activeFilters: isAllSelected ? others : [...others, ALL_COUNTRIES_VALUE] })
      return
    }
    const withoutAll = activeFilters.filter(f => f !== ALL_COUNTRIES_VALUE)
    useExplorerStore.setState({ activeFilters: withoutAll })
    toggleFilter(value)
  }

  const handleApply = () => {
    if (!isPremium && useExplorerStore.getState().advancedFilterTouched) {
      setShowAdvancedFiltersModal(true)
      return
    }
    applyFilters()
    setFiltersOpen(false)
  }

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

          {/* Right side drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed inset-y-0 right-0 z-50 bg-white shadow-2xl w-full max-w-sm flex flex-col"
          >
            <div className="px-6 pt-6 pb-4 space-y-5 overflow-y-auto flex-1">
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
              <div className="flex flex-wrap gap-2">
                {FILTER_TABS.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      'px-4 py-2 rounded-full text-sm font-medium border transition-all flex items-center gap-1.5',
                      activeTab === tab.id
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-600'
                        : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300',
                    )}
                  >
                    {tab.id === 'advanced' && !isPremium && <Lock className="w-3 h-3" />}
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
                  <CountrySelect
                    selected={activeFilters}
                    onToggle={handleToggleCountry}
                    label={t('countryPlaceholder')}
                    searchPlaceholder={t('countrySearchPlaceholder')}
                    allLabel={t('allCountries')}
                  />
                </div>
              )}

              {activeTab === 'advanced' && (
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{t('advancedFilters')}</p>
                  {!isPremium && (
                    <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2">{t('advancedPremiumHint')}</p>
                  )}
                  <div className="grid grid-cols-1 gap-2">
                    {ADVANCED_FIELDS.map(field => (
                      <button
                        key={field}
                        type="button"
                        onClick={() => {
                          if (!isPremium) { setAdvancedFilterTouched(true); return }
                        }}
                        disabled={isPremium}
                        className={cn(
                          'w-full flex items-center justify-between px-4 py-3 rounded-xl border text-sm text-left transition-colors',
                          isPremium
                            ? 'border-gray-200 text-gray-700 hover:border-emerald-300'
                            : 'border-gray-200 text-gray-400 bg-gray-50 cursor-pointer',
                        )}
                      >
                        <span>{t(`advanced.${field}`)}</span>
                        {!isPremium && <Lock className="w-3.5 h-3.5 text-amber-500" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 pb-6 pt-3 border-t border-gray-100">
              <button
                onClick={handleApply}
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
