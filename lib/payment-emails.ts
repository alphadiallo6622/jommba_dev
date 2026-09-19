// lib/payment-emails.ts
// Emails envoyés après un paiement réussi (Premium ou Boost) :
//  - confirmation Jommba au membre (en plus du reçu envoyé par Square) ;
//  - notification à l'administration (contact@jommba.com).
// Ne lève jamais : un échec d'envoi ne doit pas remettre en cause un paiement
// déjà encaissé. À `await` côté route (les fonctions serverless coupent les
// promesses non attendues).
import { sendEmail } from './email'

const ADMIN_EMAIL = 'contact@jommba.com'

interface PaymentEmailInput {
  kind: 'premium' | 'boost'
  /** Identifiant du plan (15j/1m/3m/6m) ou du boost (24h/3j/7j). */
  itemId: string
  amountUsd: number
  locale?: string
  memberEmail?: string | null
  firstName?: string | null
  lastName?: string | null
  paymentId?: string | null
  /** Date de fin de l'accès Premium / du Boost. */
  expiresAt: Date
  promoCode?: string | null
}

const PLAN_LABEL_FR: Record<string, string> = {
  '15j': '15 jours', '1m': '1 mois', '3m': '3 mois', '6m': '6 mois',
  '24h': '24 heures', '3j': '3 jours', '7j': '7 jours',
}
const PLAN_LABEL_EN: Record<string, string> = {
  '15j': '15 days', '1m': '1 month', '3m': '3 months', '6m': '6 months',
  '24h': '24 hours', '3j': '3 days', '7j': '7 days',
}

export async function sendPaymentEmails(input: PaymentEmailInput): Promise<void> {
  const en = input.locale?.startsWith('en') ?? false
  const dateLocale = en ? 'en-US' : 'fr-FR'
  const duration = (en ? PLAN_LABEL_EN : PLAN_LABEL_FR)[input.itemId] ?? input.itemId
  const amount = `${input.amountUsd.toLocaleString(dateLocale)} $`
  const until = input.expiresAt.toLocaleDateString(dateLocale, {
    day: 'numeric', month: 'long', year: 'numeric',
  })
  const fullName = [input.firstName, input.lastName].filter(Boolean).join(' ') || '—'
  const isPremium = input.kind === 'premium'

  const tasks: Promise<void>[] = []

  // 1) Confirmation au membre.
  if (input.memberEmail) {
    const subject = isPremium
      ? (en ? 'Your Jommba Premium payment is confirmed' : 'Votre paiement Jommba Premium est confirmé')
      : (en ? 'Your Jommba Boost payment is confirmed' : 'Votre paiement Jommba Boost est confirmé')
    const text = en
      ? `Thank you! We have received your payment of ${amount}.\n\n` +
        `${isPremium ? `Premium ${duration}` : `Boost ${duration}`} is now active until ${until}.\n\n` +
        `A separate receipt has also been sent to you by Square.`
      : `Merci ! Nous avons bien reçu votre paiement de ${amount}.\n\n` +
        `${isPremium ? `Premium ${duration}` : `Boost ${duration}`} est désormais actif jusqu'au ${until}.\n\n` +
        `Un reçu vous a également été envoyé séparément par Square.`
    tasks.push(
      sendEmail({
        to: input.memberEmail,
        toName: input.firstName || undefined,
        subject,
        text,
        signatureName: en ? 'Jommba Team' : 'Équipe Jommba',
        signatureRole: `${en ? 'Billing' : 'Facturation'} · contact@jommba.com`,
      }),
    )
  }

  // 2) Notification à l'administration (toujours en français).
  tasks.push(
    sendEmail({
      to: ADMIN_EMAIL,
      subject: `${isPremium ? 'Nouveau paiement Premium' : 'Nouveau paiement Boost'} · ${amount} · ${fullName}`,
      text:
        `${isPremium ? 'Un achat Premium' : 'Un achat de Boost'} vient d'être encaissé sur jommba.com.\n\n` +
        `Membre : ${fullName} (${input.memberEmail ?? '—'})\n` +
        `Produit : ${isPremium ? 'Premium' : 'Boost'} ${PLAN_LABEL_FR[input.itemId] ?? input.itemId}\n` +
        `Montant : ${input.amountUsd.toLocaleString('fr-FR')} $\n` +
        (input.promoCode ? `Code promo : ${input.promoCode}\n` : '') +
        `Actif jusqu'au : ${input.expiresAt.toLocaleDateString('fr-FR')}\n` +
        `ID paiement Square : ${input.paymentId ?? '—'}`,
      signatureName: 'Console Jommba',
      signatureRole: 'Notification automatique',
    }),
  )

  const results = await Promise.allSettled(tasks)
  for (const r of results) {
    if (r.status === 'rejected') console.error('[payment-emails] envoi échoué', r.reason)
  }
}
