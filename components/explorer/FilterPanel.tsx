'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useExplorerStore } from '@/store/explorer.store'
import { cn } from '@/lib/utils'

const QUICK_FILTERS = ['Photo', 'Célibataire', '18-25', '26-35', '36+']
const FILTER_TABS = [
  { id: 'filters', label: '⚡ Filtres' },
  { id: 'country', label: '🌍 Pays' },
]

export default function FilterPanel() {
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
                <h3 className="font-bold text-gray-900 text-lg">Filtres</h3>
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
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Quick filters */}
              {activeTab === 'filters' && (
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Filtres rapides</p>
                  <div className="flex flex-wrap gap-2">
                    {QUICK_FILTERS.map(filter => {
                      const active = activeFilters.includes(filter)
                      return (
                        <button
                          key={filter}
                          onClick={() => toggleFilter(filter)}
                          className={cn(
                            'px-4 py-2 rounded-full text-sm font-medium border transition-all',
                            active
                              ? 'bg-emerald-50 border-emerald-500 text-emerald-600'
                              : 'bg-white border-gray-200 text-gray-600 hover:border-emerald-300',
                          )}
                        >
                          {filter}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {activeTab === 'country' && (
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Pays</p>
                  <div className="flex flex-wrap gap-2">
                    {['Sénégal', 'France', 'Guinée', 'Canada', 'Belgique', 'Maroc'].map(c => {
                      const active = activeFilters.includes(c)
                      return (
                        <button
                          key={c}
                          onClick={() => toggleFilter(c)}
                          className={cn(
                            'px-4 py-2 rounded-full text-sm font-medium border transition-all',
                            active
                              ? 'bg-emerald-50 border-emerald-500 text-emerald-600'
                              : 'bg-white border-gray-200 text-gray-600 hover:border-emerald-300',
                          )}
                        >
                          {c}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              <button
                onClick={() => setFiltersOpen(false)}
                className="w-full py-3 rounded-xl text-white font-semibold text-sm hover:opacity-90 transition-opacity"
                style={{ background: '#10B981' }}
              >
                Appliquer les filtres
                {activeFilters.length > 0 && ` (${activeFilters.length})`}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
