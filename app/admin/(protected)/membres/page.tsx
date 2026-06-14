"use client";
// app/admin/(protected)/membres/page.tsx
import { DataTable, type Column } from "@/components/admin/ui/data-table";
import { Badge, PremiumBadge } from "@/components/admin/ui/card";
import { Avatar } from "@/components/admin/ui/avatar";
import { MemberActionsButton } from "@/components/admin/ui/member-actions-button";
import { MEMBERS, type Member } from "@/lib/admin/mock-data";
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

const COLUMNS: Column<Member>[] = [
  {
    key: "name",
    label: "Membre",
    render: (m) => (
      <div className="flex items-center gap-2.5">
        <Avatar name={m.name} size="sm" />
        <div>
          <p className="font-medium text-sm text-[var(--color-ink)]">
            {m.name}, {m.age}
          </p>
          <p className="text-xs text-[var(--color-muted)]">{m.email}</p>
        </div>
      </div>
    ),
    sortable: true,
    csvValue: (m) => `${m.name}, ${m.age}`,
  },
  {
    key: "location",
    label: "Localisation",
    sortable: true,
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

const pending = MEMBERS.filter((m) => m.status === "pending").length;
const premium = MEMBERS.filter((m) => m.plan === "premium").length;

const FILTER_CHIPS = [
  { label: `Tous ${MEMBERS.length}`, value: "all" },
  { label: `En attente ${pending}`,  value: "pending" },
  { label: "Validés",                value: "validated" },
  { label: "Refusés",                value: "refused" },
  { label: "Suspendus",              value: "suspended" },
  { label: `Premium ${premium}`,     value: "premium_plan" },
];

export default function MembresPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-[var(--color-ink)]">Membres</h1>
        <p className="text-sm text-[var(--color-muted)] mt-0.5">
          {MEMBERS.length} comptes au total
        </p>
      </div>
      <DataTable
        data={MEMBERS}
        columns={COLUMNS}
        filterChips={FILTER_CHIPS}
        filterKey="status"
        customFilterFn={(m, chip) =>
          chip === "premium_plan" ? m.plan === "premium" : m.status === chip
        }
        xlsFilename="membres.xls"
        rowKey={(m) => m.id}
      />
    </div>
  );
}
