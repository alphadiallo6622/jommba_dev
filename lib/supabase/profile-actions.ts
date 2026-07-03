'use client'

import { createClient } from './client'
import { profileToMockUser } from './profile-service'
import { computeProfileCompletion } from './profile-completion'
import { useAuthStore } from '@/store/auth.store'
import type { Profile, ProfileUpdate } from './types'

// Met à jour le profil de l'utilisateur courant en BDD puis rafraîchit le
// store Zustand pour que toute l'UI reflète immédiatement les changements.
// Recalcule profile_completion à chaque sauvegarde (sur l'état complet, pas
// seulement les champs modifiés) pour que le score reste toujours exact,
// quel que soit le panneau des Paramètres utilisé.
// Retourne null en cas de succès, sinon le message d'erreur.
export async function updateMyProfile(userId: string, fields: ProfileUpdate): Promise<string | null> {
  const supabase = createClient()

  const { data: current } = await supabase.from('profiles').select('*').eq('user_id', userId).single()
  const merged = { ...(current as Profile | null), ...fields }
  const profile_completion = computeProfileCompletion(merged)

  const { error } = await supabase
    .from('profiles')
    .update({ ...fields, profile_completion })
    .eq('user_id', userId)
  if (error) return error.message

  await refreshProfileInStore(userId)
  return null
}

// Recharge le profil depuis Supabase et met à jour le store Zustand.
// stats + dailyRequests sont calculés côté serveur au chargement du layout :
// on les préserve pour ne pas les écraser avec des zéros.
export async function refreshProfileInStore(userId: string): Promise<void> {
  const supabase = createClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (profile) {
    const prev = useAuthStore.getState().currentUser
    const next = profileToMockUser(profile as Profile, prev.email)
    next.stats         = prev.stats
    next.dailyRequests = prev.dailyRequests
    useAuthStore.getState().setCurrentUser(next)
  }
}
