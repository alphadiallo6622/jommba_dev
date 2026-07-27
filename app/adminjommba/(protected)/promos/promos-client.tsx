"use client";
// app/adminjommba/(protected)/promos/promos-client.tsx
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Tag, Plus, X, Trash2 } from "lucide-react";
import { Card, CardHeader } from "@/components/admin/ui/card";
import { useToast } from "@/components/admin/ui/toast";
import type { PromoCodeRow } from "@/lib/admin/types";
import { createPromoCode, togglePromoCodeActive, deletePromoCode } from "@/app/adminjommba/actions";

const PLAN_OPTIONS = [
  { id: "15j", label: "15 jours" },
  { id: "1m", label: "1 mois" },
  { id: "3m", label: "3 mois" },
  { id: "6m", label: "6 mois" },
] as const;

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="relative rounded-full transition-colors shrink-0"
      style={{ width: 40, height: 22, background: on ? "var(--color-brand-600)" : "var(--color-line-2)" }}
    >
      <span
        className="absolute top-0.5 w-[18px] h-[18px] rounded-full bg-white shadow transition-all"
        style={{ left: on ? "calc(100% - 20px)" : "2px" }}
      />
    </button>
  );
}

function formatDiscount(p: PromoCodeRow): string {
  return p.discountType === "percent" ? `-${p.value}%` : `-${p.value} $`;
}

function CreatePromoModal({
  busy,
  onCreate,
  onClose,
}: {
  busy: boolean;
  onCreate: (input: {
    code: string;
    discountType: "percent" | "fixed_amount";
    value: number;
    applicablePlans: string[] | null;
    expiresAt: string | null;
    usageLimit: number | null;
  }) => void;
  onClose: () => void;
}) {
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState<"percent" | "fixed_amount">("percent");
  const [value, setValue] = useState("10");
  const [plans, setPlans] = useState<Set<string>>(new Set());
  const [expiresAt, setExpiresAt] = useState("");
  const [usageLimit, setUsageLimit] = useState("");

  const togglePlan = (id: string) => {
    setPlans((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleSubmit = () => {
    const numValue = Number(value);
    if (!code.trim() || !(numValue > 0)) return;
    onCreate({
      code: code.trim(),
      discountType,
      value: numValue,
      applicablePlans: plans.size > 0 ? Array.from(plans) : null,
      expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
      usageLimit: usageLimit ? Number(usageLimit) : null,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative bg-white rounded-2xl w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-line)]">
          <h2 className="text-sm font-bold text-[var(--color-ink)]">Nouveau code promo</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-[var(--color-faint)] text-[var(--color-muted)] transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--color-ink)]">Code</label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="ex. RAMADAN25"
              className="w-full px-3.5 py-2.5 text-sm border border-[var(--color-line)] rounded-xl bg-[var(--color-faint)] text-[var(--color-ink)] uppercase placeholder:normal-case placeholder:text-[var(--color-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-300)] focus:bg-white transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--color-ink)]">Type de remise</label>
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value as "percent" | "fixed_amount")}
                className="w-full px-3 py-2.5 text-sm border border-[var(--color-line)] rounded-xl bg-[var(--color-faint)] text-[var(--color-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-300)] focus:bg-white transition"
              >
                <option value="percent">Pourcentage (%)</option>
                <option value="fixed_amount">Montant fixe ($)</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--color-ink)]">Valeur</label>
              <input
                type="number"
                min={0}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm border border-[var(--color-line)] rounded-xl bg-[var(--color-faint)] text-[var(--color-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-300)] focus:bg-white transition"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--color-ink)]">
              Plans concernés <span className="font-normal text-[var(--color-muted)]">(aucun = tous)</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {PLAN_OPTIONS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => togglePlan(p.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    plans.has(p.id)
                      ? "bg-[var(--color-brand-600)] text-white border-[var(--color-brand-600)]"
                      : "border-[var(--color-line)] text-[var(--color-ink)] hover:bg-[var(--color-faint)]"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--color-ink)]">
                Expiration <span className="font-normal text-[var(--color-muted)]">(optionnel)</span>
              </label>
              <input
                type="date"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-[var(--color-line)] rounded-xl bg-[var(--color-faint)] text-[var(--color-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-300)] focus:bg-white transition"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--color-ink)]">
                Limite d&apos;usage <span className="font-normal text-[var(--color-muted)]">(optionnel)</span>
              </label>
              <input
                type="number"
                min={1}
                value={usageLimit}
                onChange={(e) => setUsageLimit(e.target.value)}
                placeholder="illimité"
                className="w-full px-3.5 py-2.5 text-sm border border-[var(--color-line)] rounded-xl bg-[var(--color-faint)] text-[var(--color-ink)] placeholder:text-[var(--color-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-300)] focus:bg-white transition"
              />
            </div>
          </div>

          <button
            disabled={busy || !code.trim() || !(Number(value) > 0)}
            onClick={handleSubmit}
            className="w-full py-2.5 rounded-xl bg-[var(--color-brand-600)] text-white text-sm font-semibold hover:bg-[var(--color-brand-700)] transition-colors disabled:opacity-50"
          >
            {busy ? "Création…" : "Créer le code"}
          </button>
        </div>
      </div>
    </div>
  );
}

function DeletePromoModal({
  promo,
  busy,
  onConfirm,
  onClose,
}: {
  promo: PromoCodeRow;
  busy: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative bg-white rounded-2xl w-full max-w-sm shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-line)]">
          <h2 className="text-sm font-bold text-[var(--color-ink)]">Supprimer le code</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-[var(--color-faint)] text-[var(--color-muted)] transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-5 space-y-3">
          <p className="text-sm text-[var(--color-ink)]">
            Supprimer définitivement le code <strong className="font-mono">{promo.code}</strong> ?
          </p>
          <p className="text-xs text-[var(--color-muted)]">
            {promo.timesUsed > 0
              ? `Ce code a déjà été utilisé ${promo.timesUsed} fois — son historique d'utilisation sera perdu. Pour simplement empêcher de nouvelles utilisations, désactivez-le plutôt.`
              : "Pour le rendre inutilisable sans le supprimer, désactivez-le plutôt."}
          </p>
          <div className="flex gap-2 pt-1">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-[var(--color-line)] text-sm text-[var(--color-ink)] hover:bg-[var(--color-faint)] transition-colors"
            >
              Annuler
            </button>
            <button
              disabled={busy}
              onClick={onConfirm}
              className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {busy ? "…" : "Supprimer"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PromosClient({ promoCodes }: { promoCodes: PromoCodeRow[] }) {
  const { show } = useToast();
  const router = useRouter();
  const [busy, startTransition] = useTransition();
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<PromoCodeRow | null>(null);
  const [now] = useState(() => Date.now());

  const act = (
    fn: () => Promise<{ ok: boolean; error?: string }>,
    msg: string,
    type: "success" | "warning" | "error" = "success",
    onDone?: () => void,
  ) => {
    startTransition(async () => {
      const res = await fn();
      if (res.ok) {
        show(msg, type);
        onDone?.();
        router.refresh();
      } else {
        show(res.error ?? "Une erreur est survenue", "error");
      }
    });
  };

  const handleCreate = (input: Parameters<typeof createPromoCode>[0]) =>
    act(() => createPromoCode(input), `Code créé · ${input.code.toUpperCase()}`, "success", () => setCreating(false));

  const handleToggle = (p: PromoCodeRow) =>
    act(
      () => togglePromoCodeActive(p.id, !p.active),
      `${p.code} ${p.active ? "désactivé" : "activé"}`,
      p.active ? "warning" : "success",
    );

  const handleDelete = (p: PromoCodeRow) =>
    act(() => deletePromoCode(p.id), `Code supprimé · ${p.code}`, "error", () => setDeleting(null));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[var(--color-ink)]">Codes promo</h1>
          <p className="text-sm text-[var(--color-muted)] mt-0.5">
            Réductions applicables à l&apos;achat Premium (page /dashboard/premium).
          </p>
        </div>
        <button
          onClick={() => setCreating(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--color-brand-600)] text-white text-sm font-semibold hover:bg-[var(--color-brand-700)] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nouveau code
        </button>
      </div>

      <Card>
        <CardHeader title={`${promoCodes.length} code${promoCodes.length > 1 ? "s" : ""}`} />
        {promoCodes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-[var(--color-muted)]">
            <Tag className="w-10 h-10 mb-3 opacity-40" />
            <p className="text-sm">Aucun code promo pour le moment</p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--color-line)]">
            {promoCodes.map((p) => {
              const expired = p.expiresAt ? new Date(p.expiresAt).getTime() < now : false;
              const exhausted = p.usageLimit !== null && p.timesUsed >= p.usageLimit;
              return (
                <div key={p.id} className="flex items-center gap-3 px-5 py-4">
                  <div className="w-8 h-8 rounded-lg bg-[var(--color-faint)] flex items-center justify-center shrink-0">
                    <Tag className="w-4 h-4 text-[var(--color-muted)]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--color-ink)] font-mono">{p.code}</p>
                    <p className="text-xs text-[var(--color-muted)]">
                      {formatDiscount(p)}
                      {p.applicablePlans && p.applicablePlans.length > 0 && ` · ${p.applicablePlans.join(", ")}`}
                      {p.expiresAt && ` · expire le ${new Date(p.expiresAt).toLocaleDateString("fr-FR")}`}
                      {expired && " (expiré)"}
                      {exhausted && " (épuisé)"}
                    </p>
                  </div>
                  <span className="text-xs text-[var(--color-muted)] shrink-0">
                    {p.timesUsed}{p.usageLimit !== null ? ` / ${p.usageLimit}` : ""} utilisations
                  </span>
                  <Toggle on={p.active} onToggle={() => handleToggle(p)} />
                  <button
                    onClick={() => setDeleting(p)}
                    className="p-1.5 rounded-lg text-[var(--color-muted)] hover:bg-red-50 hover:text-red-600 transition-colors shrink-0"
                    aria-label={`Supprimer ${p.code}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {creating && (
        <CreatePromoModal busy={busy} onCreate={handleCreate} onClose={() => setCreating(false)} />
      )}

      {deleting && (
        <DeletePromoModal
          promo={deleting}
          busy={busy}
          onConfirm={() => handleDelete(deleting)}
          onClose={() => setDeleting(null)}
        />
      )}
    </div>
  );
}
