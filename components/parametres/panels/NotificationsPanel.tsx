'use client'

import { useState } from 'react'
import { Bell, BellOff, Mail, AlertTriangle } from 'lucide-react'
import SettingsDrawer from '../SettingsDrawer'

type Props = { open: boolean; onClose: () => void }

export default function NotificationsPanel({ open, onClose }: Props) {
  const [pushEnabled, setPushEnabled] = useState(false)
  const [emailDemande, setEmailDemande]   = useState(true)
  const [emailMessage, setEmailMessage]   = useState(true)
  const [emailPromo, setEmailPromo]       = useState(true)

  const Toggle = ({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) => (
    <button
      onClick={() => onChange(!value)}
      className={`relative w-11 h-6 rounded-full transition-colors ${value ? 'bg-[#10B981]' : 'bg-gray-300'}`}
    >
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${value ? 'translate-x-5' : ''}`} />
    </button>
  )

  return (
    <SettingsDrawer open={open} title="Notifications" onClose={onClose}
      footer={
        <button onClick={onClose} className="w-full py-3 bg-gray-100 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-200 transition-colors">
          Fermer
        </button>
      }
    >
      <div className="px-4 py-5 space-y-4">
        {/* Push */}
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {pushEnabled ? <Bell className="w-4 h-4 text-[#10B981]" /> : <BellOff className="w-4 h-4 text-gray-400" />}
              <p className="text-sm font-semibold text-gray-800">Notifications push</p>
            </div>
            <Toggle value={pushEnabled} onChange={setPushEnabled} />
          </div>
          <p className="text-xs text-gray-500">Reçois des alertes en temps réel sur ton téléphone.</p>
          {!pushEnabled && (
            <div className="mt-3 flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
              <p className="text-xs text-amber-700">
                Active les notifications pour ne manquer aucun contact important.
              </p>
            </div>
          )}
        </div>

        {/* Email */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Mail className="w-4 h-4 text-gray-500" />
            <p className="text-sm font-semibold text-gray-700">Notifications par email</p>
          </div>
          <div className="space-y-3">
            {[
              { label: 'Nouvelles demandes de contact', value: emailDemande, onChange: setEmailDemande },
              { label: 'Nouveaux messages', value: emailMessage, onChange: setEmailMessage },
              { label: 'Offres et promotions', value: emailPromo, onChange: setEmailPromo },
            ].map(({ label, value, onChange }) => (
              <div key={label} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <p className="text-sm text-gray-700">{label}</p>
                <Toggle value={value} onChange={onChange} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </SettingsDrawer>
  )
}
