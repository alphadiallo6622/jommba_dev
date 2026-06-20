'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/store/auth.store'
import type { MockUser } from '@/lib/mock-user'

// Composant sans rendu : initialise le store Zustand avec le profil
// récupéré côté serveur depuis Supabase.
export default function ProfileInitializer({ profile }: { profile: MockUser | null }) {
  const setCurrentUser = useAuthStore(s => s.setCurrentUser)

  useEffect(() => {
    if (profile) setCurrentUser(profile)
  }, [profile, setCurrentUser])

  return null
}
