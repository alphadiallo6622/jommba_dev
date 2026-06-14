'use client'

import { useState } from 'react'
import { Bot } from 'lucide-react'
import { ExplorerProfile } from '@/lib/mock-explorer'
import ReportModal from './ReportModal'
import BlockModal  from './BlockModal'

type Props = { profile: ExplorerProfile }

export default function ProfileDetails({ profile }: Props) {
  const [showReport, setShowReport] = useState(false)
  const [showBlock,  setShowBlock]  = useState(false)

  const sections = [
    { emoji: '💫', label: 'CE QUE JE RECHERCHE', content: profile.ceQueJeRecherche },
    { emoji: '⚡', label: "CENTRES D'INTÉRÊT",   content: profile.centresInteret   },
    { emoji: '✨', label: 'MES QUALITÉS',         content: profile.mesQualites      },
  ]

  const infoRows = [
    { label: 'MADHHAB',         value: profile.info.madhhab        },
    { label: 'ÉDUCATION',       value: profile.info.education      },
    { label: 'ENFANTS',         value: profile.info.enfants        },
    { label: 'SOUHAIT ENFANTS', value: profile.info.souhaitEnfants },
    { label: 'PEUT DÉMÉNAGER',  value: profile.info.peutDemenager  },
    { label: 'POLYGAMIE',       value: profile.info.polygamie      },
  ]

  return (
    <>
      <div className="space-y-3 mt-3">
        {/* Detail sections */}
        {sections.map(({ emoji, label, content }) => (
          <div key={label} className="bg-white rounded-2xl p-5 shadow-sm">
            <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-2">
              {emoji} {label}
            </p>
            <p className="text-sm text-gray-700 leading-relaxed">{content}</p>
          </div>
        ))}

        {/* Information table */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-4">
            ℹ️ INFORMATIONS
          </p>
          <div className="grid grid-cols-2 gap-y-4 gap-x-3">
            {infoRows.map(({ label, value }) => (
              <div key={label}>
                <p className="text-[10px] text-gray-400 uppercase font-semibold tracking-wider">{label}</p>
                <p className="text-sm font-semibold text-gray-900 mt-0.5">{value}</p>
              </div>
            ))}
          </div>

          {/* Match IA */}
          <button
            className="mt-5 w-full py-3 rounded-xl flex items-center justify-center gap-2 font-medium text-sm transition-opacity hover:opacity-80"
            style={{ background: '#E1F5EE', color: '#10B981' }}
          >
            <Bot className="w-4 h-4" />
            Match IA ✦
          </button>
        </div>

        {/* Block / Report */}
        <div className="flex gap-3 pb-6">
          <button
            onClick={() => setShowBlock(true)}
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-500 text-sm hover:bg-red-50 hover:border-red-200 hover:text-red-500 transition-colors"
          >
            ⛔ Bloquer
          </button>
          <button
            onClick={() => setShowReport(true)}
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-500 text-sm hover:bg-amber-50 hover:border-amber-200 hover:text-amber-600 transition-colors"
          >
            🚩 Signaler
          </button>
        </div>
      </div>

      {/* Modals */}
      {showReport && (
        <ReportModal
          profileName={profile.firstName}
          onClose={() => setShowReport(false)}
        />
      )}
      {showBlock && (
        <BlockModal
          profileName={profile.firstName}
          onClose={() => setShowBlock(false)}
        />
      )}
    </>
  )
}
