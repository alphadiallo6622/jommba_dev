// app/manifest.ts
// Web App Manifest servi sur /manifest.webmanifest (convention de fichier
// Next.js App Router). C'est lui qui rend le site installable sur Android,
// Chrome, Edge… — iOS/Safari l'ignore en partie et passe par les meta
// "apple-*" déclarées dans app/layout.tsx.
//
// Les icônes sont générées depuis public/logo_PWA_Jommba.png par
// `node scripts/generate-pwa-icons.mjs` (à relancer si le logo change).
import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Jommba.com",
    short_name: "Jommba.com",
    description: "Plateforme Jommba.com",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#FFFFFF",
    // Couleur principale du projet (--color-primary dans app/globals.css).
    theme_color: "#00A676",
    icons: [
      // "any" : icône affichée telle quelle (Chrome desktop, écran d'accueil…).
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      // "maskable" : Android rogne l'icône (cercle, squircle…) ; ces versions
      // gardent le logo dans la zone sûre centrale sur fond plein.
      { src: "/icons/icon-maskable-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
