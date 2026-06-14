'use client'

import { useState } from 'react'
import { Search, ChevronDown, ChevronUp, Mail, UserPlus, Heart, MessageCircle, Camera, Crown, Shield, Settings, BookOpen, CheckCircle } from 'lucide-react'
import { faqCategories, tutorialSteps, platformStats } from '@/lib/mock-aide'

const ICON_MAP: Record<string, React.ElementType> = {
  UserPlus, Heart, MessageCircle, Camera, Crown, Shield, Settings, BookOpen,
}

export default function AidePage() {
  const [search, setSearch]         = useState('')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [openItem, setOpenItem]     = useState<string | null>(null)

  const filtered = faqCategories.flatMap(cat =>
    cat.items
      .filter(item =>
        item.question.toLowerCase().includes(search.toLowerCase()) ||
        item.answer.toLowerCase().includes(search.toLowerCase())
      )
      .map(item => ({ ...item, catId: cat.id, catLabel: cat.label }))
  )

  const displayCategories = activeCategory
    ? faqCategories.filter(c => c.id === activeCategory)
    : faqCategories

  const displayItems = search.trim()
    ? filtered
    : displayCategories.flatMap(cat => cat.items.map(item => ({ ...item, catId: cat.id, catLabel: cat.label })))

  const toggleItem = (key: string) => setOpenItem(p => (p === key ? null : key))

  return (
    <div className="max-w-lg mx-auto px-4 py-4 pb-24">
      <h1 className="text-2xl font-bold text-[#064E3B] mb-1">Aide &amp; FAQ</h1>
      <p className="text-sm text-gray-500 mb-5">Trouve des réponses à tes questions</p>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Recherche une question…"
          className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-[#10B981]"
        />
      </div>

      {/* Category pills */}
      {!search.trim() && (
        <div className="flex gap-2 overflow-x-auto pb-1 mb-4 scrollbar-hide">
          <button
            onClick={() => setActiveCategory(null)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              !activeCategory ? 'bg-[#10B981] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Tout
          </button>
          {faqCategories.map(cat => {
            const Icon = ICON_MAP[cat.icon] ?? BookOpen
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(p => p === cat.id ? null : cat.id)}
                className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  activeCategory === cat.id ? 'bg-[#10B981] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Icon className="w-3 h-3" />{cat.label}
              </button>
            )
          })}
        </div>
      )}

      {/* FAQ accordion */}
      <div className="space-y-2 mb-6">
        {displayItems.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-8">Aucun résultat pour "{search}"</p>
        ) : (
          displayItems.map((item, idx) => {
            const key = `${item.catId}-${idx}`
            const isOpen = openItem === key
            return (
              <div key={key} className="bg-white border border-gray-100 rounded-xl overflow-hidden">
                <button
                  onClick={() => toggleItem(key)}
                  className="w-full flex items-center justify-between px-4 py-3.5 text-left"
                >
                  <p className="text-sm font-medium text-gray-800 pr-2">{item.question}</p>
                  {isOpen
                    ? <ChevronUp className="w-4 h-4 text-[#10B981] shrink-0" />
                    : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
                  }
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 border-t border-gray-50">
                    <p className="text-sm text-gray-600 mt-2 leading-relaxed">{item.answer}</p>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* Tutorial steps */}
      {!search.trim() && !activeCategory && (
        <div className="bg-[#E1F5EE] rounded-xl p-4 mb-5">
          <p className="text-sm font-bold text-[#064E3B] mb-3">Guide de démarrage rapide</p>
          <div className="space-y-3">
            {tutorialSteps.map(({ step, title, description }) => (
              <div key={step} className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-[#10B981] text-white text-xs font-bold flex items-center justify-center shrink-0">
                  {step}
                </span>
                <div>
                  <p className="text-sm font-semibold text-[#064E3B]">{title}</p>
                  <p className="text-xs text-[#10B981]">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats */}
      {!search.trim() && !activeCategory && (
        <div className="grid grid-cols-2 gap-3 mb-5">
          {[
            { label: 'Membres actifs', value: platformStats.members },
            { label: 'Couples formés', value: platformStats.couples },
            { label: 'Pays', value: platformStats.countries },
            { label: 'Satisfaction', value: platformStats.satisfaction },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white border border-gray-100 rounded-xl p-3 text-center">
              <p className="text-xl font-bold text-[#10B981]">{value}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Contact CTA */}
      <div className="bg-white border border-gray-100 rounded-xl p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 bg-[#E1F5EE] rounded-full flex items-center justify-center">
            <Mail className="w-4 h-4 text-[#10B981]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800">Tu n'as pas trouvé ta réponse ?</p>
            <p className="text-xs text-gray-500">Notre équipe te répond en moins de 24 h</p>
          </div>
        </div>
        <a
          href="mailto:support@jommba224.com"
          className="block w-full py-2.5 bg-[#10B981] text-white text-sm font-semibold text-center rounded-xl hover:bg-[#059669] transition-colors"
        >
          Contacter le support
        </a>
      </div>
    </div>
  )
}
