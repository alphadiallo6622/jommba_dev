'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { CheckCircle } from 'lucide-react'
import { useCurrentUser } from '@/lib/use-current-user'
import SettingsDrawer from '../SettingsDrawer'

type Props = { open: boolean; onClose: () => void }

const DAYS   = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0'))
const MONTHS = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc']
const YEARS  = Array.from({ length: 50 }, (_, i) => String(2005 - i))

const SITUATIONS  = ['Célibataire', 'Divorcé(e)', 'Veuf/Veuve', 'Marié(e) - polygamie']
const ENFANTS_OPT = ['Aucun', '1', '2', '3', '4+']

export default function InfosPanel({ open, onClose }: Props) {
  const mockUser = useCurrentUser()
  const [firstName, setFirstName] = useState(mockUser.firstName)
  const [lastName, setLastName]   = useState(mockUser.lastName)
  const [day, setDay]     = useState('15')
  const [month, setMonth] = useState('03')
  const [year, setYear]   = useState('1992')
  const [height, setHeight] = useState(String(mockUser.height))
  const [situation, setSituation] = useState('Célibataire')
  const [enfants, setEnfants] = useState('Aucun')

  const save = () => {
    toast.success('Informations sauvegardées')
    onClose()
  }

  const select = 'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 bg-white focus:outline-none focus:border-[#10B981]'
  const input  = 'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-[#10B981]'

  return (
    <SettingsDrawer open={open} title="Mes informations" onClose={onClose}
      footer={
        <button onClick={save} className="w-full py-3 bg-[#10B981] text-white text-sm font-semibold rounded-xl hover:bg-[#059669] transition-colors">
          Sauvegarder
        </button>
      }
    >
      <div className="px-4 py-5 space-y-4">
        {/* Name */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Prénom</label>
          <input value={firstName} onChange={e => setFirstName(e.target.value)} className={input} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Nom</label>
          <input value={lastName} onChange={e => setLastName(e.target.value)} className={input} />
        </div>

        {/* DDN */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Date de naissance</label>
          <div className="grid grid-cols-3 gap-2">
            <select value={day} onChange={e => setDay(e.target.value)} className={select}>
              {DAYS.map(d => <option key={d}>{d}</option>)}
            </select>
            <select value={month} onChange={e => setMonth(e.target.value)} className={select}>
              {MONTHS.map((m, i) => <option key={i} value={String(i+1).padStart(2,'0')}>{m}</option>)}
            </select>
            <select value={year} onChange={e => setYear(e.target.value)} className={select}>
              {YEARS.map(y => <option key={y}>{y}</option>)}
            </select>
          </div>
          <div className="mt-2 flex items-center gap-1.5 bg-[#E1F5EE] px-3 py-2 rounded-lg">
            <CheckCircle className="w-3.5 h-3.5 text-[#10B981]" />
            <p className="text-xs text-[#10B981]">Ton âge sera calculé automatiquement et jamais modifiable après validation.</p>
          </div>
        </div>

        {/* Height */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Taille (cm)</label>
          <input type="number" value={height} onChange={e => setHeight(e.target.value)} className={input} min={140} max={220} />
        </div>

        {/* Situation */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Situation matrimoniale</label>
          <div className="grid grid-cols-2 gap-2">
            {SITUATIONS.map(s => (
              <button
                key={s}
                onClick={() => setSituation(s)}
                className={`py-2.5 text-xs font-medium rounded-xl border transition-colors ${
                  situation === s
                    ? 'bg-[#E1F5EE] border-[#10B981] text-[#10B981]'
                    : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Enfants */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Enfants</label>
          <div className="flex flex-wrap gap-2">
            {ENFANTS_OPT.map(e => (
              <button
                key={e}
                onClick={() => setEnfants(e)}
                className={`px-4 py-2 text-sm font-medium rounded-xl border transition-colors ${
                  enfants === e
                    ? 'bg-[#E1F5EE] border-[#10B981] text-[#10B981]'
                    : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                {e}
              </button>
            ))}
          </div>
        </div>
      </div>
    </SettingsDrawer>
  )
}
