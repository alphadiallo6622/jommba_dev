'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
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
  const t = useTranslations('dashboard.parametres.vision')
  const tp = useTranslations('dashboard.parametres')
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
    if (err) { toast.error(t('error', { msg: err })); return }
    toast.success(t('saved'))
    onClose()
  }

  return (
    <SettingsDrawer open={open} title={t('title')} onClose={onClose}
      footer={
        <button
          onClick={save}
          disabled={saving}
          className="w-full py-3 bg-[#10B981] text-white text-sm font-semibold rounded-xl hover:bg-[#059669] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {saving && <Loader2 className="w-4 h-4 animate-spin" />}
          {tp('saveAndClose')}
        </button>
      }
    >
      <div className="px-4 py-5">
        <ThemeTextSection
          label={t('visionLabel')}
          value={vision}
          onChange={setVision}
          maxLength={500}
          placeholder={t('visionPlaceholder')}
          themes={VISION_THEMES}
        />
        <ThemeTextSection
          label={t('seekingLabel')}
          value={seeking}
          onChange={setSeeking}
          maxLength={500}
          placeholder={t('seekingPlaceholder')}
          themes={SEEKING_THEMES}
        />
        <ThemeTextSection
          label={t('dealbreakersLabel')}
          value={dealbreakers}
          onChange={setDealbreakers}
          maxLength={300}
          placeholder={t('dealbreakersPlaceholder')}
          themes={DEALBREAKER_THEMES}
        />
      </div>
    </SettingsDrawer>
  )
}
