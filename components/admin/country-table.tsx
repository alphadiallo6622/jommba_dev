"use client";
// components/admin/country-table.tsx
import { useState } from "react";
import { Card, CardHeader } from "@/components/admin/ui/card";
import { Pagination } from "@/components/admin/ui/pagination";
import type { CountryRow } from "@/lib/admin/queries";

const PER_PAGE = 10;

export function CountryTable({ rows }: { rows: CountryRow[] }) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(rows.length / PER_PAGE));
  // La page courante peut depasser apres un rafraichissement automatique qui
  // ramene moins de pays : on retombe alors sur la derniere page existante.
  const current = Math.min(page, totalPages);
  const visible = rows.slice((current - 1) * PER_PAGE, current * PER_PAGE);

  return (
    <Card>
      <CardHeader
        title="Inscrits par pays"
        action={
          <span className="text-[11px] text-[var(--color-muted)]">
            {rows.length} pays représentés
          </span>
        }
      />
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-[var(--color-muted)] border-b border-[var(--color-line)]">
              <th className="font-medium px-5 py-2.5">Pays</th>
              <th className="font-medium px-5 py-2.5 text-right">Membres</th>
              <th className="font-medium px-5 py-2.5 text-right">Hommes</th>
              <th className="font-medium px-5 py-2.5 text-right">Femmes</th>
              <th className="font-medium px-5 py-2.5 text-right w-32">Part</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-line)]">
            {visible.map((row) => (
              <tr key={row.code} className="hover:bg-[var(--color-faint)]">
                <td className="px-5 py-2.5 text-[var(--color-ink)] font-medium">
                  {row.country}
                </td>
                <td className="px-5 py-2.5 text-right font-semibold text-[var(--color-ink)]">
                  {row.total.toLocaleString("fr-FR")}
                </td>
                <td className="px-5 py-2.5 text-right text-[var(--color-muted)]">{row.hommes}</td>
                <td className="px-5 py-2.5 text-right text-[var(--color-muted)]">{row.femmes}</td>
                <td className="px-5 py-2.5">
                  <div className="flex items-center gap-2 justify-end">
                    <div className="h-1.5 w-16 rounded-full bg-[var(--color-faint)] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[var(--color-brand-500)]"
                        style={{ width: `${row.share}%` }}
                      />
                    </div>
                    <span className="text-xs text-[var(--color-muted)] w-9 text-right">
                      {row.share} %
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-5 py-3 border-t border-[var(--color-line)]">
        <Pagination
          page={current}
          totalPages={totalPages}
          onChange={setPage}
          label={`${rows.length} pays · page ${current}/${totalPages}`}
        />
      </div>
    </Card>
  );
}
