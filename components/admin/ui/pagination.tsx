"use client";
// components/admin/ui/pagination.tsx
import { paginationRange } from "@/lib/pagination";

interface Props {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
  /** Texte a gauche de la barre, par exemple « 34 pays · page 2/4 ». */
  label?: React.ReactNode;
}

/**
 * Barre de pagination de la console admin. La logique des numeros affiches
 * vit dans lib/pagination.ts ; ce composant n'en fait que le rendu, pour que
 * les tableaux de la console partagent la meme barre.
 */
export function Pagination({ page, totalPages, onChange, label }: Props) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between min-h-[28px]">
      <span className="text-xs text-[var(--color-muted)]">{label}</span>
      {totalPages > 1 && (
        <div className="flex flex-wrap items-center gap-1">
          <button
            onClick={() => onChange(Math.max(1, page - 1))}
            disabled={page === 1}
            aria-label="Page précédente"
            className="px-3 py-1 rounded-lg border border-[var(--color-line)] text-xs text-[var(--color-ink)] disabled:opacity-40 hover:bg-[var(--color-faint)] transition-colors"
          >
            ‹
          </button>
          {paginationRange(page, totalPages).map((item, i) =>
            item === "ellipsis" ? (
              <span
                key={`gap-${i}`}
                aria-hidden="true"
                className="px-2 py-1 text-xs text-[var(--color-muted)] select-none"
              >
                …
              </span>
            ) : (
              <button
                key={item}
                onClick={() => onChange(item)}
                aria-current={item === page ? "page" : undefined}
                className={`px-3 py-1 rounded-lg border text-xs transition-colors ${
                  item === page
                    ? "bg-[var(--color-brand-600)] border-[var(--color-brand-600)] text-white"
                    : "border-[var(--color-line)] text-[var(--color-ink)] hover:bg-[var(--color-faint)]"
                }`}
              >
                {item}
              </button>
            )
          )}
          <button
            onClick={() => onChange(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            aria-label="Page suivante"
            className="px-3 py-1 rounded-lg border border-[var(--color-line)] text-xs text-[var(--color-ink)] disabled:opacity-40 hover:bg-[var(--color-faint)] transition-colors"
          >
            ›
          </button>
        </div>
      )}
    </div>
  );
}
