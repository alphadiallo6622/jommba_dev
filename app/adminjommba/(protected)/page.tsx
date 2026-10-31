// app/adminjommba/(protected)/page.tsx
import type { Metadata } from "next";
import * as LucideIcons from "lucide-react";
import Link from "next/link";
import { KpiCard } from "@/components/admin/ui/kpi-card";
import { Card, CardHeader } from "@/components/admin/ui/card";
import { LineChart } from "@/components/admin/ui/line-chart";
import { DonutChart } from "@/components/admin/ui/donut-chart";
import { AutoRefresh } from "@/components/admin/auto-refresh";
import { getOverviewData } from "@/lib/admin/queries";

export const metadata: Metadata = { title: "Vue d'ensemble" };
export const dynamic = "force-dynamic";

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

const QUICK_ACTIONS = [
  { label: "Valider des profils",   href: "/adminjommba/validation",   icon: "shield-check" },
  { label: "Traiter signalements",  href: "/adminjommba/signalements",  icon: "flag"          },
  { label: "Envoyer une annonce",   href: "/adminjommba/notifications", icon: "send"          },
  { label: "Nouvel article",        href: "/adminjommba/blog",          icon: "plus-circle"   },
];

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

export default async function AdminOverviewPage() {
  const { kpis, chart, distribution, activity, pendingProfiles, gender, funnel, countries } =
    await getOverviewData();

  const genderSegments = [
    { label: "Hommes",         value: gender.hommes,       color: "#2563eb" },
    { label: "Femmes",         value: gender.femmes,       color: "#db2777" },
    { label: "Non renseigné",  value: gender.nonRenseigne, color: "#cbd5e1" },
  ];

  return (
    <div className="space-y-5">
      {/* Les KPI « en ligne maintenant » et la file de validation doivent
          coller au present : la page se recharge toute seule. */}
      <AutoRefresh seconds={30} />
      {/* ── Alert banner ── */}
      <div
        className="rounded-2xl px-6 py-5 flex items-center justify-between gap-4"
        style={{ background: "linear-gradient(135deg, #0a7a52 0%, #0d9e6a 60%, #10b981 100%)" }}
      >
        <div>
          <p className="text-emerald-100 text-sm mb-1">As-salamu alaykum, Admin</p>
          <h2 className="text-white text-2xl font-bold leading-tight">
            {pendingProfiles > 0
              ? `${pendingProfiles} profil${pendingProfiles > 1 ? "s" : ""} attend${pendingProfiles > 1 ? "ent" : ""} votre validation`
              : "Aucun profil en attente de validation"}
          </h2>
          <p className="text-emerald-200 text-sm mt-1">
            Délai cible de traitement&nbsp;: 12 à 24 heures par profil.
          </p>
        </div>
        <Link
          href="/adminjommba/validation"
          className="shrink-0 px-5 py-2.5 rounded-xl bg-white text-emerald-700 text-sm font-semibold hover:bg-emerald-50 transition-colors shadow-sm whitespace-nowrap"
        >
          Traiter la file →
        </Link>
      </div>

      {/* ── KPI cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {kpis.map((kpi) => (
          <KpiCard key={kpi.label} kpi={kpi} />
        ))}
      </div>

      {/* ── Charts row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Line chart */}
        <Card className="lg:col-span-3">
          <CardHeader
            title="Inscriptions & validations (30 j)"
            action={
              <span className="text-[11px] text-[var(--color-muted)] bg-[var(--color-faint)] px-2 py-0.5 rounded-full">
                temps réel
              </span>
            }
          />
          <div className="px-2 pt-3 pb-1">
            <LineChart data={chart} />
          </div>
          <div className="flex items-center gap-5 px-5 pb-4">
            <span className="flex items-center gap-1.5 text-xs text-[var(--color-muted)]">
              <span className="inline-block w-5 h-0.5 bg-[#10b981] rounded" />
              Inscriptions
            </span>
            <span className="flex items-center gap-1.5 text-xs text-[var(--color-muted)]">
              <span className="inline-block w-5 h-0.5 bg-[#111827] rounded" />
              Validations
            </span>
          </div>
        </Card>

        {/* Donut chart */}
        <Card className="lg:col-span-2">
          <CardHeader title="Répartition des membres" />
          <div className="p-5">
            <DonutChart segments={distribution} />
          </div>
        </Card>
      </div>

      {/* ── Genre & parcours d'inscription ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader title="Hommes / Femmes" />
          <div className="p-5">
            <DonutChart segments={genderSegments} />
            <div className="mt-4 pt-4 border-t border-[var(--color-line)] flex items-baseline justify-between">
              <span className="text-xs text-[var(--color-muted)]">
                Hommes pour une femme
              </span>
              <span className="text-lg font-bold text-[var(--color-ink)]">
                {gender.ratio}
              </span>
            </div>
          </div>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader
            title="Parcours d'inscription"
            action={
              <span className="text-[11px] text-[var(--color-muted)]">
                de la création du compte à Découvrir
              </span>
            }
          />
          <div className="p-5 space-y-3">
            {funnel.map((step) => (
              <div key={step.label}>
                <div className="flex items-baseline justify-between gap-3 mb-1">
                  <span className="text-sm font-medium text-[var(--color-ink)]">
                    {step.label}
                    <span className="ml-2 text-xs font-normal text-[var(--color-muted)]">
                      {step.hint}
                    </span>
                  </span>
                  <span className="text-sm font-bold text-[var(--color-ink)] shrink-0">
                    {step.value.toLocaleString("fr-FR")}
                    <span className="ml-1.5 text-xs font-medium text-[var(--color-muted)]">
                      {step.share} %
                    </span>
                  </span>
                </div>
                <div className="h-2 rounded-full bg-[var(--color-faint)] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[var(--color-brand-500)]"
                    style={{ width: `${step.share}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* ── Répartition par pays ── */}
      <Card>
        <CardHeader
          title="Inscrits par pays"
          action={
            <span className="text-[11px] text-[var(--color-muted)]">
              {countries.length} pays représentés
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
              {countries.map((row) => (
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
      </Card>

      {/* ── Bottom row ── */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Activity feed */}
        <Card>
          <CardHeader
            title="Activité récente"
            action={
              <Link href="/adminjommba/membres" className="text-xs text-[var(--color-brand-600)] hover:underline font-medium">
                Tout voir
              </Link>
            }
          />
          <div className="divide-y divide-[var(--color-line)]">
            {activity.length === 0 ? (
              <p className="px-5 py-8 text-sm text-[var(--color-muted)] text-center">
                Aucune activité récente
              </p>
            ) : (
              activity.map((item, i) => {
                const Icon = getIcon(item.icon);
                return (
                  <div key={i} className="flex items-start gap-3 px-5 py-3">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${ACT_BG[item.tone]}`}>
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
        </Card>

        {/* Quick actions */}
        <Card>
          <CardHeader title="Actions rapides" />
          <div className="p-4 grid grid-cols-2 gap-3">
            {QUICK_ACTIONS.map((action) => {
              const Icon = getIcon(action.icon);
              return (
                <Link
                  key={action.href}
                  href={action.href}
                  className="flex items-center gap-3 p-3.5 rounded-xl border border-[var(--color-line)] hover:bg-[var(--color-faint)] hover:border-[var(--color-brand-300)] transition-colors group"
                >
                  <div className="w-8 h-8 rounded-lg bg-[var(--color-brand-50)] flex items-center justify-center shrink-0 group-hover:bg-[var(--color-brand-100)] transition-colors">
                    <Icon className="w-4 h-4 text-[var(--color-brand-600)]" />
                  </div>
                  <span className="text-sm font-medium text-[var(--color-ink)] leading-tight">
                    {action.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}
