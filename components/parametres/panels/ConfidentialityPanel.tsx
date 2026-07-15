'use client'

import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { EyeOff, Eye, Crown, Shield, Lock, CheckCircle } from 'lucide-react'
import SettingsDrawer from '../SettingsDrawer'
import { useCurrentUser } from '@/lib/use-current-user'
import { useProfileStore } from '@/store/profile.store'
import { useAuth } from '@/components/providers/AuthProvider'
import { createClient } from '@/lib/supabase/client'

type Props = { open: boolean; onClose: () => void }

export default function ConfidentialityPanel({ open, onClose }: Props) {
  const router = useRouter()
  const t = useTranslations('dashboard.parametres.confidentiality')
  const { isPremium } = useCurrentUser()
  const { user } = useAuth()
  const { isPhotosBlurred, togglePhotosBlur } = useProfileStore()

  // Persiste la préférence : profiles.photos_blurred est la source lue par
  // les visiteurs (RLS), user_preferences reste la préférence du compte.
  const handleToggleBlur = async () => {
    const next = !isPhotosBlurred
    togglePhotosBlur()
    if (!user) return
    const supabase = createClient()
    await Promise.all([
      supabase.from('profiles').update({ photos_blurred: next }).eq('user_id', user.id),
      supabase.from('user_preferences').update({ photos_blurred: next }).eq('user_id', user.id),
    ])
  }

  return (
    <SettingsDrawer open={open} title={t('title')} onClose={onClose}
      footer={
        <button onClick={onClose} className="w-full py-3 bg-gray-100 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-200 transition-colors">
          {t('close')}
        </button>
      }
    >
      <div className="px-4 py-5 space-y-4">

        {/* Photos floutées block */}
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex items-start gap-3 mb-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
              isPremium && isPhotosBlurred ? 'bg-amber-100' : 'bg-gray-200'
            }`}>
              <EyeOff className={`w-5 h-5 ${isPremium && isPhotosBlurred ? 'text-amber-600' : 'text-gray-500'}`} />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">{t('blurTitle')}</p>
              <p className="text-xs text-gray-500 mt-0.5">
                {t('blurDesc')}
              </p>
            </div>
          </div>

          {isPremium ? (
            /* Premium: active toggle */
            <div className="space-y-2">
              {/* Status indicator */}
              <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl ${
                isPhotosBlurred ? 'bg-amber-50 border border-amber-200' : 'bg-[#E1F5EE]'
              }`}>
                <CheckCircle className={`w-4 h-4 shrink-0 ${isPhotosBlurred ? 'text-amber-500' : 'text-[#10B981]'}`} />
                <p className={`text-sm font-medium flex-1 ${isPhotosBlurred ? 'text-amber-700' : 'text-[#10B981]'}`}>
                  {isPhotosBlurred ? t('blurred') : t('unblurred')}
                </p>
              </div>

              {/* Toggle button */}
              <button
                onClick={handleToggleBlur}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-colors ${
                  isPhotosBlurred
                    ? 'bg-[#E1F5EE] border-[#10B981]/40 hover:bg-green-100'
                    : 'bg-blue-50 border-blue-200 hover:bg-blue-100'
                }`}
              >
                {isPhotosBlurred
                  ? <Eye className="w-5 h-5 text-[#10B981] shrink-0" />
                  : <EyeOff className="w-5 h-5 text-blue-500 shrink-0" />
                }
                <div>
                  <p className={`text-sm font-semibold ${isPhotosBlurred ? 'text-[#10B981]' : 'text-blue-700'}`}>
                    {isPhotosBlurred ? t('unblurAction') : t('blurAction')}
                  </p>
                  <p className={`text-xs mt-0.5 ${isPhotosBlurred ? 'text-[#10B981]/70' : 'text-blue-500'}`}>
                    {isPhotosBlurred ? t('makeVisible') : t('hideFromVisitors')}
                  </p>
                </div>
              </button>
            </div>
          ) : (
            /* Free: locked — redirect to premium */
            <div
              onClick={() => { onClose(); router.push('/dashboard/premium') }}
              className="cursor-pointer flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 hover:bg-amber-100 transition-colors"
            >
              <Crown className="w-4 h-4 text-amber-500 shrink-0" />
              <p className="text-xs text-amber-700 font-medium">{t('premiumOnly')}</p>
            </div>
          )}
        </div>

        {/* Confidentialité garantie */}
        <div className="bg-[#E1F5EE] rounded-xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-[#10B981]/20 rounded-full flex items-center justify-center">
              <Shield className="w-5 h-5 text-[#10B981]" />
            </div>
            <p className="text-sm font-semibold text-[#064E3B]">{t('guaranteeTitle')}</p>
          </div>
          <ul className="space-y-2">
            {(t.raw('guarantees') as string[]).map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-[#10B981]">
                <Lock className="w-3 h-3 mt-0.5 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>

      </div>
    </SettingsDrawer>
  )
}
