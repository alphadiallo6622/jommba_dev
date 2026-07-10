// app/maintenance/page.tsx
// Page affichée à tous les visiteurs quand le mode maintenance est activé
// depuis la console admin (/adminjommba/parametres).
import type { Metadata } from "next";
import { getPlatformSettings } from "@/lib/admin/queries";

export const metadata: Metadata = {
  title: "Site en maintenance — Jommba",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

export default async function MaintenancePage() {
  const { maintenance } = await getPlatformSettings();
  const message =
    maintenance.message?.trim() ||
    "Nous effectuons actuellement une petite mise à jour pour améliorer votre expérience. Le site sera de nouveau disponible très bientôt, in shā’ Allāh.";

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-16 bg-gradient-to-br from-[#f4faf7] via-white to-[#eef7f2]">
      <div className="max-w-lg w-full text-center">
        {/* Logo / marque */}
        <div className="flex justify-center mb-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo_jommba.jpeg"
            alt="Jommba"
            className="h-16 w-auto"
          />
        </div>

        {/* Icône outils */}
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
                d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437 1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008Z"
              />
            </svg>
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
          Site en maintenance
        </h1>

        <p className="text-gray-600 leading-relaxed mb-8">{message}</p>

        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-emerald-100 text-sm text-emerald-700 shadow-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          Retour en ligne imminent
        </div>

        <p className="mt-10 text-xs text-gray-400">
          Jommba — Trouvez votre moitié dans le respect islamique.
        </p>
      </div>
    </main>
  );
}
