// app/api/upload/avatar/route.ts
// Dépôt d'une photo de profil sur Supabase Storage.
//
// Les photos partaient sur Cloudinary, dont le quota gratuit est épuisé. Le
// contrat de cette route n'a pas changé — mêmes entrées, même réponse
// `{ url, publicId }` — pour que le code appelant reste identique. Seul
// l'hébergeur du fichier change, et uniquement pour les nouvelles photos :
// celles déjà en base gardent leur URL Cloudinary et s'affichent comme avant.
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { uploadProfilePhoto } from '@/lib/supabase/storage'

/** Garde-fou serveur, aligné sur la limite du bucket et sur l'UI (10 Mo). */
const MAX_BYTES = 10 * 1024 * 1024

export async function POST(req: NextRequest) {
  // Vérifie l'authentification
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  const body = await req.formData()
  const file = body.get('file')
  if (!file || typeof file === 'string') {
    return NextResponse.json({ error: 'Fichier manquant' }, { status: 400 })
  }
  if (!file.type.startsWith('image/')) {
    return NextResponse.json({ error: 'Le fichier doit être une image' }, { status: 400 })
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'Image trop lourde (10 Mo maximum)' }, { status: 400 })
  }

  const result = await uploadProfilePhoto(user.id, file)
  if (!result.ok) {
    console.error('[upload/avatar] échec:', result.error)
    return NextResponse.json({ error: result.error }, { status: 400 })
  }

  // `publicId` porte le chemin dans le bucket : c'est ce qui permettra de
  // supprimer proprement le fichier lors d'un rejet admin.
  return NextResponse.json({ url: result.url, publicId: result.path })
}
