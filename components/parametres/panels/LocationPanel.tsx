'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import SettingsDrawer from '../SettingsDrawer'

type Props = { open: boolean; onClose: () => void }

const AFRICA_COUNTRIES  = ['Sénégal','Mali','Côte d\'Ivoire','Guinée','Mauritanie','Niger','Burkina Faso','Cameroun','Maroc','Algérie','Tunisie','Égypte']
const DIASPORA_COUNTRIES = ['France','Belgique','Suisse','Canada','États-Unis','Royaume-Uni','Espagne','Italie','Allemagne','Pays-Bas','Portugal']
const DAKAR_CITIES = ['Dakar','Thiès','Kaolack','Saint-Louis','Ziguinchor','Diourbel','Louga','Fatick','Kolda','Tambacounda']
const ETUDES = ['Bac','Bac+2','Bac+3','Bac+5','Doctorat','Autre']

export default function LocationPanel({ open, onClose }: Props) {
  const [inAfrica, setInAfrica] = useState(true)
  const [country, setCountry]   = useState('Sénégal')
  const [city, setCity]         = useState('Dakar')
  const [profession, setProfession] = useState('Comptable')
  const [etudes, setEtudes]     = useState('Bac+3')

  const save = () => { toast.success('Localisation sauvegardée'); onClose() }

  const countries = inAfrica ? AFRICA_COUNTRIES : DIASPORA_COUNTRIES

  const select = 'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 bg-white focus:outline-none focus:border-[#10B981]'
  const inputCls = 'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-[#10B981]'

  return (
    <SettingsDrawer open={open} title="Localisation & parcours" onClose={onClose}
      footer={
        <button onClick={save} className="w-full py-3 bg-[#10B981] text-white text-sm font-semibold rounded-xl hover:bg-[#059669] transition-colors">
          Sauvegarder
        </button>
      }
    >
      <div className="px-4 py-5 space-y-4">
        {/* Toggle Afrique/Diaspora */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Où vis-tu ?</label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'En Afrique', value: true },
              { label: 'Diaspora', value: false },
            ].map(({ label, value }) => (
              <button
                key={label}
                onClick={() => { setInAfrica(value); setCountry(value ? 'Sénégal' : 'France'); setCity('') }}
                className={`py-2.5 text-sm font-medium rounded-xl border transition-colors ${
                  inAfrica === value
                    ? 'bg-[#E1F5EE] border-[#10B981] text-[#10B981]'
                    : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Country */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Pays</label>
          <select value={country} onChange={e => setCountry(e.target.value)} className={select}>
            {countries.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>

        {/* City */}
        {inAfrica && country === 'Sénégal' ? (
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Ville</label>
            <select value={city} onChange={e => setCity(e.target.value)} className={select}>
              {DAKAR_CITIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
        ) : (
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Ville</label>
            <input value={city} onChange={e => setCity(e.target.value)} placeholder="Ex : Paris" className={inputCls} />
          </div>
        )}

        {/* Profession */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Profession</label>
          <input value={profession} onChange={e => setProfession(e.target.value)} placeholder="Ex : Ingénieur, Médecin…" className={inputCls} />
        </div>

        {/* Niveau études */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Niveau d'études</label>
          <div className="flex flex-wrap gap-2">
            {ETUDES.map(e => (
              <button
                key={e}
                onClick={() => setEtudes(e)}
                className={`px-4 py-2 text-sm font-medium rounded-xl border transition-colors ${
                  etudes === e
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
