// supabase-js construit le message d'une AuthError avec, dans l'ordre :
// msg → message → error_description → error → JSON.stringify(corps). Quand
// GoTrue renvoie une 500 dont le corps ne porte aucun de ces champs, le
// message devient littéralement "{}" — ce qui remontait tel quel dans un toast.
// On filtre ces messages opaques pour retomber sur un texte traduit.
const OPAQUE = /^(\{\s*\}|\[\s*\]|""|''|null|undefined|\[object Object\])$/

export function authErrorMessage(
  error: { message?: string | null } | null | undefined,
  fallback: string,
): string {
  const raw = typeof error?.message === 'string' ? error.message.trim() : ''
  return !raw || OPAQUE.test(raw) ? fallback : raw
}
