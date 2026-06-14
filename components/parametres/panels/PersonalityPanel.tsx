'use client'

import { useState } from 'react'
import { useCurrentUser } from '@/lib/use-current-user'
import SettingsDrawer from '../SettingsDrawer'
import ThemeTextSection from '../ThemeTextSection'

type Props = { open: boolean; onClose: () => void }

const INTEREST_THEMES = ['Football','Lecture','Voyages','Cuisine','Informatique','Natation','Randonnée','Musique','Art','Jardinage']
const QUALITY_THEMES  = ['Responsable','Sincère','Patient','Généreux','Fiable','Attentionné','Organisé','Empathique']
const FLAW_THEMES     = ['Perfectionniste','Timide','Têtu','Impatient','Désorganisé','Maladroit']

export default function PersonalityPanel({ open, onClose }: Props) {
  const mockUser = useCurrentUser()
  const [interests, setInterests] = useState(mockUser.interests)
  const [qualities, setQualities] = useState(mockUser.qualities)
  const [flaws, setFlaws]         = useState('')

  return (
    <SettingsDrawer open={open} title="Personnalité" onClose={onClose}
      footer={
        <button onClick={onClose} className="w-full py-3 bg-[#10B981] text-white text-sm font-semibold rounded-xl hover:bg-[#059669] transition-colors">
          Enregistrer et fermer
        </button>
      }
    >
      <div className="px-4 py-5">
        <ThemeTextSection
          label="Centres d'intérêt"
          value={interests}
          onChange={setInterests}
          maxLength={300}
          placeholder="Tes passions, loisirs…"
          themes={INTEREST_THEMES}
        />
        <ThemeTextSection
          label="Mes qualités"
          value={qualities}
          onChange={setQualities}
          maxLength={300}
          placeholder="Ce qui te décrit le mieux…"
          themes={QUALITY_THEMES}
        />
        <ThemeTextSection
          label="Mes défauts"
          value={flaws}
          onChange={setFlaws}
          maxLength={300}
          placeholder="L'authenticité est une qualité…"
          themes={FLAW_THEMES}
          hint="L'honnêteté est appréciée ! Partager tes défauts renforce la confiance."
        />
      </div>
    </SettingsDrawer>
  )
}
