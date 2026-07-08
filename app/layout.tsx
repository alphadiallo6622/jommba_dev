import type { Metadata } from "next";
import { inter, playfair, arefRuqaa } from "@/lib/fonts";
import { SITE_METADATA } from "@/lib/constants";
import { Toaster } from "sonner";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { PresenceProvider } from "@/components/providers/PresenceProvider";
import { createClient } from "@/lib/supabase/server";
import "./globals.css";

export const metadata: Metadata = {
  title: SITE_METADATA.title,
  description: SITE_METADATA.description,
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://jommba.com"),
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Récupère l'utilisateur Supabase côté serveur pour l'AuthProvider client
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <html
      lang="fr"
      className={`${inter.variable} ${playfair.variable} ${arefRuqaa.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-jommba-bg text-text-secondary font-sans">
        <AuthProvider initialUser={user}>
          <PresenceProvider>
            {children}
          </PresenceProvider>
        </AuthProvider>
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
