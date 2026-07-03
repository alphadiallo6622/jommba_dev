import { createClient }  from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

const CLOUD_NAME  = process.env.CLOUDINARY_CLOUD_NAME!
const API_KEY     = process.env.CLOUDINARY_API_KEY!
const API_SECRET  = process.env.CLOUDINARY_API_SECRET!
const FOLDER      = 'jommba/profiles'

// Génère la signature HMAC-SHA1 requise par Cloudinary pour un upload signé.
function sign(params: Record<string, string>): string {
  const sorted = Object.keys(params)
    .sort()
    .map(k => `${k}=${params[k]}`)
    .join('&')
  return crypto.createHash('sha1').update(sorted + API_SECRET).digest('hex')
}

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

  const timestamp  = String(Math.floor(Date.now() / 1000))
  const userFolder = `${FOLDER}/${user.id}`
  const params     = { folder: userFolder, timestamp }
  const signature  = sign(params)

  const formData = new FormData()
  formData.append('file',      file)
  formData.append('timestamp', timestamp)
  formData.append('api_key',   API_KEY)
  formData.append('signature', signature)
  formData.append('folder',    userFolder)

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: 'POST', body: formData }
  )

  const json = await res.json() as { secure_url?: string; error?: { message: string } }

  if (!res.ok || !json.secure_url) {
    console.error('[upload/avatar] Cloudinary error:', json.error)
    return NextResponse.json(
      { error: json.error?.message ?? 'Échec de l\'upload' },
      { status: 400 }
    )
  }

  return NextResponse.json({ url: json.secure_url })
}
