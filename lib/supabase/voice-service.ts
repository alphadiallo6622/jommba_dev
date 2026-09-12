'use client'

import { createClient } from './client'
import type { Message as DbMessage } from './types'

/** Durée maximale d'un vocal, alignée sur la contrainte SQL
 *  messages_audio_duration (65 s en base, 60 s côté UI pour la marge). */
export const VOICE_MAX_MS = 60_000

/** En dessous, c'est un appui involontaire sur le micro. */
export const VOICE_MIN_MS = 1_000

const BUCKET = 'voice-messages'

/** Formats acceptés à l'enregistrement, par ordre de préférence. mp4/AAC en
 *  premier : c'est le seul que Safari produise, et il se lit partout — donc
 *  le meilleur choix quand le navigateur sait l'enregistrer. */
export const PREFERRED_MIMES = [
  'audio/mp4',
  'audio/webm;codecs=opus',
  'audio/webm',
  'audio/ogg;codecs=opus',
]

const EXT_BY_MIME: Record<string, string> = {
  'audio/mp4':  'm4a',
  'audio/aac':  'aac',
  'audio/mpeg': 'mp3',
  'audio/webm': 'webm',
  'audio/ogg':  'ogg',
  'audio/wav':  'wav',
}

/** Type MIME sans les paramètres de codec : le bucket filtre sur 'audio/webm',
 *  pas sur 'audio/webm;codecs=opus'. */
export function baseMime(mime: string): string {
  return (mime.split(';')[0] ?? '').trim().toLowerCase()
}

export type VoiceSendResult =
  | { ok: true;  message: DbMessage }
  | { ok: false; reason: 'upload' | 'insert' }

/** Envoie un vocal : upload dans le bucket privé puis insertion du message.
 *  Le chemin commence par l'id de conversation — c'est ce que les policies
 *  Storage vérifient pour n'ouvrir le fichier qu'aux deux participants. */
export async function sendVoiceMessage(
  conversationId: string,
  senderId: string,
  receiverId: string,
  blob: Blob,
  durationMs: number,
): Promise<VoiceSendResult> {
  const supabase = createClient()

  const mime = baseMime(blob.type) || 'audio/webm'
  const ext  = EXT_BY_MIME[mime] ?? 'webm'
  const path = `${conversationId}/${crypto.randomUUID()}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, blob, { contentType: mime, upsert: false })

  if (uploadError) {
    console.error('[voice] upload error:', uploadError)
    return { ok: false, reason: 'upload' }
  }

  const { data, error } = await supabase
    .from('messages')
    .insert({
      conversation_id:   conversationId,
      sender_id:         senderId,
      receiver_id:       receiverId,
      content:           '',
      is_read:           false,
      audio_path:        path,
      audio_mime:        blob.type || mime,
      // Borne dure : la contrainte SQL refuse au-delà de 65 s.
      audio_duration_ms: Math.min(Math.max(1, Math.round(durationMs)), 65_000),
    })
    .select()
    .single()

  if (error || !data) {
    console.error('[voice] insert error:', error)
    // Pas de fichier orphelin si la ligne n'a pas pu être écrite.
    await supabase.storage.from(BUCKET).remove([path])
    return { ok: false, reason: 'insert' }
  }

  return { ok: true, message: data as DbMessage }
}

/** URL signée (1 h) pour écouter un vocal. Le bucket est privé : sans cette
 *  signature, le fichier n'est pas accessible. */
export async function getVoiceUrl(path: string): Promise<string | null> {
  const supabase = createClient()
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, 3600)
  if (error || !data) {
    console.error('[voice] signed url error:', error)
    return null
  }
  return data.signedUrl
}

/** mm:ss à partir de millisecondes. */
export function formatDuration(ms: number): string {
  const total = Math.max(0, Math.round(ms / 1000))
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m}:${String(s).padStart(2, '0')}`
}
