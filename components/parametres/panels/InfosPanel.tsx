'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { CheckCircle, Loader2 } from 'lucide-react'
import { useCurrentUser } from '@/lib/use-current-user'
import { useAuth } from '@/components/providers/AuthProvider'
import { updateMyProfile } from '@/lib/supabase/profile-actions'
import SettingsDrawer from '../SettingsDrawer'

type Props = { open: boolean; onClose: () => void }

// Valeur canonique (FR) stockée en base ; libellé traduit via `key`.
const SITUATIONS = [
  { value: 'Célibataire',          key: 'single' },
  { value: 'Divorcé(e)',           key: 'divorced' },
  { value: 'Veuf/Veuve',           key: 'widowed' },
  { value: 'Marié(e) - polygamie', key: 'polygamy' },
] as const
const SITUATION_VALUES = SITUATIONS.map(s => s.value) as string[]
const ENFANTS_OPT = ['Aucun', '1', '2', '3', '4+']

export default function InfosPanel({ open, onClose }: Props) {
  const t = useTranslations('dashboard.parametres.infos')
  const tp = useTranslations('dashboard.parametres')
  const mockUser = useCurrentUser()
  const { user } = useAuth()
  const [firstName, setFirstName] = useState(mockUser.firstName)
  const [lastName, setLastName]   = useState(mockUser.lastName)
  const [height, setHeight] = useState(String(mockUser.height))
  const [situation, setSituation] = useState('Célibataire')
  const [enfants, setEnfants] = useState('Aucun')
  const [saving, setSaving]   = useState(false)

  // Réinitialise le formulaire quand le profil réel est chargé dans le store
  useEffect(() => {
    setFirstName(mockUser.firstName)
    setLastName(mockUser.lastName)
    setHeight(String(mockUser.height))
    if (mockUser.tags[0] && SITUATION_VALUES.includes(mockUser.tags[0])) setSituation(mockUser.tags[0])
    const h = mockUser.lifeProject.hasChildren
    if (h && ENFANTS_OPT.includes(h)) setEnfants(h)
    else if (h === 'Non') setEnfants('Aucun')
  }, [mockUser])

  const save = async () => {
    if (!user) return
    if (!firstName.trim()) { toast.error(t('firstNameRequired')); return }

    setSaving(true)
    // L'âge n'est jamais renvoyé ici : il est fixé à l'onboarding et la date
    // de naissance n'est pas stockée en base (seul l'âge calculé l'est) —
    // il n'y a donc aucune source fiable pour le recalculer depuis ce panneau.
    const err = await updateMyProfile(user.id, {
      first_name:     firstName.trim(),
      last_name:      lastName.trim() || null,
      height:         height ? parseInt(height) : null,
      marital_status: situation,
      has_children:   enfants === 'Aucun' ? 'Non' : enfants,
    })
    setSaving(false)

    if (err) { toast.error(t('error', { msg: err })); return }
    toast.success(t('saved'))
    onClose()
  }

  const input  = 'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-[#10B981]'

  return (
    <SettingsDrawer open={open} title={t('title')} onClose={onClose}
      footer={
        <button
          onClick={save}
          disabled={saving}
          className="w-full py-3 bg-[#10B981] text-white text-sm font-semibold rounded-xl hover:bg-[#059669] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {saving && <Loader2 className="w-4 h-4 animate-spin" />}
          {tp('save')}
        </button>
      }
    >
      <div className="px-4 py-5 space-y-4">
        {/* Name */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">{t('firstName')}</label>
          <input value={firstName} onChange={e => setFirstName(e.target.value)} className={input} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">{t('lastName')}</label>
          <input value={lastName} onChange={e => setLastName(e.target.value)} className={input} />
        </div>

        {/* Âge — fixé à l'onboarding, non modifiable */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">{t('age')}</label>
          <div className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-500 bg-gray-50">
            {t('ageValue', { age: mockUser.age })}
          </div>
          <div className="mt-2 flex items-center gap-1.5 bg-[#E1F5EE] px-3 py-2 rounded-lg">
            <CheckCircle className="w-3.5 h-3.5 text-[#10B981]" />
            <p className="text-xs text-[#10B981]">{t('ageLocked')}</p>
          </div>
        </div>

        {/* Height */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">{t('height')}</label>
          <input type="number" value={height} onChange={e => setHeight(e.target.value)} className={input} min={140} max={220} />
        </div>

        {/* Situation */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">{t('maritalStatus')}</label>
          <div className="grid grid-cols-2 gap-2">
            {SITUATIONS.map(({ value, key }) => (
              <button
                key={value}
                onClick={() => setSituation(value)}
                className={`py-2.5 text-xs font-medium rounded-xl border transition-colors ${
                  situation === value
                    ? 'bg-[#E1F5EE] border-[#10B981] text-[#10B981]'
                    : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                {t(`situations.${key}`)}
              </button>
            ))}
          </div>
        </div>

        {/* Enfants */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">{t('children')}</label>
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
                {e === 'Aucun' ? t('childrenOptions.none') : e}
              </button>
            ))}
          </div>
        </div>
      </div>
    </SettingsDrawer>
  )
}
