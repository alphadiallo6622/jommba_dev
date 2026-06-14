"use client";
// app/admin/(protected)/signalements/page.tsx
import { Flag } from "lucide-react";
import { REPORTS } from "@/lib/admin/mock-data";
import { useToast } from "@/components/admin/ui/toast";

const SEV_LABEL: Record<string, string> = {
  high:   "Priorité haute",
  medium: "Priorité moyenne",
  low:    "Priorité faible",
};
const SEV_STYLE: Record<string, string> = {
  high:   "bg-red-100 text-red-700",
  medium: "bg-amber-100 text-amber-700",
  low:    "bg-gray-100 text-gray-600",
};
const FLAG_STYLE: Record<string, string> = {
  high:   "bg-red-50 text-red-500",
  medium: "bg-amber-50 text-amber-500",
  low:    "bg-gray-100 text-gray-500",
};

export default function SignalementsPage() {
  const { show } = useToast();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-[var(--color-ink)]">Signalements</h1>
        <p className="text-sm text-[var(--color-muted)] mt-0.5">
          À examiner sous 24 h selon les règles métier.
        </p>
      </div>

      <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-line)] divide-y divide-[var(--color-line)] shadow-[var(--shadow-card)]">
        {REPORTS.map((r, i) => (
          <div key={i} className="flex items-start gap-4 px-5 py-4">
            {/* Flag icon */}
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${FLAG_STYLE[r.sev]}`}>
              <Flag className="w-4 h-4" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-sm text-[var(--color-ink)]">{r.reason}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${SEV_STYLE[r.sev]}`}>
                  {SEV_LABEL[r.sev]}
                </span>
              </div>
              <p className="text-sm text-[var(--color-muted)]">{r.desc}</p>
              <p className="text-xs text-[var(--color-muted)]">
                Signalé par{" "}
                <span className="font-medium text-[var(--color-ink)]">{r.reporter}</span>
                {" · "}contre{" "}
                <span className="font-medium text-[var(--color-ink)]">{r.reported}</span>
                {" · "}{r.when}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => show(`Signalement ignoré`, "success")}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-[var(--color-muted)] hover:bg-[var(--color-faint)] border border-[var(--color-line)] transition-colors"
              >
                Ignorer
              </button>
              <button
                onClick={() => show(`Membre averti · ${r.reported}`, "warning")}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-amber-700 hover:bg-amber-50 border border-amber-200 transition-colors"
              >
                Avertir
              </button>
              <button
                onClick={() => show(`Compte suspendu · ${r.reported}`, "error")}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-red-600 hover:bg-red-50 border border-red-200 transition-colors"
              >
                Suspendre
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
