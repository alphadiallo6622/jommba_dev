import type { Metadata, Viewport } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { inter, playfair, arefRuqaa } from "@/lib/fonts";
import { SITE_METADATA } from "@/lib/constants";
import { Toaster } from "sonner";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { PresenceProvider } from "@/components/providers/PresenceProvider";
import PWAInstallBanner from "@/components/pwa/PWAInstallBanner";
import ServiceWorkerRegistrar from "@/components/pwa/ServiceWorkerRegistrar";
import { createClient } from "@/lib/supabase/server";
import "./globals.css";

export const metadata: Metadata = {
  title: SITE_METADATA.title,
  description: SITE_METADATA.description,
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://jommba.com"),
  // Lie le Web App Manifest généré par app/manifest.ts (installabilité
  // Android/Chrome/Edge).
  manifest: "/manifest.webmanifest",
  applicationName: "Jommba.com",
  appleWebApp: {
    // iOS ignore le manifest : ces meta "apple-*" prennent le relais pour
    // l'ajout à l'écran d'accueil (plein écran + barre d'état translucide).
    capable: true,
    title: "Jommba.com",
    statusBarStyle: "default",
  },
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/apple-touch-icon.png",
  },
  other: {
    // Le site gère lui-même ses langues (LocaleSwitcher + next-intl). La
    // traduction automatique de Chrome/Google réécrit les nœuds de texte du
    // DOM, ce qui casse la réconciliation React : les cartes profil gardaient
    // l'ancien nom et empilaient les âges après un "Passer". On la désactive.
    google: "notranslate",
  },
};

export const viewport: Viewport = {
  // Couleur de la barre système une fois l'app installée (--color-primary).
  themeColor: "#00A676",
  // `viewport-fit=cover` + les env(safe-area-inset-*) déjà utilisés évitent
  // que le contenu passe sous l'encoche en mode standalone iOS.
  viewportFit: "cover",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Récupère l'utilisateur Supabase côté serveur pour l'AuthProvider client
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Locale résolue par next-intl : "fr" ou "en" sous /[locale]/…, "fr" par
  // défaut ailleurs (dashboard, adminjommba…, non localisés).
  const locale = await getLocale();

  // La bannière PWA vit ici (donc sur tout le site, dashboard compris), mais ce
  // layout racine n'a pas de NextIntlClientProvider — seul app/[locale]/ en a
  // un. On lui fournit donc le strict nécessaire : le namespace "pwa". Les
  // pages localisées gardent leur propre provider imbriqué, inchangé.
  const messages = await getMessages();
  const pwaMessages = { pwa: (messages as { pwa: unknown }).pwa };

  return (
    <html
      lang={locale}
      translate="no"
      className={`notranslate ${inter.variable} ${playfair.variable} ${arefRuqaa.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-jommba-bg text-text-secondary font-sans">
        <AuthProvider initialUser={user}>
          <PresenceProvider>
            {children}
          </PresenceProvider>
        </AuthProvider>
        <Toaster richColors position="top-center" />
        <ServiceWorkerRegistrar />
        <NextIntlClientProvider locale={locale} messages={pwaMessages}>
          <PWAInstallBanner />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
