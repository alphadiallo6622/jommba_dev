// Aiguillage de l'activation Mobile Money selon le type d'achat (`kind`).
//
// Le webhook et le polling de statut sont génériques : ils ne savent pas si la
// transaction finance un Premium ou un Boost. Ce dispatcher lit `kind` sur la
// ligne de suivi et appelle la bonne activation (chacune reste idempotente et
// « réclame » la ligne de façon atomique).
import { createAdminClient } from '@/lib/supabase/admin'
import { activatePremiumFromMobileMoney } from '@/lib/sayele/activate'
import { activateBoostFromMobileMoney } from '@/lib/sayele/activate-boost'
import type { ActivationResult } from '@/lib/sayele/activate'

export async function activateMobileMoneyPayment(paymentId: string): Promise<ActivationResult> {
  const admin = createAdminClient()
  const { data } = await admin
    .from('mobile_money_payments')
    .select('kind')
    .eq('id', paymentId)
    .maybeSingle()

  if (data?.kind === 'boost') {
    return activateBoostFromMobileMoney(paymentId)
  }
  return activatePremiumFromMobileMoney(paymentId)
}
