'use client'

import { createClient } from './client'

/** Blocage vu depuis « moi » : qui a bloqué qui dans la paire. */
export type BlockState = {
  blockedByMe:    boolean
  blockedByOther: boolean
}

const NO_BLOCK: BlockState = { blockedByMe: false, blockedByOther: false }

/** Lit le blocage dans les deux sens pour la paire (moi ↔ autre).
 *  En cas d'erreur (réseau, migration pas encore appliquée) on renvoie
 *  « aucun blocage » : la discussion reste ouverte plutôt que de se fermer sur
 *  un faux positif. */
export async function fetchBlockState(myId: string, otherId: string): Promise<BlockState> {
  const supabase = createClient()
  try {
    const { data, error } = await supabase
      .from('blocked_users')
      .select('blocker_id, blocked_id')
      .or(`and(blocker_id.eq.${myId},blocked_id.eq.${otherId}),and(blocker_id.eq.${otherId},blocked_id.eq.${myId})`)
    if (error) throw error
    const rows = data ?? []
    return {
      blockedByMe:    rows.some(r => r.blocker_id === myId),
      blockedByOther: rows.some(r => r.blocker_id === otherId),
    }
  } catch (err) {
    console.error('[moderation] fetchBlockState error:', err)
    return NO_BLOCK
  }
}

/** Bloque `otherId`. La demande de contact reste intacte : le déblocage rouvre
 *  la discussion sans repasser par une nouvelle demande. Idempotent. */
export async function blockUser(myId: string, otherId: string): Promise<boolean> {
  const supabase = createClient()
  const { error } = await supabase
    .from('blocked_users')
    .upsert({ blocker_id: myId, blocked_id: otherId }, { onConflict: 'blocker_id,blocked_id' })
  if (error) {
    console.error('[moderation] blockUser error:', error)
    return false
  }
  return true
}

/** Retire mon blocage sur `otherId`. Ne touche pas à un blocage inverse. */
export async function unblockUser(myId: string, otherId: string): Promise<boolean> {
  const supabase = createClient()
  const { error } = await supabase
    .from('blocked_users')
    .delete()
    .eq('blocker_id', myId)
    .eq('blocked_id', otherId)
  if (error) {
    console.error('[moderation] unblockUser error:', error)
    return false
  }
  return true
}

/** Signale `otherId` à la modération (console admin → Signalements). */
export async function reportUser(myId: string, otherId: string, reason: string): Promise<boolean> {
  const supabase = createClient()
  const { error } = await supabase
    .from('reports')
    .insert({ reporter_id: myId, reported_id: otherId, reason, status: 'pending' })
  if (error) {
    console.error('[moderation] reportUser error:', error)
    return false
  }
  return true
}
