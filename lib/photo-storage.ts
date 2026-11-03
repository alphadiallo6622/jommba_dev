// lib/photo-storage.ts
// Point d'entrée unique pour supprimer une photo de profil, où qu'elle soit.
//
// Deux hébergements cohabitent : Cloudinary pour les photos déposées avant la
// bascule, Supabase Storage pour les suivantes. L'URL enregistrée dit laquelle,
// et l'appelant n'a pas à s'en soucier.
import { deleteCloudinaryImage, publicIdFromUrl } from './cloudinary'
import {
  deleteProfilePhoto,
  isSupabaseStorageUrl,
  storagePathFromUrl,
} from './supabase/storage'

/**
 * Supprime le fichier correspondant à une ligne `profile_photos`.
 * Ne lève jamais : un échec de suppression du fichier ne doit pas empêcher le
 * retrait de la photo en base.
 *
 * `publicId` est l'identifiant stocké en base : le chemin dans le bucket pour
 * Supabase, le public_id pour Cloudinary. Il peut manquer sur les lignes
 * anciennes, d'où le repli sur l'URL.
 */
export async function deleteStoredPhoto(
  url: string,
  publicId: string | null,
): Promise<boolean> {
  if (isSupabaseStorageUrl(url)) {
    const path = publicId ?? storagePathFromUrl(url)
    return path ? deleteProfilePhoto(path) : false
  }

  const cloudinaryId = publicId ?? publicIdFromUrl(url)
  return cloudinaryId ? deleteCloudinaryImage(cloudinaryId) : false
}
