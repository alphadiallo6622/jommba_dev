// Rapatrie les photos de profil hebergees chez Cloudinary vers Supabase Storage.
//
// Pourquoi : le quota gratuit Cloudinary est epuise. Les nouvelles photos vont
// deja sur Supabase (cf. lib/supabase/storage.ts), mais les anciennes vivent
// encore chez Cloudinary : si ce compte est desactive, elles disparaissent du
// site. Ce script coupe cette dependance.
//
// Usage :
//   node scripts/migrate-photos-to-supabase.mjs --dry-run      (n'ecrit rien)
//   node scripts/migrate-photos-to-supabase.mjs --limit 5      (essai)
//   node scripts/migrate-photos-to-supabase.mjs                (tout)
//   node scripts/migrate-photos-to-supabase.mjs --rollback     (retour arriere)
//
// Pour chaque photo : telechargement depuis Cloudinary, depot sur Supabase,
// puis mise a jour de la ligne. L'URL d'origine est conservee dans
// `legacy_url`, ce qui rend le retour arriere possible a tout moment.
//
// Relancable sans risque : seules les lignes encore sur Cloudinary sont
// traitees. Une interruption en cours de route se reprend simplement en
// relancant. Chaque photo est independante : un echec isole n'arrete pas le
// reste, il est seulement rapporte a la fin.
//
// L'ordre d'ecriture est deliberé : le fichier est d'abord depose sur Supabase,
// et la base n'est mise a jour qu'ensuite. Si le script s'arrete entre les
// deux, la base pointe toujours vers Cloudinary, qui fonctionne encore : on
// laisse au pire un fichier orphelin, jamais une photo cassee.
import { readFileSync } from 'node:fs'
import { randomUUID } from 'node:crypto'

// --- Chargement minimal de .env.local (sans dependance) ---
function loadEnv() {
  const raw = readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
  const env = {}
  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/)
    if (m) env[m[1]] = m[2].trim().replace(/^["']|["']$/g, '')
  }
  return env
}

const env = loadEnv()
const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY
const BUCKET = 'profile-photos'

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY manquant dans .env.local')
  process.exit(1)
}

const args = process.argv.slice(2)
const DRY_RUN = args.includes('--dry-run')
const ROLLBACK = args.includes('--rollback')
const LIMIT = (() => {
  const i = args.indexOf('--limit')
  return i !== -1 && args[i + 1] ? Number(args[i + 1]) : null
})()

/** Formats acceptes par le bucket, et extension associee. */
const EXT_BY_MIME = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/avif': 'avif',
}

const rest = (path, init = {}) =>
  fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
  })

/** Lignes encore hebergees chez Cloudinary, par pages de 1000. */
async function fetchCloudinaryPhotos() {
  const rows = []
  for (let from = 0; ; from += 1000) {
    const res = await rest(
      `profile_photos?select=id,user_id,url,public_id,legacy_url&url=ilike.*cloudinary*&order=created_at.asc`,
      { headers: { Range: `${from}-${from + 999}` } },
    )
    if (!res.ok) throw new Error(`lecture profile_photos: ${res.status} ${await res.text()}`)
    const page = await res.json()
    rows.push(...page)
    if (page.length < 1000) break
  }
  return rows
}

/** Meme URL, mais en demandant a Cloudinary de convertir en JPEG au passage.
 *  Les iPhones ont depose des HEIC, que Chrome et Android ne savent pas
 *  afficher : ces photos sont deja cassees pour la plupart des membres. On
 *  profite de Cloudinary une derniere fois pour les recuperer en JPEG. */
function jpegVariant(url) {
  const marker = '/upload/'
  const i = url.indexOf(marker)
  if (i === -1) return null
  return url.slice(0, i + marker.length) + 'f_jpg/' + url.slice(i + marker.length)
}

/** Telecharge une photo, en convertissant si son format n'est pas affichable. */
async function download(url) {
  let res = await fetch(url)
  if (!res.ok) return { erreur: `telechargement ${res.status}` }

  let mime = (res.headers.get('content-type') ?? '').split(';')[0].trim().toLowerCase()
  if (!EXT_BY_MIME[mime]) {
    const variant = jpegVariant(url)
    if (!variant) return { erreur: `format non accepte (${mime || 'inconnu'})` }
    res = await fetch(variant)
    if (!res.ok) return { erreur: `conversion ${res.status}` }
    mime = (res.headers.get('content-type') ?? '').split(';')[0].trim().toLowerCase()
    if (!EXT_BY_MIME[mime]) return { erreur: `format non accepte apres conversion (${mime || 'inconnu'})` }
  }

  return { mime, bytes: Buffer.from(await res.arrayBuffer()) }
}

/** Migre une photo. Renvoie { ok } ou { ok: false, raison }. */
async function migrateOne(row) {
  // 1. Telechargement depuis Cloudinary (avec conversion si necessaire)
  const dl = await download(row.url)
  if (dl.erreur) return { ok: false, raison: dl.erreur }

  const { mime, bytes } = dl
  const ext = EXT_BY_MIME[mime]
  if (bytes.length === 0) return { ok: false, raison: 'fichier vide' }

  const path = `${row.user_id}/${randomUUID()}.${ext}`
  const newUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path}`

  if (DRY_RUN) return { ok: true, dryRun: true, taille: bytes.length }

  // 2. Depot sur Supabase (avant toute ecriture en base : cf. en-tete)
  const up = await fetch(`${SUPABASE_URL}/storage/v1/object/${BUCKET}/${path}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${SERVICE_KEY}`, 'Content-Type': mime },
    body: bytes,
  })
  if (!up.ok) return { ok: false, raison: `depot ${up.status} ${await up.text()}` }

  // 3. Mise a jour de la ligne, en gardant l'URL d'origine pour le retour arriere
  const patch = await rest(`profile_photos?id=eq.${row.id}`, {
    method: 'PATCH',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify({
      url: newUrl,
      public_id: path,
      legacy_url: row.legacy_url ?? row.url,
    }),
  })
  if (!patch.ok) return { ok: false, raison: `maj base ${patch.status} ${await patch.text()}` }

  // 4. L'avatar du profil porte la meme URL : on le realigne.
  //    Cible par l'ancienne URL, donc sans effet si l'avatar est une autre photo.
  const avatar = await rest(
    `profiles?user_id=eq.${row.user_id}&avatar_url=eq.${encodeURIComponent(row.url)}`,
    {
      method: 'PATCH',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify({ avatar_url: newUrl }),
    },
  )
  if (!avatar.ok) return { ok: false, raison: `maj avatar ${avatar.status} ${await avatar.text()}` }

  return { ok: true, taille: bytes.length }
}

/** Remet les URLs Cloudinary d'origine. Les fichiers deposes sur Supabase sont
 *  laisses en place : inoffensifs, et utiles si on veut rejouer la migration. */
async function rollback() {
  const res = await rest('profile_photos?select=id,user_id,url,legacy_url&legacy_url=not.is.null')
  if (!res.ok) throw new Error(`lecture: ${res.status}`)
  const rows = await res.json()
  console.log(`${rows.length} photo(s) a remettre sur leur URL d'origine.\n`)
  if (DRY_RUN) return

  let ok = 0
  for (const row of rows) {
    const p = await rest(`profile_photos?id=eq.${row.id}`, {
      method: 'PATCH',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify({ url: row.legacy_url, legacy_url: null }),
    })
    await rest(`profiles?user_id=eq.${row.user_id}&avatar_url=eq.${encodeURIComponent(row.url)}`, {
      method: 'PATCH',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify({ avatar_url: row.legacy_url }),
    })
    if (p.ok) ok++
  }
  console.log(`${ok}/${rows.length} ligne(s) restaurée(s).`)
}

async function main() {
  if (ROLLBACK) return rollback()

  const rows = await fetchCloudinaryPhotos()
  const todo = LIMIT ? rows.slice(0, LIMIT) : rows

  console.log(`${rows.length} photo(s) encore chez Cloudinary.`)
  console.log(`${todo.length} a traiter${DRY_RUN ? ' (SIMULATION, aucune ecriture)' : ''}.\n`)
  if (todo.length === 0) return

  let ok = 0
  let octets = 0
  const echecs = []

  for (let i = 0; i < todo.length; i++) {
    const row = todo[i]
    let r
    try {
      r = await migrateOne(row)
    } catch (err) {
      r = { ok: false, raison: String(err?.message ?? err) }
    }

    if (r.ok) {
      ok++
      octets += r.taille ?? 0
    } else {
      echecs.push({ id: row.id, url: row.url, raison: r.raison })
    }

    const n = i + 1
    if (n % 25 === 0 || n === todo.length) {
      console.log(`  ${n}/${todo.length} — ${ok} ok, ${echecs.length} echec(s)`)
    }
  }

  console.log(`\nTermine : ${ok} migree(s), ${echecs.length} echec(s), ${(octets / 1048576).toFixed(1)} Mo transferes.`)
  if (echecs.length > 0) {
    console.log('\nEchecs (ces photos gardent leur URL Cloudinary, rien n_est casse) :')
    for (const e of echecs.slice(0, 20)) console.log(`  - ${e.raison} :: ${e.url}`)
    if (echecs.length > 20) console.log(`  … et ${echecs.length - 20} autre(s)`)
  }
}

main().catch((err) => {
  console.error('Erreur fatale :', err)
  process.exit(1)
})
