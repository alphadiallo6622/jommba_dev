// lib/payment-errors.ts
//
// Les routes de paiement renvoient un `error` que SquareCardForm affiche tel
// quel sous le formulaire. Ces messages doivent donc suivre la langue du
// membre. Le front joint sa locale au corps de la requête ; on choisit ici la
// chaîne correspondante.

type PaymentErrorKey =
  | 'notAuthenticated'
  | 'missingCardToken'
  | 'notCompleted'
  | 'chargedButNotActivated'
  | 'paymentFailed'
  | 'subscriptionFailed'

const MESSAGES: Record<PaymentErrorKey, { fr: string; en: string }> = {
  notAuthenticated: {
    fr: 'Non authentifié',
    en: 'Not signed in',
  },
  missingCardToken: {
    fr: 'Token de carte manquant',
    en: 'Missing card token',
  },
  notCompleted: {
    fr: 'Paiement non finalisé',
    en: 'Payment not completed',
  },
  chargedButNotActivated: {
    fr: 'Paiement encaissé mais activation échouée. Contactez le support.',
    en: 'Payment taken but activation failed. Please contact support.',
  },
  paymentFailed: {
    fr: 'Le paiement a échoué.',
    en: 'The payment failed.',
  },
  subscriptionFailed: {
    fr: "L'abonnement a échoué.",
    en: 'The subscription failed.',
  },
}

/** Message d'erreur de paiement dans la langue du membre (français par défaut). */
export function paymentError(key: PaymentErrorKey, locale: string | undefined): string {
  const messages = MESSAGES[key]
  return locale?.startsWith('en') ? messages.en : messages.fr
}
