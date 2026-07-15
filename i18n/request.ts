// i18n/request.ts
// Config par requête pour next-intl : charge le bon fichier de messages
// selon la locale résolue par le routing (app/[locale]/…).
//
// Les routes HORS app/[locale]/ (/dashboard, /onboarding…) ne passent pas par
// le middleware next-intl : `requestLocale` y est donc absent. Pour que ces
// pages respectent quand même la langue choisie par le visiteur, on relit ici
// le cookie NEXT_LOCALE (posé par next-intl sur le site public) en second
// recours, avant de retomber sur la locale par défaut (fr).
import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { cookies } from "next/headers";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;

  // 1. Locale du routing (/fr/…, /en/…) si disponible.
  // 2. Sinon cookie NEXT_LOCALE (dashboard, onboarding…).
  // 3. Sinon locale par défaut.
  let locale = routing.defaultLocale;
  if (hasLocale(routing.locales, requested)) {
    locale = requested;
  } else {
    const cookieLocale = (await cookies()).get("NEXT_LOCALE")?.value;
    if (hasLocale(routing.locales, cookieLocale)) {
      locale = cookieLocale;
    }
  }

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
