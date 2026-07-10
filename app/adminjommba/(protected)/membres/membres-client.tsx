"use client";
// app/adminjommba/(protected)/membres/membres-client.tsx
import { DataTable, type Column } from "@/components/admin/ui/data-table";
import { Badge, PremiumBadge } from "@/components/admin/ui/card";
import { Avatar } from "@/components/admin/ui/avatar";
import { MemberActionsButton } from "@/components/admin/ui/member-actions-button";
import type { MemberRow } from "@/lib/admin/types";
import { formatDate } from "@/lib/admin/format";

const STATUS_TONE: Record<string, "green" | "amber" | "red" | "gray"> = {
  validated: "green",
  pending:   "amber",
  refused:   "red",
  suspended: "gray",
};
const STATUS_LABEL: Record<string, string> = {
  validated: "Validé",
  pending:   "En attente",
  refused:   "Refusé",
  suspended: "Suspendu",
};

const GENDER_LABEL = (g: string | null) =>
  g === "femme" ? "Femme" : g === "homme" ? "Homme" : "—";

const amountLabel = (m: MemberRow) =>
  m.plan !== "premium"
    ? "—"
    : m.subscriptionAmount == null
      ? "Premium"
      : m.subscriptionAmount === 0
        ? "Offert"
        : `${m.subscriptionAmount} $`;

const COLUMNS: Column<MemberRow>[] = [
  {
    key: "name",
    label: "Membre",
    render: (m) => (
      <div className="flex items-center gap-2.5">
        {m.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={m.avatarUrl} alt={m.name} className="w-8 h-8 rounded-full object-cover shrink-0" />
        ) : (
          <Avatar name={m.name} size="sm" />
        )}
        <div>
          <p className="font-medium text-sm text-[var(--color-ink)]">
            {m.name}{m.age != null && `, ${m.age}`}
          </p>
          <p className="text-xs text-[var(--color-muted)]">{m.email}</p>
        </div>
      </div>
    ),
    sortable: true,
    csvValue: (m) => `${m.name}${m.age != null ? `, ${m.age}` : ""}`,
  },
  {
    key: "email",
    label: "Email",
    render: (m) => <span className="text-xs text-[var(--color-ink)]">{m.email}</span>,
    sortable: true,
    csvValue: (m) => m.email,
  },
  {
    key: "gender",
    label: "Sexe",
    render: (m) => <span className="text-xs">{GENDER_LABEL(m.gender)}</span>,
    sortable: true,
    csvValue: (m) => GENDER_LABEL(m.gender),
  },
  {
    key: "city",
    label: "Ville",
    render: (m) => <span className="text-xs">{m.city?.trim() || "—"}</span>,
    sortable: true,
    csvValue: (m) => m.city?.trim() || "—",
  },
  {
    key: "location",
    label: "Localisation",
    render: (m) => <span className="text-xs">{m.location}</span>,
    sortable: true,
    csvValue: (m) => m.location,
  },
  {
    key: "status",
    label: "Statut",
    render: (m) => (
      <Badge label={STATUS_LABEL[m.status]} tone={STATUS_TONE[m.status]} />
    ),
    sortable: true,
    csvValue: (m) => STATUS_LABEL[m.status],
  },
  {
    key: "plan",
    label: "Plan",
    render: (m) =>
      m.plan === "premium" ? <PremiumBadge /> : (
        <span className="text-xs text-[var(--color-muted)]">Free</span>
      ),
    sortable: true,
    csvValue: (m) => (m.plan === "premium" ? "Premium" : "Free"),
  },
  {
    key: "subscriptionAmount",
    label: "Montant",
    render: (m) => <span className="text-xs">{amountLabel(m)}</span>,
    sortable: true,
    csvValue: (m) => amountLabel(m),
  },
  {
    key: "joinedAt",
    label: "Inscription",
    render: (m) => formatDate(m.joinedAt),
    sortable: true,
    csvValue: (m) => formatDate(m.joinedAt),
  },
  {
    key: "id",
    label: "Actions",
    render: (m) => <MemberActionsButton member={m} />,
    csvValue: () => "",
  },
];

export function MembresClient({
  members,
  initialSearch,
}: {
  members: MemberRow[];
  initialSearch?: string;
}) {
  const pending = members.filter((m) => m.status === "pending").length;
  const premium = members.filter((m) => m.plan === "premium").length;

  const filterChips = [
    { label: `Tous ${members.length}`, value: "all" },
    { label: `En attente ${pending}`,  value: "pending" },
    { label: "Validés",                value: "validated" },
    { label: "Refusés",                value: "refused" },
    { label: "Suspendus",              value: "suspended" },
    { label: `Premium ${premium}`,     value: "premium_plan" },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-[var(--color-ink)]">Membres</h1>
        <p className="text-sm text-[var(--color-muted)] mt-0.5">
          {members.length} compte{members.length > 1 ? "s" : ""} au total
        </p>
      </div>
      <DataTable
        data={members}
        columns={COLUMNS}
        filterChips={filterChips}
        filterKey="status"
        customFilterFn={(m, chip) =>
          chip === "premium_plan" ? m.plan === "premium" : m.status === chip
        }
        xlsFilename="membres.xls"
        rowKey={(m) => m.id}
        initialSearch={initialSearch}
      />
    </div>
  );
}
