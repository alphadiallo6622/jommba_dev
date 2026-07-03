'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { useCurrentUser } from '@/lib/use-current-user'
import { useAuth } from '@/components/providers/AuthProvider'
import { updateMyProfile } from '@/lib/supabase/profile-actions'
import SettingsDrawer from '../SettingsDrawer'
import ThemeTextSection from '../ThemeTextSection'

type Props = { open: boolean; onClose: () => void }

const INTEREST_THEMES = ['Football','Lecture','Voyages','Cuisine','Informatique','Natation','Randonnée','Musique','Art','Jardinage']
const QUALITY_THEMES  = ['Responsable','Sincère','Patient','Généreux','Fiable','Attentionné','Organisé','Empathique']
const FLAW_THEMES     = ['Perfectionniste','Timide','Têtu','Impatient','Désorganisé','Maladroit']

export default function PersonalityPanel({ open, onClose }: Props) {
  const mockUser = useCurrentUser()
  const { user } = useAuth()
  const [interests, setInterests] = useState(mockUser.interests)
  const [qualities, setQualities] = useState(mockUser.qualities)
  const [flaws, setFlaws]         = useState(mockUser.flaws)
  const [saving, setSaving]       = useState(false)

  // Réinitialise quand le profil réel est chargé dans le store
  useEffect(() => {
    setInterests(mockUser.interests)
    setQualities(mockUser.qualities)
    setFlaws(mockUser.flaws)
  }, [mockUser])

  const save = async () => {
    if (!user) return
    setSaving(true)
    const err = await updateMyProfile(user.id, {
      interests: interests.trim() || null,
      qualities: qualities.trim() || null,
      flaws:     flaws.trim() || null,
    })
    setSaving(false)
    if (err) { toast.error(`Erreur : ${err}`); return }
    toast.success('Personnalité sauvegardée ✓')
    onClose()
  }

  return (
    <SettingsDrawer open={open} title="Personnalité" onClose={onClose}
      footer={
        <button
          onClick={save}
          disabled={saving}
          className="w-full py-3 bg-[#10B981] text-white text-sm font-semibold rounded-xl hover:bg-[#059669] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {saving && <Loader2 className="w-4 h-4 animate-spin" />}
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
