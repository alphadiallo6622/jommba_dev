// lib/supabase/storage.ts
// Stockage des photos de profil sur Supabase Storage.
//
// Les photos partaient sur Cloudinary, dont le quota gratuit est épuisé. Les
// nouvelles photos vont désormais dans le bucket `profile-photos`, inclus dans
// l'abonnement Supabase Pro.
//
// Le bucket est PUBLIC, comme l'étaient les URLs Cloudinary : les photos
// doivent s'afficher dans un `<img>` chez les autres membres sans signature.
// Le niveau d'exposition est donc identique à avant, pas moindre.
//
// Les anciennes photos restent servies depuis Cloudinary : seule l'écriture
// change, jamais les URLs déjà enregistrées. Les deux cohabitent sans que les
// membres voient de différence.
import { createAdminClient } from './admin'

export const PROFILE_PHOTOS_BUCKET = 'profile-photos'
/** Couvertures d'articles, deposees depuis la console admin. */
export const BLOG_IMAGES_BUCKET = 'blog-images'

/** Extensions des formats acceptés par le bucket (cf. allowed_mime_types). */
const EXT_BY_MIME: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/avif': 'avif',
}

/** Formats refusés à l'upload, pour ne jamais stocker un fichier que les
 *  navigateurs ne savent pas afficher (HEIC d'iPhone par exemple). Mieux vaut
 *  une erreur claire qu'une image cassée dans le profil. */
export function isSupportedImageMime(mime: string): boolean {
  return mime.toLowerCase() in EXT_BY_MIME
}

/** Une URL pointe-t-elle vers notre Supabase Storage ? Sert à router la
 *  suppression : Cloudinary pour l'ancien, Supabase pour le nouveau. */
export function isSupabaseStorageUrl(url: string): boolean {
  return url.includes('/storage/v1/object/public/')
}

/**
 * Chemin de l'objet dans le bucket, dérivé d'une URL publique Supabase.
 * Ex. https://<ref>.supabase.co/storage/v1/object/public/profile-photos/<uid>/abc.jpg
 *  → <uid>/abc.jpg
 * Renvoie null si l'URL n'a pas ce format.
 */
export function storagePathFromUrl(url: string): string | null {
  const marker = `/storage/v1/object/public/${PROFILE_PHOTOS_BUCKET}/`
  const i = url.indexOf(marker)
  if (i === -1) return null
  // Une URL publique peut porter une query (?t=...) : on ne garde que le chemin.
  const path = url.slice(i + marker.length).split('?')[0]
  return path || null
}

export type UploadResult =
  | { ok: true; url: string; path: string }
  | { ok: false; error: string }

/**
 * Dépose une image dans un bucket et renvoie son URL publique.
 * `prefix` regroupe les fichiers (l'id du membre pour une photo de profil) ; le
 * nom reste aléatoire, pour qu'une URL ne soit pas devinable depuis une autre.
 */
async function uploadImage(
  bucket: string,
  prefix: string,
  file: File,
): Promise<UploadResult> {
  const mime = (file.type || '').toLowerCase()
  if (!isSupportedImageMime(mime)) {
    return { ok: false, error: "Format d'image non pris en charge (JPEG, PNG, WebP, GIF ou AVIF)" }
  }

  const supabase = createAdminClient()
  const path = `${prefix}/${crypto.randomUUID()}.${EXT_BY_MIME[mime]}`

  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, file, { contentType: mime, upsert: false })

  if (error) {
    console.error(`[storage] upload ${bucket} échoué:`, error)
    return { ok: false, error: error.message }
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return { ok: true, url: data.publicUrl, path }
}

/** Photo de profil d'un membre : regroupée sous son id. */
export async function uploadProfilePhoto(userId: string, file: File): Promise<UploadResult> {
  return uploadImage(PROFILE_PHOTOS_BUCKET, userId, file)
}

/** Couverture d'article, déposée depuis la console admin. */
export async function uploadBlogImage(file: File): Promise<UploadResult> {
  return uploadImage(BLOG_IMAGES_BUCKET, 'covers', file)
}

/**
 * Supprime une photo du bucket. Ne lève jamais : le rejet d'une photo par
 * l'admin ne doit pas échouer parce que le fichier a déjà disparu.
 */
export async function deleteProfilePhoto(path: string): Promise<boolean> {
  try {
    const supabase = createAdminClient()
    const { error } = await supabase.storage.from(PROFILE_PHOTOS_BUCKET).remove([path])
    if (error) {
      console.error('[storage] suppression photo échouée:', error)
      return false
    }
    return true
  } catch (err) {
    console.error('[storage] suppression photo échouée:', err)
    return false
  }
}
