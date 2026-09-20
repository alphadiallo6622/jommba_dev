'use client'

import { useState, useEffect, useCallback } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { Bell, BellOff, Mail, AlertTriangle } from 'lucide-react'
import { useAuth } from '@/components/providers/AuthProvider'
import { createClient } from '@/lib/supabase/client'
import { disablePush, enablePush, getPushSupport } from '@/lib/push/client'
import SettingsDrawer from '../SettingsDrawer'

type Props = { open: boolean; onClose: () => void }

type PrefKey = 'push_enabled' | 'email_demande' | 'email_message' | 'email_promo'

export default function NotificationsPanel({ open, onClose }: Props) {
  const t = useTranslations('dashboard.parametres.notifications')
  const { user } = useAuth()
  const locale = useLocale()
  const [pushIssue, setPushIssue] = useState<'blocked' | 'iosInstall' | 'unsupported' | null>(null)
  const [pushEnabled, setPushEnabled]   = useState(true)
  const [emailDemande, setEmailDemande] = useState(true)
  const [emailMessage, setEmailMessage] = useState(true)
  const [emailPromo, setEmailPromo]     = useState(true)

  // Charge les préférences réelles à l'ouverture
  useEffect(() => {
    if (!open || !user) return
    const supabase = createClient()
    supabase
      .from('user_preferences')
      .select('push_enabled, email_demande, email_message, email_promo')
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (!data) return
        setPushEnabled(data.push_enabled)
        setEmailDemande(data.email_demande)
        setEmailMessage(data.email_message)
        setEmailPromo(data.email_promo)
      })
  }, [open, user])

  // Persiste chaque toggle immédiatement
  const persist = useCallback(async (key: PrefKey, value: boolean) => {
    if (!user) return
    const supabase = createClient()
    const patch: Partial<Record<PrefKey, boolean>> = {}
    patch[key] = value
    await supabase.from('user_preferences')
      .update(patch)
      .eq('user_id', user.id)
  }, [user])

  // Interrupteur push : au-delà de la préférence, il (dés)abonne réellement
  // cet appareil. L'activation demande la permission du navigateur.
  const togglePush = async (value: boolean) => {
    setPushIssue(null)
    if (!value) {
      setPushEnabled(false)
      persist('push_enabled', false)
      await disablePush()
      return
    }
    const support = getPushSupport()
    if (support !== 'ok') {
      // Préférence enregistrée malgré tout : elle s'appliquera sur un appareil compatible.
      setPushEnabled(true)
      persist('push_enabled', true)
      setPushIssue(support === 'ios-needs-install' ? 'iosInstall' : 'unsupported')
      return
    }
    const result = await enablePush(locale)
    if (result === 'granted') {
      setPushEnabled(true)
      persist('push_enabled', true)
    } else {
      setPushEnabled(false)
      persist('push_enabled', false)
      if (result === 'denied') setPushIssue('blocked')
    }
  }

  const makeToggle = (key: PrefKey, setter: (v: boolean) => void) => (value: boolean) => {
    setter(value)
    persist(key, value)
  }

  const Toggle = ({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) => (
    <button
      onClick={() => onChange(!value)}
      className={`relative w-11 h-6 rounded-full transition-colors ${value ? 'bg-[#10B981]' : 'bg-gray-300'}`}
    >
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${value ? 'translate-x-5' : ''}`} />
    </button>
  )

  return (
    <SettingsDrawer open={open} title={t('title')} onClose={onClose}
      footer={
        <button onClick={onClose} className="w-full py-3 bg-gray-100 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-200 transition-colors">
          {t('close')}
        </button>
      }
    >
      <div className="px-4 py-5 space-y-4">
        {/* Push */}
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {pushEnabled ? <Bell className="w-4 h-4 text-[#10B981]" /> : <BellOff className="w-4 h-4 text-gray-400" />}
              <p className="text-sm font-semibold text-gray-800">{t('pushTitle')}</p>
            </div>
            <Toggle value={pushEnabled} onChange={togglePush} />
          </div>
          <p className="text-xs text-gray-500">{t('pushDesc')}</p>
          {pushIssue && (
            <div className="mt-3 flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
              <p className="text-xs text-amber-700">
                {t(pushIssue === 'blocked' ? 'pushBlocked' : pushIssue === 'iosInstall' ? 'pushIosInstall' : 'pushUnsupported')}
              </p>
            </div>
          )}
          {!pushEnabled && !pushIssue && (
            <div className="mt-3 flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
              <p className="text-xs text-amber-700">
                {t('pushWarning')}
              </p>
            </div>
          )}
        </div>

        {/* Email */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Mail className="w-4 h-4 text-gray-500" />
            <p className="text-sm font-semibold text-gray-700">{t('emailTitle')}</p>
          </div>
          <div className="space-y-3">
            {[
              { label: t('emailRequests'), value: emailDemande, onChange: makeToggle('email_demande', setEmailDemande) },
              { label: t('emailMessages'), value: emailMessage, onChange: makeToggle('email_message', setEmailMessage) },
              { label: t('emailPromos'),   value: emailPromo,   onChange: makeToggle('email_promo', setEmailPromo)     },
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
