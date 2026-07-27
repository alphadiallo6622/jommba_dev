// lib/pricing.ts
// Calcul du prix des plans Premium à partir du prix mensuel configuré par l'admin
// (platform_settings.pricing.monthlyPrice). Source de vérité unique partagée par
// l'écran admin (aperçu), la page /dashboard/premium (affichage) et la route de
// paiement (montant réellement facturé) — jamais de prix dupliqué en dur ailleurs.
//
// Modèle : chaque plan a une durée et une remise fixe d'engagement. Le prix payé
// est le tarif plein de la durée (prix mensuel × nombre de mois) diminué de cette
// remise. Le pourcentage affiché sur la carte est donc exactement PLAN_DISCOUNTS.

export type PlanId = "15j" | "1m" | "3m" | "6m";

/** Nombre de mois facturés par plan (base du tarif plein). */
export const PLAN_MONTHS: Record<PlanId, number> = {
  "15j": 0.5,
  "1m": 1,
  "3m": 3,
  "6m": 6,
};

/** Remise d'engagement par plan, en pourcentage du tarif plein de la durée. */
export const PLAN_DISCOUNTS: Record<PlanId, number> = {
  "15j": 20,
  "1m": 40,
  "3m": 33,
  "6m": 49,
};

/** Durée d'accès Premium réelle par plan, en jours. */
export const PLAN_DURATION_DAYS: Record<PlanId, number> = {
  "15j": 15,
  "1m": 30,
  "3m": 90,
  "6m": 180,
};

const PLAN_IDS: PlanId[] = ["15j", "1m", "3m", "6m"];

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Tarif plein (sans remise) de chaque plan : prix mensuel × nombre de mois. */
export function computeFullPrices(monthlyPrice: number): Record<PlanId, number> {
  const out = {} as Record<PlanId, number>;
  for (const id of PLAN_IDS) out[id] = round2(monthlyPrice * PLAN_MONTHS[id]);
  return out;
}

/** Prix total (USD) réellement payé pour chaque plan, remise appliquée. */
export function computePlanPrices(monthlyPrice: number): Record<PlanId, number> {
  const out = {} as Record<PlanId, number>;
  for (const id of PLAN_IDS) {
    out[id] = round2(monthlyPrice * PLAN_MONTHS[id] * (1 - PLAN_DISCOUNTS[id] / 100));
  }
  return out;
}

/** Équivalent mensuel affiché sous chaque plan (ex. "5 $/mois" pour le 3m). */
export function computeMonthlyEquivalents(monthlyPrice: number): Record<PlanId, number> {
  const prices = computePlanPrices(monthlyPrice);
  const out = {} as Record<PlanId, number>;
  for (const id of PLAN_IDS) out[id] = round2(prices[id] / PLAN_MONTHS[id]);
  return out;
}

/** Badge de réduction affiché sur chaque carte (ex. "-40%"). */
export function computeDiscountLabels(): Record<PlanId, string | null> {
  const out = {} as Record<PlanId, string | null>;
  for (const id of PLAN_IDS) {
    out[id] = PLAN_DISCOUNTS[id] > 0 ? `-${PLAN_DISCOUNTS[id]}%` : null;
  }
  return out;
}

export function isPlanId(id: string): id is PlanId {
  return id === "15j" || id === "1m" || id === "3m" || id === "6m";
}
