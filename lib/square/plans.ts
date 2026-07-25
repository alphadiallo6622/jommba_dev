// Source de vérité des plans Premium côté paiement.
// Aligné sur lib/mock-premium.ts (ids + prix affichés). Partagé entre la route
// d'abonnement et le script de création du Catalog Square.
//
// Square facture par cadence (DAILY, WEEKLY, MONTHLY, ANNUAL...). Le plan « 15 jours »
// n'a pas de cadence native : on le modélise par un abonnement DAILY dont la phase
// dure 15 jours n'existe pas non plus proprement — on le traite donc comme un
// abonnement MONTHLY facturé une fois (voir note ci-dessous) OU comme paiement unique.
// Pour rester simple et correct, tous les plans ci-dessous utilisent une cadence
// mensuelle et un nombre de périodes ; le 15j est le seul cas particulier.

export type PlanId = '15j' | '1m' | '3m' | '6m'

// Cadences Square les plus proches des périodes commerciales. Le client est
// re-prélevé à chaque échéance jusqu'à annulation (vrai abonnement récurrent).
export type Cadence = 'EVERY_TWO_WEEKS' | 'MONTHLY' | 'QUARTERLY' | 'EVERY_SIX_MONTHS'

export type SquarePlanConfig = {
  id: PlanId
  /** Prix facturé à CHAQUE échéance, en dollars. */
  totalPriceUsd: number
  /** Cadence de prélèvement Square. */
  cadence: Cadence
  /** Durée d'accès Premium par cycle, en mois (pour current_period_end). */
  durationMonths: number
  /** Nom du plan dans le Catalog Square. */
  name: string
  /** Variable d'environnement contenant l'ID de variation du plan Catalog. */
  envKey:
    | 'SQUARE_PLAN_15J'
    | 'SQUARE_PLAN_1M'
    | 'SQUARE_PLAN_3M'
    | 'SQUARE_PLAN_6M'
}

export const SQUARE_PLANS: Record<PlanId, SquarePlanConfig> = {
  '15j': { id: '15j', totalPriceUsd: 6,  cadence: 'EVERY_TWO_WEEKS',  durationMonths: 1, name: 'Premium 15 jours', envKey: 'SQUARE_PLAN_15J' },
  '1m':  { id: '1m',  totalPriceUsd: 10, cadence: 'MONTHLY',          durationMonths: 1, name: 'Premium 1 mois',   envKey: 'SQUARE_PLAN_1M'  },
  '3m':  { id: '3m',  totalPriceUsd: 15, cadence: 'QUARTERLY',        durationMonths: 3, name: 'Premium 3 mois',   envKey: 'SQUARE_PLAN_3M'  },
  '6m':  { id: '6m',  totalPriceUsd: 25, cadence: 'EVERY_SIX_MONTHS', durationMonths: 6, name: 'Premium 6 mois',   envKey: 'SQUARE_PLAN_6M'  },
}

export function getPlan(id: string): SquarePlanConfig | undefined {
  return (SQUARE_PLANS as Record<string, SquarePlanConfig>)[id]
}

// Boosts (paiement unique). Prix et durée fixés côté serveur — jamais depuis le client.
export type BoostId = '24h' | '3j' | '7j'

export type BoostConfig = {
  id: BoostId
  priceUsd: number
  durationHours: number
}

export const BOOSTS: Record<BoostId, BoostConfig> = {
  '24h': { id: '24h', priceUsd: 2.5, durationHours: 24 },
  '3j':  { id: '3j',  priceUsd: 5,   durationHours: 24 * 3 },
  '7j':  { id: '7j',  priceUsd: 8,   durationHours: 24 * 7 },
}

export function getBoost(id: string): BoostConfig | undefined {
  return (BOOSTS as Record<string, BoostConfig>)[id]
}
