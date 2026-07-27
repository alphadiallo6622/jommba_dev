// lib/pricing.ts
// Prix des plans Premium. Source de vérité unique partagée par l'écran admin
// (aperçu), la page /dashboard/premium (affichage) et la route de paiement
// (montant réellement facturé) — jamais de prix dupliqué en dur ailleurs.
//
// Modèle : le prix payé pour chaque durée est fixé explicitement (PLAN_PRICES),
// afin de garantir des montants ronds. Le prix mensuel réglé en admin sert de
// tarif de référence : il fixe le prix barré de chaque durée (prix mensuel ×
// nombre de mois) et donc le pourcentage de remise affiché sur la carte, qui est
// déduit de l'écart entre ce tarif plein et le prix payé.

export type PlanId = "15j" | "1m" | "3m" | "6m";

/** Nombre de mois couverts par plan (base du tarif plein de référence). */
export const PLAN_MONTHS: Record<PlanId, number> = {
  "15j": 0.5,
  "1m": 1,
  "3m": 3,
  "6m": 6,
};

/** Prix payé (USD) pour chaque durée. Montants facturés tels quels. */
export const PLAN_PRICES: Record<PlanId, number> = {
  "15j": 10,
  "1m": 15,
  "3m": 30,
  "6m": 50,
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

/** Tarif plein de référence (prix barré) : prix mensuel × nombre de mois. */
export function computeFullPrices(monthlyPrice: number): Record<PlanId, number> {
  const out = {} as Record<PlanId, number>;
  for (const id of PLAN_IDS) out[id] = round2(monthlyPrice * PLAN_MONTHS[id]);
  return out;
}

/** Prix total (USD) réellement payé pour chaque plan. */
export function computePlanPrices(): Record<PlanId, number> {
  return { ...PLAN_PRICES };
}

/** Équivalent mensuel affiché sous chaque plan (ex. "5 $/mois" pour le 3m). */
export function computeMonthlyEquivalents(): Record<PlanId, number> {
  const out = {} as Record<PlanId, number>;
  for (const id of PLAN_IDS) out[id] = round2(PLAN_PRICES[id] / PLAN_MONTHS[id]);
  return out;
}

/** Badge de réduction affiché sur chaque carte (ex. "-40%"), déduit de l'écart
 *  entre le tarif plein de référence et le prix payé. Null si aucune remise. */
export function computeDiscountLabels(monthlyPrice: number): Record<PlanId, string | null> {
  const full = computeFullPrices(monthlyPrice);
  const out = {} as Record<PlanId, string | null>;
  for (const id of PLAN_IDS) {
    const reference = full[id];
    if (reference <= 0) { out[id] = null; continue; }
    const pct = Math.round((1 - PLAN_PRICES[id] / reference) * 100);
    out[id] = pct > 0 ? `-${pct}%` : null;
  }
  return out;
}

export function isPlanId(id: string): id is PlanId {
  return id === "15j" || id === "1m" || id === "3m" || id === "6m";
}
