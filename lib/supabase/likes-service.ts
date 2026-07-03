'use client'

import { createClient } from './client'

export const FREE_DAILY_REQUESTS = 3

export type SendRequestResult =
  | { ok: true }
  | { ok: false; reason: 'limit' | 'duplicate' | 'error'; message: string }

// Envoie une demande de contact en respectant les règles Jommba :
// - limite quotidienne (3/jour en gratuit, illimité en premium)
// - pas de doublon : une demande déjà envoyée / acceptée / refusée n'est pas re-créée
// Note : l'expéditeur n'a pas le droit UPDATE sur likes (RLS) — insert simple.
export async function sendContactRequest(
  senderId: string,
  receiverId: string,
  isPremium: boolean,
): Promise<SendRequestResult> {
  const supabase = createClient()

  // Demande existante ?
  const { data: existing } = await supabase
    .from('likes')
    .select('status')
    .eq('sender_id', senderId)
    .eq('receiver_id', receiverId)
    .eq('type', 'request')
    .maybeSingle()

  if (existing) {
    const msg =
      existing.status === 'accepted' ? 'Vous êtes déjà en contact ✓' :
      existing.status === 'rejected' ? 'Cette personne a déjà décliné ta demande.' :
      'Demande déjà envoyée — en attente de réponse.'
    return { ok: false, reason: 'duplicate', message: msg }
  }

  if (!isPremium) {
    const today = new Date().toISOString().slice(0, 10)
    const { count } = await supabase
      .from('likes')
      .select('*', { count: 'exact', head: true })
      .eq('sender_id', senderId)
      .eq('type', 'request')
      .gte('created_at', today)

    if ((count ?? 0) >= FREE_DAILY_REQUESTS) {
      return {
        ok: false,
        reason: 'limit',
        message: `Limite de ${FREE_DAILY_REQUESTS} demandes par jour atteinte. Passe Premium pour des demandes illimitées !`,
      }
    }
  }

  const { error } = await supabase.from('likes').insert({
    sender_id:   senderId,
    receiver_id: receiverId,
    type:        'request',
    status:      'pending',
  })

  if (error) return { ok: false, reason: 'error', message: "Erreur lors de l'envoi de la demande" }
  return { ok: true }
}

// Ajoute / retire un favori. Retourne null en cas de succès, sinon l'erreur.
// ignoreDuplicates → ON CONFLICT DO NOTHING (pas besoin du droit UPDATE).
export async function addFavorite(senderId: string, receiverId: string): Promise<string | null> {
  const supabase = createClient()
  const { error } = await supabase.from('likes').upsert({
    sender_id:   senderId,
    receiver_id: receiverId,
    type:        'favorite',
    status:      'pending',
  }, { onConflict: 'sender_id,receiver_id,type', ignoreDuplicates: true })
  return error ? error.message : null
}

export async function removeFavorite(senderId: string, receiverId: string): Promise<string | null> {
  const supabase = createClient()
  const { error } = await supabase.from('likes')
    .delete()
    .eq('sender_id', senderId)
    .eq('receiver_id', receiverId)
    .eq('type', 'favorite')
  return error ? error.message : null
}
