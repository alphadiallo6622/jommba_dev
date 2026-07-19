'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { useCurrentUser } from '@/lib/use-current-user'
import { useAuth } from '@/components/providers/AuthProvider'
import { updateMyProfile } from '@/lib/supabase/profile-actions'
import { AFRICAN_COUNTRIES, NON_AFRICAN_COUNTRIES } from '@/lib/countries'
import SettingsDrawer from '../SettingsDrawer'

type Props = { open: boolean; onClose: () => void }

const AFRICA_COUNTRIES  = AFRICAN_COUNTRIES.map(c => c.name)
const DIASPORA_COUNTRIES = NON_AFRICAN_COUNTRIES.map(c => c.name)
const DAKAR_CITIES = ['Dakar','Thiès','Kaolack','Saint-Louis','Ziguinchor','Diourbel','Louga','Fatick','Kolda','Tambacounda']
const ETUDES = ['Bac','Bac+2','Bac+3','Bac+5','Doctorat','Autre']

export default function LocationPanel({ open, onClose }: Props) {
  const t = useTranslations('dashboard.parametres.location')
  const tp = useTranslations('dashboard.parametres')
  const mockUser = useCurrentUser()
  const { user } = useAuth()
  const [inAfrica, setInAfrica] = useState(true)
  const [country, setCountry]   = useState('Sénégal')
  const [city, setCity]         = useState('Dakar')
  const [profession, setProfession] = useState('')
  const [etudes, setEtudes]     = useState('Bac+3')
  const [saving, setSaving]     = useState(false)

  // Initialise depuis le profil réel chargé dans le store
  useEffect(() => {
    if (mockUser.country) {
      const isAfrica = AFRICA_COUNTRIES.includes(mockUser.country) || mockUser.country === 'SN'
      setInAfrica(isAfrica)
      setCountry(mockUser.country === 'SN' ? 'Sénégal' : mockUser.country)
    }
    if (mockUser.city) setCity(mockUser.city)
    // tags = [situation, job, éducation] (voir buildTags dans profile-service)
    if (mockUser.tags[1]) setProfession(mockUser.tags[1])
    if (mockUser.tags[2] && ETUDES.includes(mockUser.tags[2])) setEtudes(mockUser.tags[2])
  }, [mockUser])

  const save = async () => {
    if (!user) return
    setSaving(true)
    const err = await updateMyProfile(user.id, {
      country,
      city:      city || null,
      job:       profession.trim() || null,
      education: etudes,
    })
    setSaving(false)
    if (err) { toast.error(t('error', { msg: err })); return }
    toast.success(t('saved'))
    onClose()
  }

  const countries = inAfrica ? AFRICA_COUNTRIES : DIASPORA_COUNTRIES

  const select = 'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 bg-white focus:outline-none focus:border-[#10B981]'
  const inputCls = 'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-[#10B981]'

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
        {/* Toggle Afrique/Diaspora */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{t('whereLabel')}</label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: t('inAfrica'), value: true },
              { label: t('diaspora'), value: false },
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
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">{t('country')}</label>
          <select value={country} onChange={e => setCountry(e.target.value)} className={select}>
            {countries.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>

        {/* City */}
        {inAfrica && country === 'Sénégal' ? (
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">{t('city')}</label>
            <select value={city} onChange={e => setCity(e.target.value)} className={select}>
              {DAKAR_CITIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
        ) : (
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">{t('city')}</label>
            <input value={city} onChange={e => setCity(e.target.value)} placeholder={t('cityPlaceholder')} className={inputCls} />
          </div>
        )}

        {/* Profession */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">{t('profession')}</label>
          <input value={profession} onChange={e => setProfession(e.target.value)} placeholder={t('professionPlaceholder')} className={inputCls} />
        </div>

        {/* Niveau études */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{t('education')}</label>
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
