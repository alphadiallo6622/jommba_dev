'use client'

import { useRouter } from 'next/navigation'
import { Volume2, VolumeX, EyeOff, Eye, LogOut, Settings, HelpCircle, User } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useCurrentUser } from '@/lib/use-current-user'
import { useProfileStore } from '@/store/profile.store'
import { useAuthStore } from '@/store/auth.store'

type Props = { onClose: () => void }

export default function ProfileDropdown({ onClose }: Props) {
  const router = useRouter()
  const mockUser = useCurrentUser()
  const logout = useAuthStore(s => s.logout)
  const { isPhotosBlurred, isSoundEnabled, togglePhotosBlur, toggleSound } = useProfileStore()

  const go = (path: string) => { onClose(); router.push(path) }

  // Persiste le floutage : profiles.photos_blurred (lu par les visiteurs)
  // + user_preferences (préférence du compte).
  const handleToggleBlur = async () => {
    const next = !isPhotosBlurred
    togglePhotosBlur()
    onClose()
    if (!mockUser.id) return
    const supabase = createClient()
    await Promise.all([
      supabase.from('profiles').update({ photos_blurred: next }).eq('user_id', mockUser.id),
      supabase.from('user_preferences').update({ photos_blurred: next }).eq('user_id', mockUser.id),
    ])
  }

  const handleToggleSound = async () => {
    const next = !isSoundEnabled
    toggleSound()
    onClose()
    if (!mockUser.id) return
    const supabase = createClient()
    await supabase.from('user_preferences').update({ sound_enabled: next }).eq('user_id', mockUser.id)
  }

  // Déconnexion réelle : ferme la session Supabase (cookies) puis vide le store.
  const handleLogout = async () => {
    onClose()
    const supabase = createClient()
    await supabase.auth.signOut()
    logout()
    router.push('/')
    router.refresh()
  }

  return (
    <div className="absolute top-full right-0 mt-1 w-64 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-50 overflow-hidden">

      {/* Identity row */}
      <div className="px-4 py-3 bg-[#E1F5EE] border-b border-gray-100">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-[#064E3B]">
            {mockUser.firstName} {mockUser.lastName.charAt(0)}.
          </p>
          {mockUser.isPremium && (
            <span className="text-[10px] font-bold bg-amber-500 text-white px-1.5 py-0.5 rounded-full">PREMIUM</span>
          )}
        </div>
        <p className="text-xs text-[#10B981] mt-0.5">
          {mockUser.isPremium
            ? '→ Demandes illimitées'
            : `→ Demandes restantes ${Math.max(0, mockUser.dailyRequests.total - mockUser.dailyRequests.used)}/${mockUser.dailyRequests.total}`}
        </p>
      </div>

      {/* Mon profil */}
      <button
        onClick={() => go(`/dashboard/profil/${mockUser.id}`)}
        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
      >
        <User className="w-4 h-4 text-gray-400" />
        Mon profil
      </button>

      {/* Paramètres */}
      <button
        onClick={() => go('/dashboard/parametres')}
        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
      >
        <Settings className="w-4 h-4 text-gray-400" />
        Paramètres
      </button>

      {/* Toggle flouter photos */}
      <button
        onClick={handleToggleBlur}
        className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
          isPhotosBlurred
            ? 'bg-amber-50 text-amber-700 hover:bg-amber-100'
            : 'text-gray-700 hover:bg-gray-50'
        }`}
      >
        {isPhotosBlurred
          ? <EyeOff className="w-4 h-4 text-amber-500" />
          : <Eye className="w-4 h-4 text-gray-400" />
        }
        {isPhotosBlurred ? 'Déflouter mes photos' : 'Flouter mes photos'}
      </button>

      {/* Toggle son */}
      <button
        onClick={handleToggleSound}
        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
      >
        {isSoundEnabled
          ? <Volume2 className="w-4 h-4 text-gray-400" />
          : <VolumeX className="w-4 h-4 text-gray-400" />
        }
        {isSoundEnabled ? 'Sons activés' : 'Sons désactivés'}
      </button>

      {/* Aide & FAQ */}
      <button
        onClick={() => go('/dashboard/aide')}
        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
      >
        <HelpCircle className="w-4 h-4 text-gray-400" />
        Aide &amp; FAQ
      </button>

      <div className="border-t border-gray-100 my-1" />

      {/* Déconnexion */}
      <button
        onClick={handleLogout}
        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
      >
        <LogOut className="w-4 h-4" />
        Déconnexion
      </button>
    </div>
  )
}
