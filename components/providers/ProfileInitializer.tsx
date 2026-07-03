'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/store/auth.store'
import { useProfileStore } from '@/store/profile.store'
import { useVisibilityStore, type VisibilityMode } from '@/store/visibility.store'
import type { MockUser } from '@/lib/mock-user'

type Prefs = { photosBlurred: boolean; soundEnabled: boolean } | null

// Composant sans rendu : initialise les stores Zustand avec le profil et
// les préférences récupérés côté serveur depuis Supabase.
export default function ProfileInitializer({ profile, prefs }: { profile: MockUser | null; prefs?: Prefs }) {
  const setCurrentUser = useAuthStore(s => s.setCurrentUser)
  const setPrefs       = useProfileStore(s => s.setPrefs)
  const setVisibility  = useVisibilityStore(s => s.setMode)

  useEffect(() => {
    if (profile) {
      setCurrentUser(profile)
      // profiles.visibility ('active'|'pause'|'discussion') → store ('actif'|…)
      const mode: VisibilityMode = profile.visibility === 'active' ? 'actif' : profile.visibility
      setVisibility(mode)
    }
    if (prefs) setPrefs(prefs)
  }, [profile, prefs, setCurrentUser, setPrefs, setVisibility])

  return null
}
