// components/admin/ui/hbar-chart.tsx
import type { CountryBar } from "@/lib/admin/mock-data";

const COLORS = ["#10b981", "#10b981", "#10b981", "#10b981", "#e8920c", "#e8920c"];

export function HBarChart({ data }: { data: CountryBar[] }) {
  const maxV = Math.max(...data.map((d) => d.count));

  return (
    <div className="space-y-3 w-full">
      {data.map((d, i) => (
        <div key={d.country} className="flex items-center gap-3">
          <span className="text-xs text-[var(--color-muted)] w-20 shrink-0 text-right truncate">
            {d.country}
          </span>
          <div className="flex-1 h-2.5 rounded-full bg-[var(--color-faint)] overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${(d.count / maxV) * 100}%`,
                background: COLORS[i] ?? "#10b981",
              }}
            />
          </div>
          <span className="text-xs text-[var(--color-muted)] tabular-nums w-10 shrink-0">
            {d.count.toLocaleString("fr-FR")}
          </span>
        </div>
      ))}
    </div>
  );
}
