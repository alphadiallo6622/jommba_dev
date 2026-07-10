// lib/i18n/locale-cookie.ts
// Lit la locale choisie par le visiteur (cookie NEXT_LOCALE posé par
// next-intl) depuis un composant client qui vit HORS de app/[locale]/
// (dashboard, onboarding…) et n'a donc pas accès à useLocale(). "fr" par
// défaut si le cookie est absent ou invalide. Client-only.
import type { Locale } from "@/i18n/routing";

export function readLocaleCookie(): Locale {
  if (typeof document === "undefined") return "fr";
  const match = document.cookie.match(/(?:^|; )NEXT_LOCALE=([^;]+)/);
  return match?.[1] === "en" ? "en" : "fr";
}

/** Chemin de l'accueil localisée (`/fr` ou `/en`) pour un router.push hors [locale]. */
export function localizedHome(): string {
  return `/${readLocaleCookie()}`;
}

/** Chemin de connexion localisé (`/fr/connexion` ou `/en/connexion`). */
export function localizedLogin(): string {
  return `/${readLocaleCookie()}/connexion`;
}
