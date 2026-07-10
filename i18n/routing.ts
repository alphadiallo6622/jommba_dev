// i18n/routing.ts
// Définition centrale des locales supportées et du routing next-intl.
// Pour ajouter une langue plus tard (es, ar…) : l'ajouter à `locales`,
// créer messages/<code>.json, puis ajouter le libellé dans LOCALE_LABELS
// (components/layout/LocaleSwitcher.tsx). Rien d'autre à changer.
import { defineRouting } from "next-intl/routing";

export const locales = ["fr", "en"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "fr";

export const routing = defineRouting({
  locales,
  defaultLocale,
  // Toujours préfixer l'URL (/fr/..., /en/...), y compris pour la locale
  // par défaut — évite l'ambiguïté entre "/" et "/fr" et simplifie le proxy.
  localePrefix: "always",
  localeCookie: {
    name: "NEXT_LOCALE",
    maxAge: 60 * 60 * 24 * 365, // 1 an
  },
});
