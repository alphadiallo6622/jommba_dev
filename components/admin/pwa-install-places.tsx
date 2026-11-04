"use client";
// components/admin/pwa-install-places.tsx
//
// Carte KPI « Apps installées », cliquable : elle ouvre la liste des villes où
// l'app a été installée. La liste est paginée — une app qui marche finit par
// toucher plus de villes qu'un écran n'en montre.

import { useMemo, useState } from "react";
import { MapPin, Smartphone, X, ChevronLeft, ChevronRight } from "lucide-react";
import type { Kpi, PWAInstallPlacesData } from "@/lib/admin/types";
import { KpiCard } from "@/components/admin/ui/kpi-card";

/** Villes affichées par page. */
const PER_PAGE = 8;

export function PWAInstallPlaces({
  kpi,
  places,
}: {
  kpi: Kpi;
  places: PWAInstallPlacesData;
}) {
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(0);

  const pageCount = Math.max(1, Math.ceil(places.rows.length / PER_PAGE));
  const visible = useMemo(
    () => places.rows.slice(page * PER_PAGE, page * PER_PAGE + PER_PAGE),
    [places.rows, page],
  );

  const close = () => { setOpen(false); setPage(0); };

  return (
    <>
      {/* La carte garde l'apparence des autres KPI : seul l'état survolé
          signale qu'elle mène quelque part. */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        className="text-left rounded-xl transition-shadow hover:shadow-[var(--shadow-card-hover,0_4px_16px_rgba(0,0,0,0.10))] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-400)]"
      >
        <KpiCard kpi={{ ...kpi, delta: `${kpi.delta} · voir les lieux →` }} />
      </button>

      {open && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={close} />

          <div
            className="relative bg-white w-full sm:max-w-xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[92vh]"
            role="dialog"
            aria-modal="true"
            aria-labelledby="pwa-places-title"
            onClick={(e) => e.stopPropagation()}
          >
            {/* En-tête */}
            <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-[var(--color-line)] shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-cyan-50 flex items-center justify-center shrink-0">
                  <Smartphone className="w-[18px] h-[18px] text-cyan-600" />
                </div>
                <div className="min-w-0">
                  <h3 id="pwa-places-title" className="font-semibold text-base text-[var(--color-ink)]">
                    Où l’app est installée
                  </h3>
                  <p className="text-xs text-[var(--color-muted)] mt-0.5">
                    {places.total} installation{places.total > 1 ? "s" : ""}
                    {places.located < places.total && (
                      <> · {places.total - places.located} sans lieu connu</>
                    )}
                  </p>
                </div>
              </div>
              <button
                onClick={close}
                aria-label="Fermer"
                className="p-1 rounded-lg hover:bg-[var(--color-faint)] text-[var(--color-muted)] transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Liste */}
            <div className="flex-1 overflow-y-auto">
              {places.rows.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-[var(--color-muted)]">
                  <MapPin className="w-9 h-9 mb-3 opacity-40" />
                  <p className="text-sm">Aucune installation enregistrée</p>
                </div>
              ) : (
                <ul className="divide-y divide-[var(--color-line)]">
                  {visible.map((row) => (
                    <li key={`${row.country}-${row.city}`} className="flex items-center gap-3 px-5 py-3">
                      <div className="w-8 h-8 rounded-lg bg-[var(--color-faint)] flex items-center justify-center shrink-0">
                        <MapPin className="w-4 h-4 text-[var(--color-muted)]" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[var(--color-ink)] truncate">
                          {row.city}
                        </p>
                        <p className="text-xs text-[var(--color-muted)] truncate">
                          {row.country} · dernière {row.last}
                        </p>
                      </div>

                      <div className="shrink-0 text-right">
                        <p className="text-sm font-bold text-[var(--color-ink)] tabular-nums">
                          {row.count}
                        </p>
                        <p className="text-[11px] text-[var(--color-muted)] tabular-nums">
                          {row.share} %
                        </p>
                      </div>

                      {/* Barre de part, alignée sur la ville la plus fournie */}
                      <div className="hidden sm:block w-20 shrink-0">
                        <div className="h-1.5 rounded-full bg-[var(--color-faint)] overflow-hidden">
                          <div
                            className="h-full rounded-full bg-cyan-500"
                            style={{
                              width: `${places.rows[0].count > 0
                                ? Math.round((row.count / places.rows[0].count) * 100)
                                : 0}%`,
                            }}
                          />
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Pagination — masquée tant qu'il n'y a qu'une page */}
            {pageCount > 1 && (
              <div className="flex items-center justify-between gap-3 px-5 py-3 border-t border-[var(--color-line)] bg-[var(--color-faint)] sm:rounded-b-2xl shrink-0">
                <span className="text-xs text-[var(--color-muted)]">
                  {places.rows.length} ville{places.rows.length > 1 ? "s" : ""}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    disabled={page === 0}
                    aria-label="Page précédente"
                    className="p-1.5 rounded-lg border border-[var(--color-line)] bg-white text-[var(--color-ink)] hover:bg-[var(--color-faint)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-medium text-[var(--color-ink)] tabular-nums">
                    {page + 1} / {pageCount}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
                    disabled={page >= pageCount - 1}
                    aria-label="Page suivante"
                    className="p-1.5 rounded-lg border border-[var(--color-line)] bg-white text-[var(--color-ink)] hover:bg-[var(--color-faint)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
