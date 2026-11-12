// Chiffrement symétrique des valeurs sensibles stockées en base (clés API
// réglables depuis la console admin). AES-256-GCM, côté serveur uniquement.
//
// La clé de chiffrement dérive d'un secret déjà présent dans l'environnement
// (SETTINGS_ENCRYPTION_KEY si fourni, sinon ADMIN_JWT_SECRET) : aucune nouvelle
// variable obligatoire. Les valeurs chiffrées portent le préfixe `v1:` pour
// pouvoir distinguer un secret chiffré d'une valeur en clair (migration douce).
import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto'

const PREFIX = 'v1:'
const SALT = 'jommba.secret-box.v1' // sel fixe : la force vient du secret source.

function encryptionKey(): Buffer {
  const source = process.env.SETTINGS_ENCRYPTION_KEY || process.env.ADMIN_JWT_SECRET
  if (!source) {
    throw new Error(
      'SETTINGS_ENCRYPTION_KEY (ou ADMIN_JWT_SECRET) manquant : impossible de chiffrer les secrets.',
    )
  }
  return scryptSync(source, SALT, 32)
}

/** `true` si la chaîne est déjà un secret chiffré par ce module. */
export function isEncrypted(value: string | null | undefined): boolean {
  return typeof value === 'string' && value.startsWith(PREFIX)
}

/** Chiffre une valeur en clair → `v1:base64(iv|tag|ciphertext)`. Idempotent :
 *  une valeur déjà chiffrée est renvoyée telle quelle. */
export function encryptSecret(plain: string): string {
  if (isEncrypted(plain)) return plain
  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', encryptionKey(), iv)
  const ciphertext = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return PREFIX + Buffer.concat([iv, tag, ciphertext]).toString('base64')
}

/** Déchiffre une valeur produite par encryptSecret. Renvoie la valeur telle
 *  quelle si elle n'est pas chiffrée (valeur héritée en clair), et null si le
 *  déchiffrement échoue (clé changée, données corrompues). */
export function decryptSecret(value: string | null | undefined): string | null {
  if (value == null || value === '') return null
  if (!isEncrypted(value)) return value
  try {
    const raw = Buffer.from(value.slice(PREFIX.length), 'base64')
    const iv = raw.subarray(0, 12)
    const tag = raw.subarray(12, 28)
    const ciphertext = raw.subarray(28)
    const decipher = createDecipheriv('aes-256-gcm', encryptionKey(), iv)
    decipher.setAuthTag(tag)
    return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8')
  } catch (err) {
    console.error('[secret-box] déchiffrement échoué', err)
    return null
  }
}
