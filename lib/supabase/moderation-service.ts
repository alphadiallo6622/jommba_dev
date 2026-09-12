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

/** Raccourci : y a-t-il un blocage dans un sens ou dans l'autre ? */
export async function isBlockedPair(myId: string, otherId: string): Promise<boolean> {
  const state = await fetchBlockState(myId, otherId)
  return state.blockedByMe || state.blockedByOther
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

/** Membre bloqué par moi, avec son profil — pour l'écran Paramètres. */
export type BlockedMember = {
  userId:      string
  firstName:   string
  lastInitial: string
  photo:       string
  blockedAt:   string
}

/** Identifiants à masquer dans toutes les listes : les membres que j'ai bloqués
 *  et ceux qui m'ont bloqué. En cas d'erreur on renvoie un ensemble vide : une
 *  panne de lecture ne doit pas amputer les listes de l'utilisateur. */
export async function fetchBlockedIds(myId: string): Promise<Set<string>> {
  const supabase = createClient()
  try {
    const { data, error } = await supabase
      .from('blocked_users')
      .select('blocker_id, blocked_id')
      .or(`blocker_id.eq.${myId},blocked_id.eq.${myId}`)
    if (error) throw error
    const ids = new Set<string>()
    for (const r of data ?? []) {
      ids.add(r.blocker_id === myId ? r.blocked_id : r.blocker_id)
    }
    return ids
  } catch (err) {
    console.error('[moderation] fetchBlockedIds error:', err)
    return new Set()
  }
}

/** Membres que j'ai bloqués, du plus récent au plus ancien. Seuls mes propres
 *  blocages sont listés : on ne montre pas qui m'a bloqué. */
export async function fetchBlockedMembers(myId: string): Promise<BlockedMember[]> {
  const supabase = createClient()
  try {
    const { data, error } = await supabase
      .from('blocked_users')
      .select('blocked_id, created_at')
      .eq('blocker_id', myId)
      .order('created_at', { ascending: false })
    if (error) throw error

    const rows = data ?? []
    if (rows.length === 0) return []

    const { data: profiles } = await supabase
      .from('profiles')
      .select('user_id, first_name, last_name, avatar_url')
      .in('user_id', rows.map(r => r.blocked_id))

    type ProfileRow = { user_id: string; first_name: string; last_name: string | null; avatar_url: string | null }
    const profileMap = new Map<string, ProfileRow>()
    for (const p of (profiles ?? []) as ProfileRow[]) profileMap.set(p.user_id, p)

    return rows.map(r => {
      const p = profileMap.get(r.blocked_id)
      return {
        userId:      r.blocked_id,
        firstName:   p?.first_name ?? '…',
        lastInitial: (p?.last_name ?? '').charAt(0),
        photo:       p?.avatar_url ?? '/avatar-placeholder.svg',
        blockedAt:   r.created_at,
      }
    })
  } catch (err) {
    console.error('[moderation] fetchBlockedMembers error:', err)
    return []
  }
}
