"use client";
// app/adminjommba/(protected)/signalements/signalements-client.tsx
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Flag, CheckCircle2 } from "lucide-react";
import type { ReportRow } from "@/lib/admin/types";
import {
  dismissReport, warnReportedMember, suspendReportedMember,
} from "@/app/adminjommba/actions";
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

export function SignalementsClient({ reports }: { reports: ReportRow[] }) {
  const { show } = useToast();
  const router = useRouter();
  const [busy, startTransition] = useTransition();
  const [removed, setRemoved] = useState<Set<string>>(new Set());

  const visible = reports.filter((r) => !removed.has(r.id));

  const act = (
    r: ReportRow,
    fn: (id: string) => Promise<{ ok: boolean; error?: string }>,
    msg: string,
    type: "success" | "warning" | "error",
  ) => {
    startTransition(async () => {
      const res = await fn(r.id);
      if (res.ok) {
        setRemoved((prev) => new Set(prev).add(r.id));
        show(msg, type);
        router.refresh();
      } else {
        show(res.error ?? "Une erreur est survenue", "error");
      }
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-[var(--color-ink)]">Signalements</h1>
        <p className="text-sm text-[var(--color-muted)] mt-0.5">
          À examiner sous 24 h selon les règles métier.
        </p>
      </div>

      {visible.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-[var(--color-muted)] bg-[var(--color-surface)] rounded-xl border border-[var(--color-line)]">
          <CheckCircle2 className="w-10 h-10 mb-3 opacity-40" />
          <p className="text-sm">Aucun signalement en attente</p>
        </div>
      ) : (
        <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-line)] divide-y divide-[var(--color-line)] shadow-[var(--shadow-card)]">
          {visible.map((r) => (
            <div key={r.id} className="flex items-start gap-4 px-5 py-4">
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
                {r.desc && <p className="text-sm text-[var(--color-muted)]">{r.desc}</p>}
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
                  disabled={busy}
                  onClick={() => act(r, dismissReport, "Signalement ignoré", "success")}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-[var(--color-muted)] hover:bg-[var(--color-faint)] border border-[var(--color-line)] transition-colors disabled:opacity-50"
                >
                  Ignorer
                </button>
                <button
                  disabled={busy}
                  onClick={() => act(r, warnReportedMember, `Membre averti · ${r.reported}`, "warning")}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-amber-700 hover:bg-amber-50 border border-amber-200 transition-colors disabled:opacity-50"
                >
                  Avertir
                </button>
                <button
                  disabled={busy}
                  onClick={() => act(r, suspendReportedMember, `Compte suspendu · ${r.reported}`, "error")}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-red-600 hover:bg-red-50 border border-red-200 transition-colors disabled:opacity-50"
                >
                  Suspendre
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
