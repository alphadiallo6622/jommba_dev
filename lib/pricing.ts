// lib/pricing.ts
// Prix des plans Premium. Source de vérité unique partagée par l'écran admin
// (aperçu), la page /dashboard/premium (affichage) et la route de paiement
// (montant réellement facturé) — jamais de prix dupliqué en dur ailleurs.
//
// Modèle : le tarif de référence réglé en admin (platform_settings.pricing
// .monthlyPrice) est le prix payé pour un mois. Les autres durées en découlent
// via un multiplicateur fixe (PLAN_MULTIPLIERS), qui porte la remise
// d'engagement. Le prix barré de chaque carte reste le tarif plein de référence
// (tarif mensuel × nombre de mois), et le pourcentage de remise affiché est
// déduit de l'écart entre ce tarif plein et le prix payé.

export type PlanId = "15j" | "1m" | "3m" | "6m";

export const PLAN_IDS: PlanId[] = ["15j", "1m", "3m", "6m"];

/** Nombre de mois couverts par plan (base du tarif plein de référence). */
export const PLAN_MONTHS: Record<PlanId, number> = {
  "15j": 0.5,
  "1m": 1,
  "3m": 3,
  "6m": 6,
};

/** Prix payé, exprimé en multiples du tarif de référence mensuel. Les valeurs
 *  reproduisent la grille historique (10 / 15 / 30 / 50 $) pour un tarif de
 *  référence à 15 $ : le 15 jours est volontairement majoré (deux tiers d'un
 *  mois pour une demi-durée), le 3 et le 6 mois sont dégressifs. */
export const PLAN_MULTIPLIERS: Record<PlanId, number> = {
  "15j": 2 / 3,
  "1m": 1,
  "3m": 2,
  "6m": 10 / 3,
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

/** Tarif de référence utilisable : une valeur absente ou invalide ne doit
 *  jamais produire un prix à 0 $ côté paiement. */
function safeMonthlyPrice(monthlyPrice: number): number {
  return Number.isFinite(monthlyPrice) && monthlyPrice > 0 ? monthlyPrice : 0;
}

/** Tarif plein de référence (prix barré) : tarif mensuel × nombre de mois. */
export function computeFullPrices(monthlyPrice: number): Record<PlanId, number> {
  const reference = safeMonthlyPrice(monthlyPrice);
  const out = {} as Record<PlanId, number>;
  for (const id of PLAN_IDS) out[id] = round2(reference * PLAN_MONTHS[id]);
  return out;
}

/** Prix total (USD) réellement payé pour chaque plan, arrondi au dollar pour
 *  garder des montants ronds quel que soit le tarif de référence. */
export function computePlanPrices(monthlyPrice: number): Record<PlanId, number> {
  const reference = safeMonthlyPrice(monthlyPrice);
  const out = {} as Record<PlanId, number>;
  for (const id of PLAN_IDS) {
    out[id] = Math.max(1, Math.round(reference * PLAN_MULTIPLIERS[id]));
  }
  return out;
}

/** Équivalent mensuel affiché sous chaque plan (ex. "10 $/mois" pour le 3m). */
export function computeMonthlyEquivalents(monthlyPrice: number): Record<PlanId, number> {
  const prices = computePlanPrices(monthlyPrice);
  const out = {} as Record<PlanId, number>;
  for (const id of PLAN_IDS) out[id] = round2(prices[id] / PLAN_MONTHS[id]);
  return out;
}

/** Badge de réduction affiché sur chaque carte (ex. "-40%"), déduit de l'écart
 *  entre le tarif plein de référence et le prix payé. Null si aucune remise. */
export function computeDiscountLabels(monthlyPrice: number): Record<PlanId, string | null> {
  const full = computeFullPrices(monthlyPrice);
  const prices = computePlanPrices(monthlyPrice);
  const out = {} as Record<PlanId, string | null>;
  for (const id of PLAN_IDS) {
    const reference = full[id];
    if (reference <= 0) { out[id] = null; continue; }
    const pct = Math.round((1 - prices[id] / reference) * 100);
    out[id] = pct > 0 ? `-${pct}%` : null;
  }
  return out;
}

export function isPlanId(id: string): id is PlanId {
  return id === "15j" || id === "1m" || id === "3m" || id === "6m";
}
