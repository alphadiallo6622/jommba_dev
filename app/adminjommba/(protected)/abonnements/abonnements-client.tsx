"use client";
// app/adminjommba/(protected)/abonnements/abonnements-client.tsx
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { DataTable, type Column } from "@/components/admin/ui/data-table";
import { Avatar } from "@/components/admin/ui/avatar";
import { Crown, DollarSign, XCircle, RotateCcw, Wallet, CalendarDays, Ban, Clock } from "lucide-react";
import type { SubscriptionRow } from "@/lib/admin/types";
import { cancelSubscription, refundSubscription } from "@/app/adminjommba/actions";
import { useToast } from "@/components/admin/ui/toast";

type Confirm = {
  kind: "refund" | "cancel";
  sub: SubscriptionRow;
};

const STATUS_STYLE: Record<string, string> = {
  active:    "text-emerald-600",
  cancelled: "text-amber-600",
  expired:   "text-gray-400",
  refunded:  "text-red-600",
};
const STATUS_DOT: Record<string, string> = {
  active:    "bg-emerald-500",
  cancelled: "bg-amber-400",
  expired:   "bg-gray-300",
  refunded:  "bg-red-500",
};
const STATUS_LABEL: Record<string, string> = {
  active:    "Actif",
  cancelled: "Résilié",
  expired:   "Expiré",
  refunded:  "Remboursé",
};

/** Un abonnement remboursé (statut "cancelled" + refunded_at) est affiché « Remboursé ». */
const displayStatus = (s: SubscriptionRow): string => (s.refunded ? "refunded" : s.status);

const FILTER_CHIPS = [
  { label: "Tous",       value: "all"       },
  { label: "Actifs",     value: "active"    },
  { label: "Résiliés",   value: "cancelled" },
  { label: "Remboursés", value: "refunded"  },
  { label: "Expirés",    value: "expired"   },
];

// Un abonnement remboursé porte le statut "cancelled" : on le range dans
// « Remboursés » et on l'exclut de « Résiliés » pour éviter le double comptage.
function matchesChip(s: SubscriptionRow, chip: string): boolean {
  if (chip === "refunded")  return s.refunded === true;
  if (chip === "cancelled") return s.status === "cancelled" && !s.refunded;
  return s.status === chip;
}

export function AbonnementsClient({
  rows,
  kpis,
}: {
  rows: SubscriptionRow[];
  kpis: {
    activeCount: number;
    monthRevenue: number;
    totalRevenue: number;
    yearRevenue: number;
    cancellations30d: number;
    refunds30d: number;
    totalCancellations: number;
    totalExpired: number;
    totalRefunds: number;
  };
}) {
  const { show } = useToast();
  const router = useRouter();
  const [busy, startTransition] = useTransition();
  const [confirm, setConfirm] = useState<Confirm | null>(null);

  const usd = (n: number) => `${n.toLocaleString("fr-FR")} $`;

  const KPIS = [
    { label: "Abonnés actifs",        value: String(kpis.activeCount),      icon: Crown,        color: "#e8920c", bg: "#fdf3e3" },
    { label: "Revenu du mois",        value: usd(kpis.monthRevenue),        icon: DollarSign,   color: "#10b981", bg: "#ecfdf5" },
    { label: "Revenu de l'année",     value: usd(kpis.yearRevenue),         icon: CalendarDays, color: "#10b981", bg: "#ecfdf5" },
    { label: "Revenu total",          value: usd(kpis.totalRevenue),        icon: Wallet,       color: "#0a7a52", bg: "#ecfdf5" },
    { label: "Résiliations (total)",  value: String(kpis.totalCancellations), icon: Ban,        color: "#df4548", bg: "#fceceb" },
    { label: "Expirés (total)",       value: String(kpis.totalExpired),     icon: Clock,        color: "#6b7280", bg: "#f3f4f6" },
    { label: "Remboursements (total)", value: String(kpis.totalRefunds),    icon: RotateCcw,    color: "#df4548", bg: "#fceceb" },
    { label: "Résiliations (30 j)",   value: String(kpis.cancellations30d), icon: XCircle,      color: "#df4548", bg: "#fceceb" },
  ];

  const runConfirmed = () => {
    if (!confirm) return;
    const { kind, sub } = confirm;
    const fn = kind === "refund" ? refundSubscription : cancelSubscription;
    startTransition(async () => {
      const res = await fn(sub.id);
      if (res.ok) {
        show(
          kind === "refund" ? `Remboursement effectué · ${sub.name}` : `Abonnement résilié · ${sub.name}`,
          kind === "refund" ? "success" : "error",
        );
        setConfirm(null);
        router.refresh();
      } else {
        show(res.error ?? "Une erreur est survenue", "error");
      }
    });
  };

  const refundAmount = (s: SubscriptionRow) =>
    s.amount != null && s.amount > 0 ? Math.round(s.amount * 0.7 * 100) / 100 : 0;

  const COLUMNS: Column<SubscriptionRow>[] = [
    {
      key: "name",
      label: "Abonné",
      render: (s) => (
        <div className="flex items-center gap-2.5">
          <Avatar name={s.name} size="sm" />
          <span className="text-sm font-medium text-[var(--color-ink)]">{s.name}</span>
        </div>
      ),
      sortable: true,
      csvValue: (s) => s.name,
    },
    {
      key: "email",
      label: "Email",
      render: (s) => (
        <span className="text-sm text-[var(--color-muted)]">{s.email}</span>
      ),
      sortable: true,
    },
    {
      key: "gender",
      label: "Sexe",
      render: (s) => (
        <span className="text-sm">{s.gender === "femme" ? "Femme" : s.gender === "homme" ? "Homme" : "—"}</span>
      ),
      sortable: true,
      csvValue: (s) => (s.gender === "femme" ? "Femme" : s.gender === "homme" ? "Homme" : "—"),
    },
    {
      key: "city",
      label: "Ville",
      render: (s) => <span className="text-sm">{s.city?.trim() || "—"}</span>,
      sortable: true,
      csvValue: (s) => s.city?.trim() || "—",
    },
    {
      key: "location",
      label: "Localisation",
      render: (s) => <span className="text-sm">{s.location}</span>,
      sortable: true,
      csvValue: (s) => s.location,
    },
    { key: "plan",    label: "Formule",  sortable: true },
    { key: "payment", label: "Paiement", sortable: true },
    {
      key: "amount",
      label: "Montant",
      render: (s) => (
        <span className="text-sm font-medium">
          {s.amount == null ? "—" : s.amount === 0 ? "Offert" : `${s.amount} $`}
        </span>
      ),
      sortable: true,
      csvValue: (s) => (s.amount == null ? "—" : s.amount === 0 ? "Offert" : `${s.amount} $`),
    },
    {
      key: "status",
      label: "Statut",
      render: (s) => {
        const st = displayStatus(s);
        return (
          <span className={`flex items-center gap-1.5 text-sm font-medium ${STATUS_STYLE[st]}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[st]}`} />
            {STATUS_LABEL[st]}
          </span>
        );
      },
      sortable: true,
      csvValue: (s) => STATUS_LABEL[displayStatus(s)],
    },
    { key: "subscribedAt", label: "Date d'abonnement", sortable: true },
    { key: "expires",      label: "Échéance",          sortable: false },
    {
      key: "id",
      label: "Actions",
      render: (s) => (
        <div className="flex items-center gap-3">
          {s.canRefund && (
            <button
              disabled={busy}
              onClick={() => setConfirm({ kind: "refund", sub: s })}
              className="text-xs font-medium text-[var(--color-brand-600)] hover:underline disabled:opacity-50"
            >
              Rembourser
            </button>
          )}
          {s.status === "active" && (
            <button
              disabled={busy}
              onClick={() => setConfirm({ kind: "cancel", sub: s })}
              className="text-xs font-medium text-red-600 hover:underline disabled:opacity-50"
            >
              Résilier
            </button>
          )}
        </div>
      ),
      csvValue: () => "",
    },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-[var(--color-ink)]">Abonnements Premium</h1>
        <p className="text-sm text-[var(--color-muted)] mt-0.5">
          Historique des abonnements, résiliations et remboursements.
        </p>
      </div>

      {/* Mini KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
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
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: k.bg }}
              >
                <Icon className="w-5 h-5" style={{ color: k.color }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Table */}
      <DataTable
        data={rows}
        columns={COLUMNS}
        filterChips={FILTER_CHIPS}
        customFilterFn={matchesChip}
        xlsFilename="abonnements.xls"
        rowKey={(s) => s.id}
      />

      {/* Popup de confirmation (remboursement / résiliation) */}
      {confirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" onClick={() => !busy && setConfirm(null)} />
          <div className="relative bg-white rounded-2xl w-full max-w-sm shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="px-5 pt-4 pb-3 border-b border-[var(--color-line)]">
              <h3 className="font-semibold text-base text-[var(--color-ink)]">
                {confirm.kind === "refund" ? "Rembourser l'abonnement" : "Résilier l'abonnement"}
              </h3>
            </div>

            <div className="p-5 space-y-3">
              {confirm.kind === "refund" ? (
                <>
                  <p className="text-sm text-[var(--color-ink)]">
                    Rembourser <strong>{confirm.sub.name}</strong> ?
                  </p>
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-xs text-emerald-900">
                    Montant payé : <strong>{confirm.sub.amount != null ? usd(confirm.sub.amount) : "—"}</strong><br />
                    Remboursé au client (70 %) : <strong>{usd(refundAmount(confirm.sub))}</strong><br />
                    Frais de service conservés (30 %) : <strong>
                      {usd(Math.round(((confirm.sub.amount ?? 0) - refundAmount(confirm.sub)) * 100) / 100)}
                    </strong>
                  </div>
                  <p className="text-xs text-[var(--color-muted)]">
                    Le membre est remboursé, perd son accès Premium, et reçoit un email + une notification.
                    L&apos;administration est notifiée sur contact@jommba.com.
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm text-[var(--color-ink)]">
                    Résilier l&apos;abonnement de <strong>{confirm.sub.name}</strong> ?
                  </p>
                  <p className="text-xs text-[var(--color-muted)]">
                    L&apos;accès Premium est coupé immédiatement. <strong>Une résiliation ne donne droit à aucun
                    remboursement.</strong>
                  </p>
                </>
              )}

              <div className="flex gap-2 pt-1">
                <button
                  disabled={busy}
                  onClick={() => setConfirm(null)}
                  className="flex-1 py-2 rounded-xl border border-[var(--color-line)] text-sm text-[var(--color-ink)] hover:bg-[var(--color-faint)] transition-colors disabled:opacity-50"
                >
                  Annuler
                </button>
                <button
                  disabled={busy}
                  onClick={runConfirmed}
                  className={`flex-1 py-2 rounded-xl text-white text-sm font-semibold transition-colors disabled:opacity-50 ${
                    confirm.kind === "refund"
                      ? "bg-[var(--color-brand-600)] hover:bg-[var(--color-brand-700)]"
                      : "bg-red-600 hover:bg-red-700"
                  }`}
                >
                  {busy
                    ? "Traitement…"
                    : confirm.kind === "refund"
                      ? "Confirmer le remboursement"
                      : "Confirmer la résiliation"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
