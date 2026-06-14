'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Crown, CheckCircle, ShieldCheck } from 'lucide-react'
import { useRouter } from 'next/navigation'
import SettingsDrawer from '../SettingsDrawer'
import { useCurrentUser } from '@/lib/use-current-user'

type Props = { open: boolean; onClose: () => void }

const BENEFITS = [
  'Badge ✓ visible sur ton profil',
  'Plus de confiance des autres membres',
  'Meilleur classement dans les résultats',
]

export default function SecurityPanel({ open, onClose }: Props) {
  const router = useRouter()
  const { isPremium, firstName, lastName } = useCurrentUser()
  const [currentPwd, setCurrentPwd] = useState('')
  const [newPwd, setNewPwd]         = useState('')

  const pseudo = `@${firstName.toLowerCase()}${lastName.toLowerCase().charAt(0)}4321`

  const changePassword = () => {
    if (!currentPwd || !newPwd) { toast.error('Remplis les deux champs'); return }
    if (newPwd.length < 8) { toast.error('Mot de passe trop court (8 caractères min)'); return }
    toast.success('Mot de passe modifié avec succès')
    setCurrentPwd(''); setNewPwd('')
  }

  const inputCls = 'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-[#10B981]'

  return (
    <SettingsDrawer open={open} title="Sécurité" onClose={onClose}
      footer={
        <button onClick={onClose} className="w-full py-3 bg-gray-100 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-200 transition-colors">
          Fermer
        </button>
      }
    >
      <div className="px-4 py-5 space-y-5">

        {/* Pseudo */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Pseudo</label>
          <input
            value={pseudo}
            readOnly
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-400 bg-gray-50 cursor-not-allowed"
          />
          <p className="text-xs text-gray-400 mt-1">Le pseudo ne peut pas être modifié.</p>
        </div>

        {/* Password */}
        <div>
          <p className="text-sm font-semibold text-gray-800 mb-3">Changer le mot de passe</p>
          <div className="space-y-2">
            <input
              type="password"
              value={currentPwd}
              onChange={e => setCurrentPwd(e.target.value)}
              placeholder="Mot de passe actuel"
              className={inputCls}
            />
            <input
              type="password"
              value={newPwd}
              onChange={e => setNewPwd(e.target.value)}
              placeholder="Nouveau mot de passe (8 caractères min)"
              className={inputCls}
            />
          </div>
          <button
            onClick={changePassword}
            className="mt-3 w-full py-2.5 bg-[#10B981] text-white text-sm font-semibold rounded-xl hover:bg-[#059669] transition-colors"
          >
            Modifier
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
                  <p className="text-sm font-semibold text-[#064E3B]">Vérification d&apos;identité</p>
                  <span className="text-[9px] font-bold bg-[#10B981] text-white px-1.5 py-0.5 rounded-full">ACTIF</span>
                </div>
                <p className="text-xs text-[#10B981] mt-0.5">Ton profil est certifié et mis en avant</p>
              </div>
            </div>
            <ul className="space-y-1.5">
              {BENEFITS.map((item, i) => (
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
                <p className="text-sm font-semibold text-gray-800">Vérification d&apos;identité</p>
                <p className="text-xs text-gray-500">Badge vérifié sur ton profil</p>
              </div>
            </div>
            <ul className="space-y-1.5 mb-3">
              {BENEFITS.map((item, i) => (
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
              Activer avec Premium
            </button>
          </div>
        )}

      </div>
    </SettingsDrawer>
  )
}
