'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { Crown, CheckCircle, ShieldCheck, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import SettingsDrawer from '../SettingsDrawer'
import { useCurrentUser } from '@/lib/use-current-user'
import { useAuth } from '@/components/providers/AuthProvider'
import { createClient } from '@/lib/supabase/client'

type Props = { open: boolean; onClose: () => void }

export default function SecurityPanel({ open, onClose }: Props) {
  const router = useRouter()
  const t = useTranslations('dashboard.parametres.security')
  const { isPremium, firstName, lastName } = useCurrentUser()
  const { user } = useAuth()
  const [currentPwd, setCurrentPwd] = useState('')
  const [newPwd, setNewPwd]         = useState('')
  const [changing, setChanging]     = useState(false)

  const pseudo = `@${firstName.toLowerCase()}${lastName.toLowerCase().charAt(0)}4321`

  const changePassword = async () => {
    if (!user?.email) return
    if (!currentPwd || !newPwd) { toast.error(t('fillBoth')); return }
    if (newPwd.length < 8) { toast.error(t('pwdTooShort')); return }

    setChanging(true)
    try {
      const supabase = createClient()

      // Vérifie le mot de passe actuel avant de le remplacer
      const { error: verifyErr } = await supabase.auth.signInWithPassword({
        email:    user.email,
        password: currentPwd,
      })
      if (verifyErr) { toast.error(t('currentPwdWrong')); return }

      const { error } = await supabase.auth.updateUser({ password: newPwd })
      if (error) { toast.error(t('pwdError', { msg: error.message })); return }

      toast.success(t('pwdChanged'))
      setCurrentPwd(''); setNewPwd('')
    } finally {
      setChanging(false)
    }
  }

  const inputCls = 'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-[#10B981]'

  return (
    <SettingsDrawer open={open} title={t('title')} onClose={onClose}
      footer={
        <button onClick={onClose} className="w-full py-3 bg-gray-100 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-200 transition-colors">
          {t('close')}
        </button>
      }
    >
      <div className="px-4 py-5 space-y-5">

        {/* Pseudo */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">{t('pseudo')}</label>
          <input
            value={pseudo}
            readOnly
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-400 bg-gray-50 cursor-not-allowed"
          />
          <p className="text-xs text-gray-400 mt-1">{t('pseudoLocked')}</p>
        </div>

        {/* Password */}
        <div>
          <p className="text-sm font-semibold text-gray-800 mb-3">{t('changePwd')}</p>
          <div className="space-y-2">
            <input
              type="password"
              value={currentPwd}
              onChange={e => setCurrentPwd(e.target.value)}
              placeholder={t('currentPwd')}
              className={inputCls}
            />
            <input
              type="password"
              value={newPwd}
              onChange={e => setNewPwd(e.target.value)}
              placeholder={t('newPwd')}
              className={inputCls}
            />
          </div>
          <button
            onClick={changePassword}
            disabled={changing}
            className="mt-3 w-full py-2.5 bg-[#10B981] text-white text-sm font-semibold rounded-xl hover:bg-[#059669] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {changing && <Loader2 className="w-4 h-4 animate-spin" />}
            {t('change')}
          </button>
        </div>

        {/* Identity verification */}
        {isPremium ? (
          /* Premium: badge actif */
          <div className="border border-[#10B981]/30 bg-[#E1F5EE] rounded-xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-[#10B981]/20 rounded-full flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-[#10B981]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-[#064E3B]">{t('verifTitle')}</p>
                  <span className="text-[9px] font-bold bg-[#10B981] text-white px-1.5 py-0.5 rounded-full">{t('active')}</span>
                </div>
                <p className="text-xs text-[#10B981] mt-0.5">{t('verifActiveDesc')}</p>
              </div>
            </div>
            <ul className="space-y-1.5">
              {(t.raw('benefits') as string[]).map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-xs text-[#064E3B] font-medium">
                  <CheckCircle className="w-3.5 h-3.5 text-[#10B981] shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          /* Free: upsell */
          <div className="border border-gray-100 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-amber-50 rounded-full flex items-center justify-center">
                <Crown className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">{t('verifTitle')}</p>
                <p className="text-xs text-gray-500">{t('verifBadgeDesc')}</p>
              </div>
            </div>
            <ul className="space-y-1.5 mb-3">
              {(t.raw('benefits') as string[]).map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-xs text-gray-600">
                  <CheckCircle className="w-3.5 h-3.5 text-[#10B981] shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <button
              onClick={() => { onClose(); router.push('/dashboard/premium') }}
              className="w-full py-2.5 bg-amber-500 text-white text-sm font-semibold rounded-xl hover:bg-amber-600 transition-colors"
            >
              {t('activateWithPremium')}
            </button>
          </div>
        )}

      </div>
    </SettingsDrawer>
  )
}
