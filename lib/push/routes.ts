// lib/push/routes.ts
//
// Page ouverte au clic sur une notification push : chaque événement renvoie
// vers sa page dédiée. La clé i18n de la notification (data.i18n) prime ; le
// `type` sert de repli pour les lignes qui n'en portent pas (annonces, messages
// écrits à la main par un admin…).

const PREMIUM = '/dashboard/premium'
const EXPLORER = '/dashboard/explorer'
const HELP = '/dashboard/aide'

const BY_KEY: Record<string, string> = {
  newRequest: '/dashboard/demandes',
  requestDeclined: EXPLORER,
  newVisit: '/dashboard/visiteurs',
  premiumConfirmed: PREMIUM,
  paymentFailed: PREMIUM,
  premiumExpiring: PREMIUM,
  premiumGifted: PREMIUM,
  subscriptionCancelled: PREMIUM,
  refundConfirmed: PREMIUM,
  boostActivated: EXPLORER,
  boostExpired: EXPLORER,
  inactivity: EXPLORER,
  warning: HELP,
  accountSuspendedReport: HELP,
  accountSuspendedAdmin: HELP,
}

const BY_TYPE: Record<string, string> = {
  demande: '/dashboard/demandes',
  decline: EXPLORER,
  visite: '/dashboard/visiteurs',
  premium: PREMIUM,
  support: HELP,
  moderation: HELP,
}

export type PushRouteInput = {
  type: string
  i18n?: string
  targetId?: string
  userId: string
}

export function pushPathFor({ type, i18n, targetId, userId }: PushRouteInput): string {
  // La conversation s'ouvre sur l'identifiant de l'autre membre.
  if (i18n === 'newMessage' || i18n === 'requestAccepted' || type === 'message') {
    return targetId ? `/dashboard/messages/${targetId}` : '/dashboard/messages'
  }
  // Décision de modération : le membre retrouve son propre profil.
  if (i18n === 'profileValidated' || i18n === 'profileRefused' || i18n === 'photoRejected') {
    return `/dashboard/profil/${userId}`
  }
  if (i18n && BY_KEY[i18n]) return BY_KEY[i18n]
  return BY_TYPE[type] ?? '/dashboard/notifications'
}
