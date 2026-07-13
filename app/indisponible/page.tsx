// app/indisponible/page.tsx
// Page affichée aux visiteurs dont le pays est bloqué depuis la console admin
// (/adminjommba/parametres → « Disponibilité par pays »). Le middleware
// (proxy.ts) réécrit toute requête publique vers cette page pour ces pays.
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Service indisponible dans votre région — Jommba",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

export default function GeoBlockedPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-16 bg-gradient-to-br from-[#f4faf7] via-white to-[#eef7f2]">
      <div className="max-w-lg w-full text-center">
        {/* Logo / marque */}
        <div className="flex justify-center mb-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo_jommba.jpeg" alt="Jommba" className="h-16 w-auto" />
        </div>

        {/* Icône globe */}
        <div className="flex justify-center mb-6">
          <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center">
            <svg
              className="w-7 h-7 text-emerald-600"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.8}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0 0a8.949 8.949 0 0 0 4.951-1.488M12 21a8.949 8.949 0 0 1-4.951-1.488M3.055 11h17.89M12 3c2.485 2.687 3.75 5.842 3.75 9s-1.265 6.313-3.75 9c-2.485-2.687-3.75-5.842-3.75-9S9.515 5.687 12 3Z"
              />
            </svg>
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
          Indisponible dans votre région
        </h1>

        <p className="text-gray-600 leading-relaxed mb-8">
          Nous sommes désolés, mais Jommba n&apos;est pas accessible depuis votre
          pays pour le moment. Nous espérons vous accueillir très bientôt, in
          shā&rsquo; Allāh.
        </p>

        <p className="mt-10 text-xs text-gray-400">
          Jommba — Trouvez votre moitié dans le respect islamique.
        </p>
      </div>
    </main>
  );
}
