// Activation d'un Boost après un paiement Mobile Money confirmé (settled).
//
// Pendant pour le Boost de lib/sayele/activate.ts (qui, lui, active Premium).
// Reproduit À L'IDENTIQUE le comportement de la route Square boost
// (app/api/payments/boost) : même ligne `boosts` (user_id, expires_at,
// amount_usd), mêmes e-mails et notification — pour qu'un boost soit traité de
// la même façon quelle que soit la source du paiement. Le code Square n'est ni
// modifié ni importé.
//
// IDEMPOTENT : webhook et polling peuvent arriver en concurrence. On « réclame »
// la ligne de façon atomique avant toute écriture : une seule exécution crée le
// boost.
import { createAdminClient } from '@/lib/supabase/admin'
import { getBoost } from '@/lib/square/plans'
import { sendPaymentEmails } from '@/lib/payment-emails'
import { createNotification } from '@/lib/push/notify'
import type { MobileMoneyPayment } from '@/lib/supabase/types'
import type { ActivationResult } from '@/lib/sayele/activate'

/**
 * Active un Boost à partir d'une transaction Mobile Money settled.
 * @param paymentId  id de la ligne mobile_money_payments (kind = 'boost')
 */
export async function activateBoostFromMobileMoney(paymentId: string): Promise<ActivationResult> {
  const admin = createAdminClient()

  // 1) Charge la transaction. Court-circuits idempotents : introuvable ou déjà
  //    liée à un boost → rien à refaire ; échouée / expirée → on ne crée rien.
  //    On sait REPRENDRE un paiement resté `settled` sans boost (garde-fou
  //    anti-blocage) ; l'idempotence tient au verrou atomique sur boost_id.
  const { data: paymentRow } = await admin
    .from('mobile_money_payments')
    .select('*')
    .eq('id', paymentId)
    .maybeSingle()

  const payment = paymentRow as MobileMoneyPayment | null
  if (!payment) return { activated: false, alreadyDone: true }
  if (payment.boost_id) return { activated: false, alreadyDone: true }
  if (payment.status === 'failed' || payment.status === 'expired') {
    return { activated: false, alreadyDone: false }
  }

  const boost = getBoost(payment.plan_id)
  if (!boost) {
    console.error('[sayele/activate-boost] boost inconnu', payment.id, payment.plan_id)
    return { activated: false, alreadyDone: false }
  }

  const expiresAt = new Date(Date.now() + boost.durationHours * 60 * 60 * 1000)
  const now = new Date().toISOString()
  const amountUsd = Number(payment.amount_usd)

  // 2) Marque la transaction settled si ce n'est pas déjà le cas.
  if (payment.status !== 'settled') {
    await admin
      .from('mobile_money_payments')
      .update({ status: 'settled', settled_at: payment.settled_at ?? now, updated_at: now })
      .eq('id', payment.id)
      .in('status', ['pending', 'processing'])
  }

  // 3) Crée le boost — forme identique à la route Square (square_payment_id null
  //    car payé par Mobile Money).
  const { data: created, error: insErr } = await admin
    .from('boosts')
    .insert({
      user_id: payment.user_id,
      expires_at: expiresAt.toISOString(),
      square_payment_id: null,
      amount_usd: amountUsd,
    })
    .select('id')
    .single()

  if (insErr || !created) {
    // Insert échoué : la transaction reste `settled` SANS boost_id, donc
    // reprenable (polling / cron de réconciliation) — plus de blocage définitif.
    console.error('[sayele/activate-boost] insert boost échoué', payment.id, insErr)
    return { activated: false, alreadyDone: false }
  }

  // 4) Verrou d'idempotence : on inscrit boost_id seulement s'il est encore nul.
  //    Course perdue (exécution concurrente déjà liée) → on supprime le doublon
  //    orphelin et on s'arrête sans ré-envoyer e-mails ni notifications.
  const { data: linked } = await admin
    .from('mobile_money_payments')
    .update({ boost_id: created.id, updated_at: now })
    .eq('id', payment.id)
    .is('boost_id', null)
    .select('id')
    .maybeSingle()

  if (!linked) {
    await admin.from('boosts').delete().eq('id', created.id)
    return { activated: false, alreadyDone: true }
  }

  // 3) Profil (nom) pour les e-mails + notifications.
  const { data: profile } = await admin
    .from('profiles')
    .select('first_name, last_name')
    .eq('user_id', payment.user_id)
    .maybeSingle()

  const { data: userRes } = await admin.auth.admin.getUserById(payment.user_id)
  const email = userRes?.user?.email ?? null

  // 4) E-mails : confirmation au membre + notification administration.
  await sendPaymentEmails({
    kind: 'boost',
    itemId: payment.plan_id,
    amountUsd,
    locale: payment.locale ?? undefined,
    memberEmail: email,
    firstName: profile?.first_name,
    lastName: profile?.last_name,
    paymentId: payment.provider_tx_id,
    expiresAt,
    provider: 'mobile_money',
  })

  // 5) Notification + push « Boost activé ».
  await createNotification({
    userId: payment.user_id,
    type: 'premium',
    title: 'Boost activé 🚀',
    body: 'Ton profil est mis en avant auprès des autres membres.',
    i18n: 'boostActivated',
  })

  return { activated: true, alreadyDone: false, expiresAt: expiresAt.toISOString() }
}
