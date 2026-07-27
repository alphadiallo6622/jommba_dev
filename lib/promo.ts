// lib/promo.ts
// Validation et consommation des codes promo Premium. Toujours revalidé côté
// serveur au moment du paiement (app/api/payments/subscribe) — jamais de
// confiance dans un prix réduit renvoyé par le client. Utilisé aussi par la
// route de prévisualisation (app/api/promo/validate) appelée pendant la saisie.
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/types'
import type { PlanId } from '@/lib/pricing'

type AdminClient = SupabaseClient<Database>

export type PromoValidationResult =
  | { valid: true; id: string; discountedPrice: number; basePrice: number }
  | { valid: false; error: string }

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

/** Vérifie qu'un code est utilisable pour ce plan et calcule le prix résultant.
 *  Ne modifie rien en base (peut être appelé librement pendant la saisie). */
export async function validatePromoCode(
  admin: AdminClient,
  rawCode: string,
  planId: PlanId,
  basePrice: number,
): Promise<PromoValidationResult> {
  const code = rawCode.trim().toUpperCase()
  if (!code) return { valid: false, error: 'Code promo manquant.' }

  const { data: promo } = await admin
    .from('promo_codes')
    .select('*')
    .ilike('code', code)
    .maybeSingle()

  if (!promo || !promo.active) {
    return { valid: false, error: 'Code promo invalide.' }
  }
  if (promo.expires_at && new Date(promo.expires_at).getTime() < Date.now()) {
    return { valid: false, error: 'Ce code promo a expiré.' }
  }
  if (promo.usage_limit !== null && promo.times_used >= promo.usage_limit) {
    return { valid: false, error: 'Ce code promo a atteint sa limite d\'utilisation.' }
  }
  if (promo.applicable_plans && promo.applicable_plans.length > 0 && !promo.applicable_plans.includes(planId)) {
    return { valid: false, error: 'Ce code promo ne s\'applique pas à ce plan.' }
  }

  const discounted =
    promo.discount_type === 'percent'
      ? basePrice * (1 - promo.value / 100)
      : basePrice - promo.value

  return {
    valid: true,
    id: promo.id,
    discountedPrice: Math.max(0, round2(discounted)),
    basePrice,
  }
}

/** Incrémente l'usage du code de façon atomique et conditionnelle, pour éviter
 *  qu'une redemption concurrente ne dépasse la limite (course entre deux paiements
 *  simultanés sur les derniers usages restants). */
export async function redeemPromoCode(admin: AdminClient, promoId: string): Promise<void> {
  const { data: promo } = await admin
    .from('promo_codes')
    .select('times_used, usage_limit')
    .eq('id', promoId)
    .maybeSingle()
  if (!promo) return

  let query = admin
    .from('promo_codes')
    .update({ times_used: promo.times_used + 1, updated_at: new Date().toISOString() })
    .eq('id', promoId)
    .eq('times_used', promo.times_used)

  if (promo.usage_limit !== null) {
    query = query.lt('times_used', promo.usage_limit)
  }

  const { error } = await query
  if (error) {
    console.error('[promo] incrément times_used échoué', promoId, error)
  }
}
