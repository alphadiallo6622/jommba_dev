'use client'

// lib/push/client.ts
// Utilitaires navigateur pour Web Push + badge de l'icône PWA.

export type PushSupport = 'ok' | 'ios-needs-install' | 'unsupported'

const isIOS = () =>
  /iPad|iPhone|iPod/.test(navigator.userAgent) ||
  // iPadOS se présente comme un Mac tactile.
  (navigator.userAgent.includes('Macintosh') && navigator.maxTouchPoints > 1)

const isStandalone = () =>
  window.matchMedia('(display-mode: standalone)').matches ||
  (navigator as Navigator & { standalone?: boolean }).standalone === true

/** Le push exige le service worker, enregistré uniquement en production. */
export function getPushSupport(): PushSupport {
  if (typeof window === 'undefined') return 'unsupported'
  if (process.env.NODE_ENV !== 'production') return 'unsupported'
  if ('serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window) {
    return 'ok'
  }
  // Sur iPhone/iPad, l'API push n'apparaît qu'une fois l'app ajoutée à l'écran d'accueil.
  if (isIOS() && !isStandalone()) return 'ios-needs-install'
  return 'unsupported'
}

function urlBase64ToUint8Array(base64: string): Uint8Array<ArrayBuffer> {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4)
  const raw = window.atob((base64 + padding).replace(/-/g, '+').replace(/_/g, '/'))
  const out = new Uint8Array(new ArrayBuffer(raw.length))
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i)
  return out
}

/** `serviceWorker.ready` ne se résout jamais sans worker : on borne l'attente. */
async function getRegistration(): Promise<ServiceWorkerRegistration | null> {
  return Promise.race([
    navigator.serviceWorker.ready,
    new Promise<null>((resolve) => setTimeout(() => resolve(null), 8000)),
  ])
}

async function saveSubscription(sub: PushSubscription, locale: string): Promise<boolean> {
  const res = await fetch('/api/push/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...sub.toJSON(), locale }),
  })
  return res.ok
}

/**
 * Abonne l'appareil (crée l'abonnement s'il n'existe pas) et l'enregistre côté
 * serveur. La permission doit être déjà accordée.
 */
export async function ensurePushSubscription(locale: string): Promise<boolean> {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  if (!publicKey || getPushSupport() !== 'ok' || Notification.permission !== 'granted') return false
  try {
    const registration = await getRegistration()
    if (!registration) return false
    const sub =
      (await registration.pushManager.getSubscription()) ??
      (await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      }))
    return await saveSubscription(sub, locale)
  } catch (err) {
    console.error('[push] abonnement impossible', err)
    return false
  }
}

/** Demande la permission (geste utilisateur requis sur iOS) puis abonne l'appareil. */
export async function enablePush(locale: string): Promise<'granted' | 'denied' | 'default' | 'error'> {
  if (getPushSupport() !== 'ok') return 'error'
  const permission = await Notification.requestPermission()
  if (permission !== 'granted') return permission
  return (await ensurePushSubscription(locale)) ? 'granted' : 'error'
}

/** Désabonne cet appareil (navigateur + serveur). Ne lève jamais d'exception. */
export async function disablePush(): Promise<void> {
  try {
    if (getPushSupport() !== 'ok') return
    const registration = await getRegistration()
    const sub = await registration?.pushManager.getSubscription()
    if (!sub) return
    await fetch('/api/push/subscribe', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ endpoint: sub.endpoint }),
    }).catch(() => {})
    await sub.unsubscribe()
  } catch {
    // Sans conséquence : le serveur purge les abonnements morts (404/410).
  }
}

/** Badge de l'icône de l'app installée (0 = effacé). */
export function setBadge(count: number): void {
  try {
    if (!('setAppBadge' in navigator)) return
    if (count > 0) void navigator.setAppBadge(count).catch(() => {})
    else void navigator.clearAppBadge().catch(() => {})
  } catch {
    // Badging API absente : sans conséquence.
  }
}
