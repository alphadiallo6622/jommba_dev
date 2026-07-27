// lib/pricing.ts
// Calcul du prix des plans Premium à partir du prix mensuel configuré par l'admin
// (platform_settings.pricing.monthlyPrice). Source de vérité unique partagée par
// l'écran admin (aperçu), la page /dashboard/premium (affichage) et la route de
// paiement (montant réellement facturé) — jamais de prix dupliqué en dur ailleurs.

export type PlanId = "15j" | "1m" | "3m" | "6m";

/** Multiplicateurs fixes du prix mensuel, calibrés pour reproduire les tarifs
 *  actuels (15j=6, 1m=10, 3m=15, 6m=25) à monthlyPrice=10. */
export const PLAN_MULTIPLIERS: Record<PlanId, number> = {
  "15j": 0.6,
  "1m": 1,
  "3m": 1.5,
  "6m": 2.5,
};

/** Durée d'accès Premium réelle par plan, en jours. */
export const PLAN_DURATION_DAYS: Record<PlanId, number> = {
  "15j": 15,
  "1m": 30,
  "3m": 90,
  "6m": 180,
};

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Prix total (USD) de chaque plan, dérivé du prix mensuel courant. */
export function computePlanPrices(monthlyPrice: number): Record<PlanId, number> {
  return {
    "15j": round2(monthlyPrice * PLAN_MULTIPLIERS["15j"]),
    "1m": round2(monthlyPrice * PLAN_MULTIPLIERS["1m"]),
    "3m": round2(monthlyPrice * PLAN_MULTIPLIERS["3m"]),
    "6m": round2(monthlyPrice * PLAN_MULTIPLIERS["6m"]),
  };
}

/** Équivalent mensuel affiché sous chaque plan (ex. "5 $/mois" pour le 3m). */
export function computeMonthlyEquivalents(monthlyPrice: number): Record<PlanId, number> {
  const prices = computePlanPrices(monthlyPrice);
  const months: Record<PlanId, number> = { "15j": 0.5, "1m": 1, "3m": 3, "6m": 6 };
  return {
    "15j": round2(prices["15j"] / months["15j"]),
    "1m": round2(prices["1m"] / months["1m"]),
    "3m": round2(prices["3m"] / months["3m"]),
    "6m": round2(prices["6m"] / months["6m"]),
  };
}

/** Badge de réduction ("-33%") comparant le total du plan à `normalPrice`
 *  appliqué sur la même durée (mois × prix normal mensuel). */
export function computeDiscountLabels(monthlyPrice: number, normalPrice: number): Record<PlanId, string | null> {
  const prices = computePlanPrices(monthlyPrice);
  const months: Record<PlanId, number> = { "15j": 0.5, "1m": 1, "3m": 3, "6m": 6 };
  const out = {} as Record<PlanId, string | null>;
  (Object.keys(prices) as PlanId[]).forEach((id) => {
    const reference = normalPrice * months[id];
    if (reference <= 0) { out[id] = null; return; }
    const pct = Math.round((1 - prices[id] / reference) * 100);
    out[id] = pct > 0 ? `-${pct}%` : null;
  });
  return out;
}

export function isPlanId(id: string): id is PlanId {
  return id === "15j" || id === "1m" || id === "3m" || id === "6m";
}
