// app/adminjommba/(protected)/coach/page.tsx
import type { Metadata } from "next";
import { MessageCircle, Users2, Cpu, Star } from "lucide-react";
import { Card, CardHeader } from "@/components/admin/ui/card";
import { MiniBarChart } from "@/components/admin/ui/bar-chart";
import { getCoachStats } from "@/lib/admin/queries";

export const metadata: Metadata = { title: "Coach IA" };
export const dynamic = "force-dynamic";

export default async function CoachPage() {
  const stats = await getCoachStats();

  const KPIS = [
    { label: "Questions (mois)",    value: stats.questionsMonth.toLocaleString("fr-FR"), icon: MessageCircle, color: "#10b981", bg: "#ecfdf5" },
    { label: "Utilisateurs actifs", value: stats.activeUsers.toLocaleString("fr-FR"),    icon: Users2,        color: "#10b981", bg: "#ecfdf5" },
    { label: "Tokens / réponse",    value: stats.avgTokens != null ? `~${stats.avgTokens}` : "—", icon: Cpu, color: "#e8920c", bg: "#fdf3e3" },
    { label: "Satisfaction",        value: stats.satisfaction, icon: Star, color: "#10b981", bg: "#ecfdf5" },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-[var(--color-ink)]">Coach IA — Cheikh Abdallah</h1>
        <p className="text-sm text-[var(--color-muted)] mt-0.5">
          Supervision des conversations (Claude Sonnet 4.6, streaming).
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {KPIS.map((k) => {
          const Icon = k.icon;
          return (
            <div
              key={k.label}
              className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-line)] shadow-[var(--shadow-card)] p-4 flex items-center justify-between gap-3"
            >
              <div>
                <p className="text-xs text-[var(--color-muted)] font-medium">{k.label}</p>
                <p className="text-2xl font-bold text-[var(--color-ink)] mt-0.5">{k.value}</p>
              </div>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: k.bg }}>
                <Icon className="w-5 h-5" style={{ color: k.color }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Bar chart */}
      <Card>
        <CardHeader title="Questions au coach (14 j)" />
        <div className="px-5 pt-4 pb-5">
          {stats.daily.every((d) => d.count === 0) ? (
            <p className="text-sm text-[var(--color-muted)] text-center py-8">
              Aucune question sur les 14 derniers jours
            </p>
          ) : (
            <MiniBarChart data={stats.daily} />
          )}
        </div>
      </Card>
    </div>
  );
}
