// components/admin/ui/kpi-card.tsx
import * as LucideIcons from "lucide-react";
import { Sparkline } from "./sparkline";
import type { Kpi } from "@/lib/admin/mock-data";

function getIcon(name: string): LucideIcons.LucideIcon {
  const pascal = name
    .split("-")
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join("");
  return (
    (LucideIcons as unknown as Record<string, LucideIcons.LucideIcon>)[pascal] ??
    LucideIcons.HelpCircle
  );
}

export function KpiCard({ kpi }: { kpi: Kpi }) {
  const Icon = getIcon(kpi.icon);
  return (
    <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-line)] shadow-[var(--shadow-card)] overflow-hidden flex flex-col">
      <div className="p-4 flex flex-col gap-1.5 flex-1">
        <div className="flex items-start justify-between gap-2">
          <span className="text-xs text-[var(--color-muted)] font-medium leading-tight">
            {kpi.label}
          </span>
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: kpi.accentBg }}
          >
            <Icon className="w-[18px] h-[18px]" style={{ color: kpi.accent }} />
          </div>
        </div>
        <span className="text-2xl font-bold text-[var(--color-ink)] leading-tight">
          {kpi.value}
        </span>
        {kpi.delta && (
          <span
            className={`text-xs font-medium ${
              kpi.up ? "text-emerald-600" : "text-[var(--color-muted)]"
            }`}
          >
            {kpi.up ? "↑ " : ""}
            {kpi.delta}
          </span>
        )}
      </div>
      {kpi.spark && (
        <div className="mt-auto">
          <Sparkline data={kpi.spark} color={kpi.accent} />
        </div>
      )}
    </div>
  );
}
