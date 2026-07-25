// lib/cloudinary.ts
// Helpers serveur pour Cloudinary (upload signé côté route, suppression côté admin).
// La signature HMAC-SHA1 est identique à celle de app/api/upload/avatar/route.ts.
import crypto from "crypto"

const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME
const API_KEY = process.env.CLOUDINARY_API_KEY
const API_SECRET = process.env.CLOUDINARY_API_SECRET

/** Signature Cloudinary : tri des params + secret, hashé en SHA1. */
function sign(params: Record<string, string>): string {
  const sorted = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join("&")
  return crypto.createHash("sha1").update(sorted + API_SECRET).digest("hex")
}

/**
 * Dérive le public_id Cloudinary depuis une secure_url stockée.
 * Ex. https://res.cloudinary.com/<cloud>/image/upload/v1699999999/jommba/profiles/<uid>/abc.jpg
 *  → jommba/profiles/<uid>/abc
 * Retourne null si l'URL n'a pas le format attendu.
 */
export function publicIdFromUrl(url: string): string | null {
  try {
    const marker = "/upload/"
    const i = url.indexOf(marker)
    if (i === -1) return null
    let rest = url.slice(i + marker.length)
    // Retire un éventuel préfixe de version « v123456789/ ».
    rest = rest.replace(/^v\d+\//, "")
    // Retire l'extension finale (.jpg, .png, .webp…).
    rest = rest.replace(/\.[a-zA-Z0-9]+$/, "")
    return rest || null
  } catch {
    return null
  }
}

/**
 * Supprime une image de Cloudinary (destroy API signée).
 * Ne lève jamais : renvoie true si supprimée, false sinon (loggé).
 * Le rejet d'une photo ne doit pas être bloqué par un échec Cloudinary.
 */
export async function deleteCloudinaryImage(publicId: string): Promise<boolean> {
  if (!CLOUD_NAME || !API_KEY || !API_SECRET) {
    console.error("[cloudinary] variables d'environnement manquantes")
    return false
  }
  try {
    const timestamp = String(Math.floor(Date.now() / 1000))
    const signature = sign({ public_id: publicId, timestamp })

    const form = new FormData()
    form.append("public_id", publicId)
    form.append("timestamp", timestamp)
    form.append("api_key", API_KEY)
    form.append("signature", signature)

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/destroy`,
      { method: "POST", body: form },
    )
    const json = (await res.json()) as { result?: string }
    // "ok" = supprimée ; "not found" = déjà absente (on considère OK).
    if (json.result === "ok" || json.result === "not found") return true
    console.error("[cloudinary] destroy inattendu:", json)
    return false
  } catch (err) {
    console.error("[cloudinary] destroy échoué:", err)
    return false
  }
}
