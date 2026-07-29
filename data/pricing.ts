import { PLAN_PRICES, computeFullPrices } from "@/lib/pricing";

/** Photos autorisées sur un profil Free. Non réglable en admin — contrairement
 *  aux autres limites de la carte Gratuit, qui viennent de platform_settings. */
export const FREE_PHOTOS = 3;

/** Prix mensuel affiché sur l'accueil : le montant réellement facturé pour le
 *  plan "1 mois", pas un chiffre saisi à part. */
export const HOME_MONTHLY_PRICE = PLAN_PRICES["1m"];

/** Prix barré du plan mensuel, déduit du tarif de référence réglé en admin. */
export function homeOriginalPrice(referenceMonthlyPrice: number): number {
  return computeFullPrices(referenceMonthlyPrice)["1m"];
}

export interface PricingFeature {
  /** Index de la fonctionnalité, résolu via home.pricing.<plan>.features.<n> */
  key: string;
  included: boolean;
  /** Si vrai, affiche le tag "newTag" traduit (ex. "NOUVEAU"/"NEW") */
  tagged?: boolean;
}

export interface PricingPlan {
  /** Clé de traduction sous home.pricing.<planKey> */
  planKey: "free" | "premium";
  hasBadge: boolean;
  hasNote: boolean;
  features: PricingFeature[];
  popular: boolean;
  variant: "primary" | "secondary";
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    planKey: "free",
    hasBadge: false,
    hasNote: false,
    features: Array.from({ length: 9 }, (_, i) => ({ key: String(i + 1), included: true })).concat(
      Array.from({ length: 11 }, (_, i) => ({ key: String(i + 10), included: false })),
    ),
    popular: false,
    variant: "secondary",
  },
  {
    planKey: "premium",
    hasBadge: true,
    hasNote: true,
    features: Array.from({ length: 17 }, (_, i) => ({
      key: String(i + 1),
      included: true,
      tagged: i + 1 === 8, // "Messages vocaux 🎤" porte le tag NOUVEAU
    })),
    popular: true,
    variant: "primary",
  },
];
