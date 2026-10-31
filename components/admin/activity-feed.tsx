"use client";
// components/admin/activity-feed.tsx
import { useState } from "react";
import Link from "next/link";
import * as LucideIcons from "lucide-react";
import { Card, CardHeader } from "@/components/admin/ui/card";
import { Pagination } from "@/components/admin/ui/pagination";
import type { FeedItem } from "@/lib/admin/types";

const PER_PAGE = 6;

const ACT_BG: Record<string, string> = {
  green: "bg-emerald-50",
  amber: "bg-amber-50",
  red:   "bg-red-50",
};
const ACT_IC: Record<string, string> = {
  green: "text-emerald-600",
  amber: "text-amber-600",
  red:   "text-red-600",
};

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

export function ActivityFeed({ items }: { items: FeedItem[] }) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(items.length / PER_PAGE));
  // Le rafraichissement automatique peut raccourcir la liste sous la page
  // courante : on retombe alors sur la derniere page existante.
  const current = Math.min(page, totalPages);
  const visible = items.slice((current - 1) * PER_PAGE, current * PER_PAGE);

  return (
    <Card>
      <CardHeader
        title="Activité récente"
        action={
          <Link
            href="/adminjommba/membres"
            className="text-xs text-[var(--color-brand-600)] hover:underline font-medium"
          >
            Tout voir
          </Link>
        }
      />
      <div className="divide-y divide-[var(--color-line)]">
        {visible.length === 0 ? (
          <p className="px-5 py-8 text-sm text-[var(--color-muted)] text-center">
            Aucune activité récente
          </p>
        ) : (
          visible.map((item, i) => {
            const Icon = getIcon(item.icon);
            return (
              <div key={`${current}-${i}`} className="flex items-start gap-3 px-5 py-3">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${ACT_BG[item.tone]}`}
                >
                  <Icon className={`w-3.5 h-3.5 ${ACT_IC[item.tone]}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[var(--color-ink)] leading-snug">{item.text}</p>
                  <p className="text-xs text-[var(--color-muted)] mt-0.5">{item.when}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
      {items.length > 0 && (
        <div className="px-5 py-3 border-t border-[var(--color-line)]">
          <Pagination
            page={current}
            totalPages={totalPages}
            onChange={setPage}
            label={`${items.length} événement${items.length !== 1 ? "s" : ""} · page ${current}/${totalPages}`}
          />
        </div>
      )}
    </Card>
  );
}
