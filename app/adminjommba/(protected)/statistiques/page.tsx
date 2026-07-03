// app/adminjommba/(protected)/statistiques/page.tsx
import type { Metadata } from "next";
import { KpiCard } from "@/components/admin/ui/kpi-card";
import { Card, CardHeader } from "@/components/admin/ui/card";
import { BarChart } from "@/components/admin/ui/bar-chart";
import { AreaChart } from "@/components/admin/ui/area-chart";
import { HBarChart } from "@/components/admin/ui/hbar-chart";
import { getStatsData } from "@/lib/admin/queries";

export const metadata: Metadata = { title: "Statistiques" };
export const dynamic = "force-dynamic";

export default async function StatistiquesPage() {
  const { kpis, conversion, messages, countries, revenue } = await getStatsData();

  return (
    <div className="space-y-5">
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <KpiCard key={kpi.label} kpi={kpi} />
        ))}
      </div>

      {/* Charts row 1 */}
      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader title="Conversion Premium par mois" />
          <div className="px-4 pt-3 pb-2">
            <BarChart
              data={conversion.map((d) => ({ label: d.month, value: d.count }))}
            />
          </div>
        </Card>

        <Card>
          <CardHeader title="Messages échangés / jour (30 j)" />
          <div className="px-4 pt-4 pb-3">
            <AreaChart
              data={messages.map((d) => ({ value: d.count }))}
              color="#059669"
            />
          </div>
        </Card>
      </div>

      {/* Charts row 2 */}
      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader title="Membres par pays" />
          <div className="px-6 py-5">
            {countries.length === 0 ? (
              <p className="text-sm text-[var(--color-muted)] text-center py-6">
                Aucune donnée
              </p>
            ) : (
              <HBarChart data={countries} />
            )}
          </div>
        </Card>

        <Card>
          <CardHeader title="Revenus mensuels (USD)" />
          <div className="px-4 pt-4 pb-3">
            <AreaChart
              data={revenue.map((d) => ({ label: d.month, value: d.amount }))}
              color="#10b981"
            />
          </div>
        </Card>
      </div>
    </div>
  );
}
