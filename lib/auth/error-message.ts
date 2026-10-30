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

// GoTrue nomme parfois explicitement la cause ; sinon il se contente d'une 500
// au corps vide (cf. OPAQUE ci-dessus).
const MAILER_FAILURE = /error sending|sending .*(e-?mail|confirmation)|smtp/i

/**
 * L'échec vient-il de l'envoi de l'e-mail plutôt que des données saisies ?
 *
 * C'est le cas quand le quota du fournisseur d'e-mails est épuisé ou que son
 * SMTP est en panne : le compte est bien créé côté Supabase, seul l'e-mail de
 * confirmation ne part pas. La distinction compte pour l'utilisateur : il n'a
 * rien à corriger, il doit passer par Google ou revenir plus tard. Lui dire
 * « réessaie dans un instant » le pousse à marteler le bouton pour rien.
 */
export function isEmailDeliveryFailure(
  error: { message?: string | null; status?: number } | null | undefined,
): boolean {
  if (!error) return false
  const raw = typeof error.message === 'string' ? error.message.trim() : ''
  if (MAILER_FAILURE.test(raw)) return true
  // 500 sans message exploitable : en pratique toujours le mailer, les erreurs
  // de saisie remontant en 4xx avec un message explicite.
  return error.status === 500 && (!raw || OPAQUE.test(raw))
}
