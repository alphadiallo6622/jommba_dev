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
  price: string;
  originalPrice?: string;
  hasBadge: boolean;
  hasNote: boolean;
  features: PricingFeature[];
  popular: boolean;
  variant: "primary" | "secondary";
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    planKey: "free",
    price: "0",
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
    price: "10",
    originalPrice: "15",
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
