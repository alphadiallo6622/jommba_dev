'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { ChevronRight, Camera, User, MapPin, Heart, Smile, Crown, EyeOff, Bell, Shield, Settings } from 'lucide-react'
import { useCurrentUser } from '@/lib/use-current-user'
import PhotoPanel        from './panels/PhotoPanel'
import InfosPanel        from './panels/InfosPanel'
import LocationPanel     from './panels/LocationPanel'
import VisionPanel       from './panels/VisionPanel'
import PersonalityPanel  from './panels/PersonalityPanel'
import SubscriptionPanel   from './panels/SubscriptionPanel'
import ConfidentialityPanel from './panels/ConfidentialityPanel'
import NotificationsPanel from './panels/NotificationsPanel'
import SecurityPanel     from './panels/SecurityPanel'
import AccountPanel      from './panels/AccountPanel'

type PanelId = 'photo' | 'infos' | 'location' | 'vision' | 'personality' | 'religion' | 'lifeproject' | 'subscription' | 'confidentiality' | 'notifications' | 'security' | 'account' | null

const SECTIONS = [
  { id: 'photo'           as PanelId, icon: Camera,   key: 'photo' },
  { id: 'infos'           as PanelId, icon: User,     key: 'infos' },
  { id: 'location'        as PanelId, icon: MapPin,   key: 'location' },
  { id: 'vision'          as PanelId, icon: Heart,    key: 'vision' },
  { id: 'personality'     as PanelId, icon: Smile,    key: 'personality' },
  // Accent doré : la section abonnement se démarque des réglages de profil.
  { id: 'subscription'    as PanelId, icon: Crown,    key: 'subscription', accent: true },
  { id: 'confidentiality' as PanelId, icon: EyeOff,   key: 'confidentiality' },
  { id: 'notifications'   as PanelId, icon: Bell,     key: 'notifications' },
  { id: 'security'        as PanelId, icon: Shield,   key: 'security' },
  { id: 'account'         as PanelId, icon: Settings, key: 'account' },
] as const

export default function ParametresPage() {
  const t = useTranslations('dashboard.parametres')
  const [activePanel, setActivePanel] = useState<PanelId>(null)
  const { profileCompletion: completion } = useCurrentUser()

  const close = () => setActivePanel(null)

  return (
    <div className="max-w-lg mx-auto px-4 py-4 pb-24">
      <h1 className="text-2xl font-bold text-[#064E3B] mb-5">{t('title')}</h1>

      {/* Completion bar */}
      <div
        className="bg-white border border-gray-100 rounded-xl p-4 mb-5 cursor-pointer hover:border-[#10B981] transition-colors"
        onClick={() => setActivePanel('infos')}
      >
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-semibold text-gray-800">{t('completion')}</p>
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
            ? t('completionHint', { n: 100 - completion })
            : t('completionDone')}
        </p>
      </div>

      {/* Sections */}
      <div className="space-y-1">
        {SECTIONS.map((section) => {
          const { id, icon: Icon, key } = section
          const accent = 'accent' in section && section.accent
          return (
          <button
            key={id}
            onClick={() => setActivePanel(id)}
            className={`w-full flex items-center gap-3 px-4 py-3.5 bg-white rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors ${
              accent ? 'hover:border-amber-300' : 'hover:border-[#10B981]/30'
            }`}
          >
            <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
              accent ? 'bg-amber-100' : 'bg-[#E1F5EE]'
            }`}>
              <Icon className={`w-4 h-4 ${accent ? 'text-amber-500' : 'text-[#10B981]'}`} />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-medium text-gray-800">{t(`sections.${key}`)}</p>
              <p className="text-xs text-gray-400">{t(`sections.${key}Sub`)}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>
          )
        })}
      </div>

      {/* Panels */}
      <PhotoPanel        open={activePanel === 'photo'}           onClose={close} />
      <InfosPanel        open={activePanel === 'infos'}           onClose={close} />
      <LocationPanel     open={activePanel === 'location'}        onClose={close} />
      <VisionPanel       open={activePanel === 'vision'}          onClose={close} />
      <PersonalityPanel  open={activePanel === 'personality'}     onClose={close} />
      <SubscriptionPanel   open={activePanel === 'subscription'}    onClose={close} />
      <ConfidentialityPanel open={activePanel === 'confidentiality'} onClose={close} />
      <NotificationsPanel  open={activePanel === 'notifications'} onClose={close} />
      <SecurityPanel     open={activePanel === 'security'}        onClose={close} />
      <AccountPanel      open={activePanel === 'account'}         onClose={close} />
    </div>
  )
}
