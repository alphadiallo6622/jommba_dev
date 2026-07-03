"use client";
// app/adminjommba/(protected)/boosts/boosts-client.tsx
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Zap } from "lucide-react";
import type { BoostRow } from "@/lib/admin/types";
import { stopBoost } from "@/app/adminjommba/actions";
import { useToast } from "@/components/admin/ui/toast";

export function BoostsClient({ boosts }: { boosts: BoostRow[] }) {
  const { show } = useToast();
  const router = useRouter();
  const [busy, startTransition] = useTransition();
  const [stopped, setStopped] = useState<Set<string>>(new Set());

  const visible = boosts.filter((b) => !stopped.has(b.id));

  const handleStop = (b: BoostRow) => {
    startTransition(async () => {
      const res = await stopBoost(b.id);
      if (res.ok) {
        setStopped((prev) => new Set(prev).add(b.id));
        show(`Boost arrêté · ${b.name}`, "warning");
        router.refresh();
      } else {
        show(res.error ?? "Une erreur est survenue", "error");
      }
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-[var(--color-ink)]">Boosts de visibilité</h1>
        <p className="text-sm text-[var(--color-muted)] mt-0.5">
          Un seul boost actif par membre — réservé aux profils validés.
        </p>
      </div>

      {visible.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-[var(--color-muted)] bg-[var(--color-surface)] rounded-xl border border-[var(--color-line)]">
          <Zap className="w-10 h-10 mb-3 opacity-40" />
          <p className="text-sm">Aucun boost actif en ce moment</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {visible.map((b) => (
            <div
              key={b.id}
              className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-line)] shadow-[var(--shadow-card)] p-5 space-y-4"
            >
              {/* Header */}
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                  <Zap className="w-4 h-4 text-amber-600" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-[var(--color-ink)]">{b.name}</p>
                  <p className="text-xs text-[var(--color-muted)]">{b.duration}</p>
                </div>
              </div>

              {/* Progress */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[var(--color-muted)]">Temps restant</span>
                  <span className="text-xs font-semibold text-[var(--color-ink)]">{b.remainingLabel}</span>
                </div>
                <div className="h-2 rounded-full bg-[var(--color-faint)] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-amber-400 transition-all"
                    style={{ width: `${b.remainingPct}%` }}
                  />
                </div>
              </div>

              {/* Action */}
              <button
                disabled={busy}
                onClick={() => handleStop(b)}
                className="w-full py-2 rounded-lg border border-[var(--color-line)] text-xs font-semibold text-[var(--color-ink)] hover:bg-[var(--color-faint)] transition-colors disabled:opacity-50"
              >
                {busy ? "Arrêt…" : "Arrêter le boost"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
