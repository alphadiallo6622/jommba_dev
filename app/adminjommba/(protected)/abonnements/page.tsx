"use client";
// app/admin/(protected)/abonnements/page.tsx
import { DataTable, type Column } from "@/components/admin/ui/data-table";
import { Avatar } from "@/components/admin/ui/avatar";
import { Crown, DollarSign, XCircle, RotateCcw } from "lucide-react";
import { SUBSCRIPTIONS, type Subscription } from "@/lib/admin/mock-data";
import { useToast } from "@/components/admin/ui/toast";

const STATUS_STYLE: Record<string, string> = {
  active:    "text-emerald-600",
  cancelled: "text-amber-600",
  expired:   "text-gray-400",
};
const STATUS_DOT: Record<string, string> = {
  active:    "bg-emerald-500",
  cancelled: "bg-amber-400",
  expired:   "bg-gray-300",
};
const STATUS_LABEL: Record<string, string> = {
  active:    "Actif",
  cancelled: "Résilié",
  expired:   "Expiré",
};

const FILTER_CHIPS = [
  { label: "Tous",     value: "all"       },
  { label: "Actifs",   value: "active"    },
  { label: "Résiliés", value: "cancelled" },
  { label: "Expirés",  value: "expired"   },
];

const KPIS = [
  { label: "Abonnés actifs",        value: "434",     icon: Crown,      color: "#e8920c", bg: "#fdf3e3" },
  { label: "Revenu du mois",        value: "4 340 $", icon: DollarSign, color: "#10b981", bg: "#ecfdf5" },
  { label: "Annulations (30 j)",    value: "18",      icon: XCircle,    color: "#df4548", bg: "#fceceb" },
  { label: "Remboursements (30 j)", value: "4",       icon: RotateCcw,  color: "#df4548", bg: "#fceceb" },
];

export default function AbonnementsPage() {
  const { show } = useToast();

  const COLUMNS: Column<Subscription>[] = [
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
    { key: "plan",    label: "Formule",  sortable: true },
    { key: "payment", label: "Paiement", sortable: true },
    {
      key: "status",
      label: "Statut",
      render: (s) => (
        <span className={`flex items-center gap-1.5 text-sm font-medium ${STATUS_STYLE[s.status]}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[s.status]}`} />
          {STATUS_LABEL[s.status]}
        </span>
      ),
      sortable: true,
      csvValue: (s) => STATUS_LABEL[s.status],
    },
    { key: "expires", label: "Échéance", sortable: false },
    {
      key: "id",
      label: "Actions",
      render: (s) => (
        <div className="flex items-center gap-3">
          {s.canRefund && (
            <button
              onClick={() => show(`Remboursement initié · ${s.name}`, "success")}
              className="text-xs font-medium text-[var(--color-brand-600)] hover:underline"
            >
              Rembourser
            </button>
          )}
          {s.status === "active" && (
            <button
              onClick={() => show(`Abonnement résilié · ${s.name}`, "error")}
              className="text-xs font-medium text-red-600 hover:underline"
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
          Historique, annulations et remboursements (fenêtre 7 jours).
        </p>
      </div>

      {/* Mini KPIs */}
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
        data={SUBSCRIPTIONS}
        columns={COLUMNS}
        filterChips={FILTER_CHIPS}
        filterKey="status"
        xlsFilename="abonnements.xls"
        rowKey={(s) => s.id}
      />
    </div>
  );
}
