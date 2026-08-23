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

// Clés de thèmes envoyées à l'IA ; le libellé affiché est traduit.
const INTEREST_THEMES = ['football','reading','travel','cooking','tech','swimming','hiking','music','art','gardening']
const QUALITY_THEMES  = ['responsible','sincere','patient','generous','reliable','caring','organized','empathetic']
const FLAW_THEMES     = ['perfectionist','shy','stubborn','impatient','disorganized','clumsy']

export default function PersonalityPanel({ open, onClose }: Props) {
  const t = useTranslations('dashboard.parametres.personality')
  const tp = useTranslations('dashboard.parametres')
  const tt = useTranslations('dashboard.parametres.themes')
  const themes = (keys: string[]) => keys.map(value => ({ value, label: tt(value) }))
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
          label={t('interestsLabel')}
          value={interests}
          onChange={setInterests}
          maxLength={300}
          placeholder={t('interestsPlaceholder')}
          themes={themes(INTEREST_THEMES)}
        />
        <ThemeTextSection
          label={t('qualitiesLabel')}
          value={qualities}
          onChange={setQualities}
          maxLength={300}
          placeholder={t('qualitiesPlaceholder')}
          themes={themes(QUALITY_THEMES)}
        />
        <ThemeTextSection
          label={t('flawsLabel')}
          value={flaws}
          onChange={setFlaws}
          maxLength={300}
          placeholder={t('flawsPlaceholder')}
          themes={themes(FLAW_THEMES)}
          hint={t('flawsHint')}
        />
      </div>
    </SettingsDrawer>
  )
}
