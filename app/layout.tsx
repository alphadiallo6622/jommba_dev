import type { Metadata } from "next";
import { inter, playfair, arefRuqaa } from "@/lib/fonts";
import { SITE_METADATA } from "@/lib/constants";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: SITE_METADATA.title,
  description: SITE_METADATA.description,
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://jommba.net"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${inter.variable} ${playfair.variable} ${arefRuqaa.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-jommba-bg text-text-secondary font-sans">
        {children}
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}


