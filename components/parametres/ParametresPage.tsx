'use client'

import { useState } from 'react'
import { ChevronRight, Camera, User, MapPin, Heart, Smile, EyeOff, Bell, Shield, Settings } from 'lucide-react'
import { useCurrentUser } from '@/lib/use-current-user'
import PhotoPanel        from './panels/PhotoPanel'
import InfosPanel        from './panels/InfosPanel'
import LocationPanel     from './panels/LocationPanel'
import VisionPanel       from './panels/VisionPanel'
import PersonalityPanel  from './panels/PersonalityPanel'
import ConfidentialityPanel from './panels/ConfidentialityPanel'
import NotificationsPanel from './panels/NotificationsPanel'
import SecurityPanel     from './panels/SecurityPanel'
import AccountPanel      from './panels/AccountPanel'

type PanelId = 'photo' | 'infos' | 'location' | 'vision' | 'personality' | 'religion' | 'lifeproject' | 'confidentiality' | 'notifications' | 'security' | 'account' | null

const SECTIONS = [
  { id: 'photo'           as PanelId, icon: Camera,   label: 'Mes photos',              sub: '1 photo ajoutée' },
  { id: 'infos'           as PanelId, icon: User,     label: 'Mes informations',         sub: 'Prénom, âge, taille, situation' },
  { id: 'location'        as PanelId, icon: MapPin,   label: 'Localisation & parcours',  sub: 'Ville, profession, études' },
  { id: 'vision'          as PanelId, icon: Heart,    label: 'Ma vision',                sub: 'Mariage, attentes, deal-breakers' },
  { id: 'personality'     as PanelId, icon: Smile,    label: 'Personnalité',             sub: 'Intérêts, qualités, défauts' },
  { id: 'confidentiality' as PanelId, icon: EyeOff,   label: 'Confidentialité',          sub: 'Photos floutées, données' },
  { id: 'notifications'   as PanelId, icon: Bell,     label: 'Notifications',            sub: 'Push et email' },
  { id: 'security'        as PanelId, icon: Shield,   label: 'Sécurité',                 sub: 'Mot de passe, vérification' },
  { id: 'account'         as PanelId, icon: Settings, label: 'Mon compte',               sub: 'Suspendre, supprimer' },
]

export default function ParametresPage() {
  const [activePanel, setActivePanel] = useState<PanelId>(null)
  const { profileCompletion: completion } = useCurrentUser()

  const close = () => setActivePanel(null)

  return (
    <div className="max-w-lg mx-auto px-4 py-4 pb-24">
      <h1 className="text-2xl font-bold text-[#064E3B] mb-5">Paramètres</h1>

      {/* Completion bar */}
      <div
        className="bg-white border border-gray-100 rounded-xl p-4 mb-5 cursor-pointer hover:border-[#10B981] transition-colors"
        onClick={() => setActivePanel('infos')}
      >
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-semibold text-gray-800">Complétion du profil</p>
          <span className="text-sm font-bold text-[#10B981]">{completion}%</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#10B981] rounded-full transition-all duration-500"
            style={{ width: `${completion}%` }}
          />
        </div>
        <p className="text-xs text-gray-400 mt-1.5">
          {completion < 100
            ? `Complète ton profil pour +${100 - completion}% de visibilité`
            : 'Profil complet · Félicitations !'}
        </p>
      </div>

      {/* Sections */}
      <div className="space-y-1">
        {SECTIONS.map(({ id, icon: Icon, label, sub }) => (
          <button
            key={id}
            onClick={() => setActivePanel(id)}
            className="w-full flex items-center gap-3 px-4 py-3.5 bg-white rounded-xl border border-gray-100 hover:border-[#10B981]/30 hover:bg-gray-50 transition-colors"
          >
            <div className="w-9 h-9 rounded-full bg-[#E1F5EE] flex items-center justify-center shrink-0">
              <Icon className="w-4 h-4 text-[#10B981]" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-medium text-gray-800">{label}</p>
              <p className="text-xs text-gray-400">{sub}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>
        ))}
      </div>

      {/* Panels */}
      <PhotoPanel        open={activePanel === 'photo'}           onClose={close} />
      <InfosPanel        open={activePanel === 'infos'}           onClose={close} />
      <LocationPanel     open={activePanel === 'location'}        onClose={close} />
      <VisionPanel       open={activePanel === 'vision'}          onClose={close} />
      <PersonalityPanel  open={activePanel === 'personality'}     onClose={close} />
      <ConfidentialityPanel open={activePanel === 'confidentiality'} onClose={close} />
      <NotificationsPanel  open={activePanel === 'notifications'} onClose={close} />
      <SecurityPanel     open={activePanel === 'security'}        onClose={close} />
      <AccountPanel      open={activePanel === 'account'}         onClose={close} />
    </div>
  )
}
