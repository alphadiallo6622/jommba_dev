// app/[locale]/layout.tsx
// Layout imbriqué pour les routes localisées (site public + auth). Le shell
// <html>/<body> vit dans app/layout.tsx (racine unique, partagée avec
// /dashboard, /adminjommba… qui ne sont pas localisés) ; ce layout se
// contente de fournir les traductions au client et d'activer le rendu
// statique (SSG) par locale.
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // Permet à generateStaticParams de produire du HTML statique par locale.
  setRequestLocale(locale);

  return (
    <NextIntlClientProvider>
      {children}
    </NextIntlClientProvider>
  );
}
