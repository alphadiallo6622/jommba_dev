// Activation Premium après un paiement Mobile Money confirmé (settled).
//
// Reproduit À L'IDENTIQUE le mécanisme déclenché par Square
// (app/api/payments/subscribe) : même ligne `subscriptions` (plan premium,
// status active, price_usd, duration_months, current_period_end), même bascule
// `profiles.is_premium`, mêmes e-mails et notification — pour qu'un abonnement
// soit traité de la même façon quelle que soit la source du paiement. Le code
// Square n'est pas modifié ni importé ; on réplique son comportement.
//
// IDEMPOTENT : le webhook `transaction.settled` et le polling de statut peuvent
// arriver en concurrence. On « réclame » la ligne de façon atomique avant toute
// écriture : une seule exécution crée l'abonnement.
import { createAdminClient } from '@/lib/supabase/admin'
import { getPlanDurationDays } from '@/lib/square/plans'
import { redeemPromoCode } from '@/lib/promo'
import { sendPaymentEmails } from '@/lib/payment-emails'
import { createNotification } from '@/lib/push/notify'
import type { MobileMoneyPayment } from '@/lib/supabase/types'

export interface ActivationResult {
  activated: boolean
  alreadyDone: boolean
  expiresAt?: string
}

/**
 * Active Premium à partir d'une transaction Mobile Money settled.
 * @param paymentId  id de la ligne mobile_money_payments
 */
export async function activatePremiumFromMobileMoney(paymentId: string): Promise<ActivationResult> {
  const admin = createAdminClient()

  // 1) Réclamation atomique : on ne passe à 'settled' que depuis un état non
  //    terminal. Si aucune ligne n'est renvoyée, l'activation a déjà eu lieu
  //    (ou la transaction a échoué) → on ne refait rien.
  const { data: claimed } = await admin
    .from('mobile_money_payments')
    .update({ status: 'settled', settled_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq('id', paymentId)
    .in('status', ['pending', 'processing'])
    .select('*')
    .maybeSingle()

  if (!claimed) {
    return { activated: false, alreadyDone: true }
  }

  const payment = claimed as MobileMoneyPayment
  const durationDays = getPlanDurationDays(payment.plan_id)
  if (!durationDays) {
    console.error('[sayele/activate] plan inconnu', payment.id, payment.plan_id)
    return { activated: false, alreadyDone: false }
  }

  const periodEnd = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000)
  const now = new Date().toISOString()
  const amountUsd = Number(payment.amount_usd)

  // 2) Enregistre l'abonnement — forme identique à la route Square (historique
  //    multi-lignes : chaque achat est une nouvelle ligne).
  const { data: sub, error: subErr } = await admin
    .from('subscriptions')
    .insert({
      user_id: payment.user_id,
      plan: 'premium',
      status: 'active',
      payment_method: 'mobile_money',
      price_usd: amountUsd,
      // Devise de règlement réelle : GNF. On conserve price_usd (équivalent USD)
      // pour les métriques normalisées, et on stocke le montant GNF réellement
      // payé pour l'affichage/agrégation par devise côté admin.
      currency: payment.currency,
      amount_native: payment.amount_minor,
      // Durée en mois (0,5 pour le plan 15 jours) — colonne numeric. La durée
      // d'accès réelle reste portée par current_period_end (calculée depuis
      // durationDays), pas par ce libellé.
      duration_months: Math.round((durationDays / 30) * 100) / 100,
      current_period_end: periodEnd.toISOString(),
      square_subscription_id: null,
      square_customer_id: null,
      square_card_id: null,
      updated_at: now,
    })
    .select('id')
    .single()

  if (subErr || !sub) {
    // Le paiement est confirmé mais l'insert a échoué : à surveiller
    // (remboursement manuel possible), comme côté Square.
    console.error('[sayele/activate] insert subscription échoué après settled', payment.id, subErr)
    return { activated: false, alreadyDone: false }
  }

  // Marque le profil Premium (source lue par l'app pour débloquer les fonctions).
  await admin.from('profiles').update({ is_premium: true }).eq('user_id', payment.user_id)

  // Lie l'abonnement à la transaction (traçabilité).
  await admin
    .from('mobile_money_payments')
    .update({ subscription_id: sub.id, updated_at: now })
    .eq('id', payment.id)

  // 3) Consomme le code promo éventuel (incrément atomique protégé).
  if (payment.promo_id) {
    await redeemPromoCode(admin, payment.promo_id)
  }

  // 4) Profil (nom) pour les e-mails + notifications.
  const { data: profile } = await admin
    .from('profiles')
    .select('first_name, last_name')
    .eq('user_id', payment.user_id)
    .maybeSingle()

  const { data: userRes } = await admin.auth.admin.getUserById(payment.user_id)
  const email = userRes?.user?.email ?? null

  // 5) E-mails : confirmation au membre + notification administration.
  await sendPaymentEmails({
    kind: 'premium',
    itemId: payment.plan_id,
    amountUsd,
    locale: payment.locale ?? undefined,
    memberEmail: email,
    firstName: profile?.first_name,
    lastName: profile?.last_name,
    paymentId: payment.provider_tx_id,
    expiresAt: periodEnd,
    promoCode: payment.promo_code ?? null,
    provider: 'mobile_money',
  })

  // 6) Notification + push « Premium activé ».
  await createNotification({
    userId: payment.user_id,
    type: 'premium',
    title: 'Premium activé 👑',
    body: 'Ton paiement est confirmé : ton accès Premium est actif. Profite de toutes les fonctionnalités !',
    i18n: 'premiumConfirmed',
  })

  return { activated: true, alreadyDone: false, expiresAt: periodEnd.toISOString() }
}
