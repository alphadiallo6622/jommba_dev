"use client";
// components/admin/ui/data-table.tsx
import { useState, useMemo } from "react";
import { ChevronUp, ChevronDown, Search, Download, FileSpreadsheet } from "lucide-react";
import { downloadCsv, downloadXls } from "@/lib/admin/format";

export interface Column<T> {
  key: string;
  label: string;
  render?: (row: T) => React.ReactNode;
  sortable?: boolean;
  csvValue?: (row: T) => string | number;
}

interface Props<T> {
  data: T[];
  columns: Column<T>[];
  filterChips?: { label: string; value: string }[];
  filterKey?: keyof T & string;
  customFilterFn?: (row: T, chip: string) => boolean;
  csvFilename?: string;
  xlsFilename?: string;
  rowKey: (row: T) => string;
  footer?: React.ReactNode;
}

const PER_PAGE = 10;

// Dynamic property access helper — avoids sprinkling casts everywhere
const asRec = <T,>(r: T): Record<string, unknown> =>
  r as unknown as Record<string, unknown>;

export function DataTable<T>({
  data,
  columns,
  filterChips,
  filterKey,
  customFilterFn,
  csvFilename,
  xlsFilename,
  rowKey,
  footer,
}: Props<T>) {
  const [search, setSearch] = useState("");
  const [chip, setChip] = useState("all");
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let d = data;
    if (chip !== "all") {
      if (customFilterFn) {
        d = d.filter((r) => customFilterFn(r, chip));
      } else if (filterKey) {
        d = d.filter((r) => String(asRec(r)[filterKey]) === chip);
      }
    }
    if (search) {
      const q = search.toLowerCase();
      d = d.filter((r) =>
        Object.values(asRec(r)).some((v) => String(v).toLowerCase().includes(q)),
      );
    }
    if (sortKey) {
      d = [...d].sort((a, b) => {
        const av = String(asRec(a)[sortKey] ?? "");
        const bv = String(asRec(b)[sortKey] ?? "");
        return sortDir === "asc"
          ? av.localeCompare(bv)
          : bv.localeCompare(av);
      });
    }
    return d;
  }, [data, chip, search, sortKey, sortDir, filterKey, customFilterFn]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const toggleSort = (key: string) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(1);
  };

  const buildExportData = () => ({
    headers: columns.map((c) => c.label),
    rows: filtered.map((r) =>
      columns.map((c) => (c.csvValue ? c.csvValue(r) : String(asRec(r)[c.key] ?? ""))),
    ),
  });

  const handleCsv = () => {
    if (!csvFilename) return;
    const { headers, rows } = buildExportData();
    downloadCsv(csvFilename, headers, rows);
  };

  const handleXls = () => {
    if (!xlsFilename) return;
    const { headers, rows } = buildExportData();
    downloadXls(xlsFilename, headers, rows);
  };

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        {filterChips && (
          <div className="flex gap-1 flex-wrap">
            {filterChips.map((fc) => (
              <button
                key={fc.value}
                onClick={() => {
                  setChip(fc.value);
                  setPage(1);
                }}
                className={`px-3 py-1 text-xs rounded-full font-medium transition-colors ${
                  chip === fc.value
                    ? "bg-[var(--color-brand-600)] text-white"
                    : "bg-[var(--color-faint)] text-[var(--color-muted)] hover:bg-[var(--color-line-2)]"
                }`}
              >
                {fc.label}
              </button>
            ))}
          </div>
        )}
        <div className="relative ml-auto">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--color-muted)]" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Rechercher…"
            className="pl-8 pr-3 py-1.5 text-sm border border-[var(--color-line)] rounded-lg bg-[var(--color-surface)] text-[var(--color-ink)] placeholder:text-[var(--color-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-300)] w-52"
          />
        </div>
        {csvFilename && (
          <button
            onClick={handleCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[var(--color-muted)] border border-[var(--color-line)] rounded-lg hover:bg-[var(--color-faint)] transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Exporter
          </button>
        )}
        {xlsFilename && (
          <button
            onClick={handleXls}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 border border-emerald-200 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            Exporter XLS
          </button>
        )}
      </div>

      {/* Desktop table */}
      <div className="hidden sm:block overflow-x-auto rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--color-line)] bg-[var(--color-faint)]">
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => col.sortable && toggleSort(col.key)}
                  className={`px-4 py-3 text-left text-xs font-semibold text-[var(--color-muted)] whitespace-nowrap ${col.sortable ? "cursor-pointer select-none hover:text-[var(--color-ink)]" : ""}`}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.label}
                    {col.sortable && sortKey === col.key &&
                      (sortDir === "asc" ? (
                        <ChevronUp className="w-3 h-3" />
                      ) : (
                        <ChevronDown className="w-3 h-3" />
                      ))}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-line)]">
            {paginated.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="text-center py-10 text-sm text-[var(--color-muted)]"
                >
                  Aucun résultat
                </td>
              </tr>
            ) : (
              paginated.map((row) => (
                <tr
                  key={rowKey(row)}
                  className="hover:bg-[var(--color-faint)] transition-colors"
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className="px-4 py-3 text-[var(--color-ink)]"
                    >
                      {col.render
                        ? col.render(row)
                        : String(asRec(row)[col.key] ?? "")}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="sm:hidden space-y-2">
        {paginated.map((row) => (
          <div
            key={rowKey(row)}
            className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-line)] p-4 space-y-2"
          >
            {columns.map((col) => (
              <div
                key={col.key}
                className="flex items-start justify-between gap-2"
              >
                <span className="text-xs text-[var(--color-muted)] shrink-0 pt-0.5">
                  {col.label}
                </span>
                <span className="text-sm text-[var(--color-ink)] text-right">
                  {col.render ? col.render(row) : String(asRec(row)[col.key] ?? "")}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between min-h-[28px]">
        <span className="text-xs text-[var(--color-muted)]">
          {filtered.length} membre{filtered.length !== 1 ? "s" : ""} · page {page}/{totalPages}
        </span>
        {totalPages > 1 && (
          <div className="flex gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 rounded-lg border border-[var(--color-line)] text-xs text-[var(--color-ink)] disabled:opacity-40 hover:bg-[var(--color-faint)] transition-colors"
            >
              ‹
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`px-3 py-1 rounded-lg border text-xs transition-colors ${
                  p === page
                    ? "bg-[var(--color-brand-600)] border-[var(--color-brand-600)] text-white"
                    : "border-[var(--color-line)] text-[var(--color-ink)] hover:bg-[var(--color-faint)]"
                }`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1 rounded-lg border border-[var(--color-line)] text-xs text-[var(--color-ink)] disabled:opacity-40 hover:bg-[var(--color-faint)] transition-colors"
            >
              ›
            </button>
          </div>
        )}
      </div>

      {footer && <div>{footer}</div>}
    </div>
  );
}