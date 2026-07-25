'use client'

import { createClient } from './client'
import { updateMyProfile } from './profile-actions'
import type { ProfilePhoto } from './types'

export type UserPhoto = { id: string; src: string; isMain: boolean }

// Charge les photos du membre. Si la table est vide mais qu'un avatar existe
// sur le profil (ancien flux onboarding), il est utilisé comme photo principale.
export async function loadMyPhotos(userId: string, fallbackAvatar?: string | null): Promise<UserPhoto[]> {
  const supabase = createClient()
  const { data } = await supabase
    .from('profile_photos')
    .select('*')
    .eq('user_id', userId)
    .order('order', { ascending: true })

  const photos = (data ?? []) as ProfilePhoto[]
  if (photos.length === 0 && fallbackAvatar) {
    // Migre l'avatar existant vers profile_photos pour unifier le stockage
    const { data: inserted } = await supabase
      .from('profile_photos')
      .insert({ user_id: userId, url: fallbackAvatar, is_primary: true, order: 0 })
      .select()
      .single()
    if (inserted) return [{ id: inserted.id, src: inserted.url, isMain: true }]
    return [{ id: 'avatar', src: fallbackAvatar, isMain: true }]
  }

  return photos.map(p => ({ id: p.id, src: p.url, isMain: p.is_primary }))
}

// Upload via l'API signée Cloudinary puis insère la ligne en BDD.
export async function uploadPhoto(userId: string, file: File, isMain: boolean, order: number): Promise<UserPhoto | null> {
  const formData = new FormData()
  formData.append('file', file)

  const res  = await fetch('/api/upload/avatar', { method: 'POST', body: formData })
  const json = await res.json() as { url?: string; publicId?: string; error?: string }
  if (!res.ok || !json.url) return null

  const supabase = createClient()
  const { data, error } = await supabase
    .from('profile_photos')
    .insert({ user_id: userId, url: json.url, public_id: json.publicId ?? null, is_primary: isMain, order })
    .select()
    .single()

  if (error || !data) return null
  if (isMain) await syncAvatar(userId, json.url)
  return { id: data.id, src: data.url, isMain: data.is_primary }
}

export async function deletePhotoById(userId: string, photoId: string): Promise<string | null> {
  const supabase = createClient()
  const { error } = await supabase
    .from('profile_photos')
    .delete()
    .eq('id', photoId)
    .eq('user_id', userId)
  return error ? error.message : null
}

// Définit la photo principale (is_primary) et synchronise profiles.avatar_url.
export async function setPrimaryPhoto(userId: string, photoId: string, url: string): Promise<string | null> {
  const supabase = createClient()
  const { error: clearErr } = await supabase
    .from('profile_photos')
    .update({ is_primary: false })
    .eq('user_id', userId)
  if (clearErr) return clearErr.message

  const { error } = await supabase
    .from('profile_photos')
    .update({ is_primary: true })
    .eq('id', photoId)
    .eq('user_id', userId)
  if (error) return error.message

  return syncAvatar(userId, url)
}

async function syncAvatar(userId: string, url: string): Promise<string | null> {
  return updateMyProfile(userId, { avatar_url: url })
}
