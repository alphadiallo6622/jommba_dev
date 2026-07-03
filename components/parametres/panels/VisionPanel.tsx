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

const VISION_THEMES = ['Sérénité','Confiance','Entraide','Fidélité','Respect','Piété','Famille','Communication']
const SEEKING_THEMES = ['Piété','Douceur','Sérieux','Maturité','Sincérité','Responsabilité','Humilité']
const DEALBREAKER_THEMES = ['Malhonnêteté','Manque de respect','Absence de piété','Infidélité','Violence']

export default function VisionPanel({ open, onClose }: Props) {
  const mockUser = useCurrentUser()
  const { user } = useAuth()
  const [vision, setVision]             = useState(mockUser.marriageVision)
  const [seeking, setSeeking]           = useState(mockUser.seeking)
  const [dealbreakers, setDealbreakers] = useState(mockUser.dealbreakers)
  const [saving, setSaving]             = useState(false)

  // Réinitialise quand le profil réel est chargé dans le store
  useEffect(() => {
    setVision(mockUser.marriageVision)
    setSeeking(mockUser.seeking)
    setDealbreakers(mockUser.dealbreakers)
  }, [mockUser])

  const save = async () => {
    if (!user) return
    setSaving(true)
    const err = await updateMyProfile(user.id, {
      marriage_vision: vision.trim() || null,
      seeking:         seeking.trim() || null,
      dealbreakers:    dealbreakers.trim() || null,
    })
    setSaving(false)
    if (err) { toast.error(`Erreur : ${err}`); return }
    toast.success('Vision sauvegardée ✓')
    onClose()
  }

  return (
    <SettingsDrawer open={open} title="Ma vision" onClose={onClose}
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
          label="Ma vision du mariage"
          value={vision}
          onChange={setVision}
          maxLength={500}
          placeholder="Décris ce que le mariage représente pour toi…"
          themes={VISION_THEMES}
        />
        <ThemeTextSection
          label="Ce que je recherche"
          value={seeking}
          onChange={setSeeking}
          maxLength={500}
          placeholder="Décris le profil que tu recherches…"
          themes={SEEKING_THEMES}
        />
        <ThemeTextSection
          label="Ce que je n'accepte pas"
          value={dealbreakers}
          onChange={setDealbreakers}
          maxLength={300}
          placeholder="Tes lignes rouges…"
          themes={DEALBREAKER_THEMES}
        />
      </div>
    </SettingsDrawer>
  )
}
