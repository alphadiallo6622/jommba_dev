// Source de vérité des plans Premium côté paiement.
//
// Le prix est calculé dynamiquement depuis platform_settings.pricing.monthlyPrice
// (voir lib/pricing.ts) — Premium est facturé en paiement UNIQUE (Square Payments
// API, comme les boosts), pas en abonnement Square catalogué : un prix piloté par
// l'admin (et des codes promo) n'est pas compatible avec des variations de Catalog
// figées par variable d'environnement. Le renouvellement se fait par un nouveau
// paiement à l'échéance (voir app/api/cron/premium-expiry pour la coupure d'accès).

export type { PlanId } from '@/lib/pricing'
import { PLAN_DURATION_DAYS, isPlanId } from '@/lib/pricing'

export function getPlanDurationDays(id: string): number | undefined {
  return isPlanId(id) ? PLAN_DURATION_DAYS[id] : undefined
}

// Boosts (paiement unique). La durée est fixée ici ; le prix est réglable depuis
// la console admin (platform_settings.boost_pricing) et toujours résolu côté
// serveur — jamais depuis le client.
export type BoostId = '24h' | '3j' | '7j'

export type BoostConfig = {
  id: BoostId
  durationHours: number
  /** Libellé de durée affiché au membre. */
  durationLabel: string
}

export const BOOSTS: Record<BoostId, BoostConfig> = {
  '24h': { id: '24h', durationHours: 24,     durationLabel: '24h' },
  '3j':  { id: '3j',  durationHours: 24 * 3, durationLabel: '3 jours' },
  '7j':  { id: '7j',  durationHours: 24 * 7, durationLabel: '7 jours' },
}

export function getBoost(id: string): BoostConfig | undefined {
  return (BOOSTS as Record<string, BoostConfig>)[id]
}

export function isBoostId(id: string): id is BoostId {
  return id === '24h' || id === '3j' || id === '7j'
}
