// Chemins localisés sous /[locale]/(auth)/… : préfixés par la locale du
// visiteur (cookie NEXT_LOCALE) avant redirection. Les autres (/dashboard,
// /onboarding…) restent inchangés, hors périmètre i18n.
const LOCALIZED_PATHS = ['/connexion', '/inscription', '/mot-de-passe-oublie', '/reinitialiser-mot-de-passe']

export type AuthLocale = 'fr' | 'en'

export function toAuthLocale(value: string | undefined | null): AuthLocale {
  return value === 'en' ? 'en' : 'fr'
}

export function localizePath(path: string, locale: AuthLocale): string {
  const [pathname, query] = path.split('?')
  if (!LOCALIZED_PATHS.includes(pathname)) return path
  return `/${locale}${pathname}${query ? `?${query}` : ''}`
}

/** N'accepte qu'un chemin interne (évite les redirections ouvertes via ?next=). */
export function safeNextPath(next: string | null, fallback: string): string {
  if (!next || !next.startsWith('/') || next.startsWith('//')) return fallback
  return next
}
