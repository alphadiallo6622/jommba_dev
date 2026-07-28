'use client'

// lib/use-pwa-install.ts
// Logique d'installation de la PWA : détection de la plateforme, capture de
// l'événement `beforeinstallprompt` (Chrome/Edge/Android) et mémorisation du
// refus pendant 2 jours.
//
// Le hook ne rend rien : il expose un état prêt à consommer par
// components/pwa/PWAInstallBanner.tsx.
//
// L'état vient d'APIs navigateur (matchMedia, localStorage, événements
// globaux), donc absent du rendu serveur. On le lit avec `useSyncExternalStore`
// plutôt qu'avec useState + useEffect : React gère alors proprement
// l'hydratation (snapshot serveur dédié) sans cascade de rendus.

import { useCallback, useSyncExternalStore } from 'react'

/** Clé localStorage stockant la date (ms) du dernier « Plus tard ». */
const DISMISS_KEY = 'jommba:pwa-install-dismissed-at'

/** Durée pendant laquelle on ne redemande pas après un refus. */
const DISMISS_DURATION_MS = 2 * 24 * 60 * 60 * 1000 // 2 jours

/**
 * Événement non standard émis par Chromium quand l'app est installable.
 * Absent des lib.dom.d.ts : on le type nous-mêmes plutôt que d'utiliser `any`.
 */
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt: () => Promise<void>
}

export type PWAPlatform = 'ios' | 'android' | 'desktop'

export interface UsePWAInstallResult {
  /** La bannière doit-elle être affichée ? (toutes conditions réunies) */
  canShowBanner: boolean
  /** L'app tourne déjà en mode application (installée). */
  isStandalone: boolean
  /** iOS/iPadOS : pas de `beforeinstallprompt`, on affiche un guide manuel. */
  isIOS: boolean
  /** Plateforme détectée, pour adapter le texte affiché. */
  platform: PWAPlatform
  /** Déclenche l'invite native. Renvoie true si l'utilisateur a accepté. */
  promptInstall: () => Promise<boolean>
  /** Ferme la bannière et mémorise le refus pendant 2 jours. */
  dismiss: () => void
}

// ── Détections plateforme ────────────────────────────────────────────────────

/** L'app tourne-t-elle en mode standalone (installée) ? */
function detectStandalone(): boolean {
  // `navigator.standalone` est la variante iOS/Safari (non standard).
  const iosStandalone =
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: fullscreen)').matches ||
    window.matchMedia('(display-mode: minimal-ui)').matches ||
    iosStandalone
  )
}

/** iPhone/iPad — inclut iPadOS 13+ qui se déclare « Macintosh » avec écran tactile. */
function detectIOS(): boolean {
  const ua = window.navigator.userAgent
  const isIPadOS = /Macintosh/.test(ua) && 'ontouchend' in document
  return /iPad|iPhone|iPod/.test(ua) || isIPadOS
}

function detectAndroid(): boolean {
  return /Android/i.test(window.navigator.userAgent)
}

/** Le refus a-t-il moins de 2 jours ? (localStorage peut être bloqué) */
function isRecentlyDismissed(): boolean {
  try {
    const raw = window.localStorage.getItem(DISMISS_KEY)
    if (!raw) return false
    const dismissedAt = Number(raw)
    if (!Number.isFinite(dismissedAt)) return false
    return Date.now() - dismissedAt < DISMISS_DURATION_MS
  } catch {
    // Mode privé Safari, cookies bloqués… : on considère qu'il n'y a pas de refus.
    return false
  }
}

// ── Store externe ────────────────────────────────────────────────────────────
// Un seul état partagé par tous les consommateurs du hook. Il doit vivre hors
// de React : `beforeinstallprompt` peut être émis avant même le montage du
// composant, et on ne veut pas rater l'événement.

interface PWAState {
  deferredPrompt: BeforeInstallPromptEvent | null
  isStandalone: boolean
  isIOS: boolean
  platform: PWAPlatform
  dismissed: boolean
}

/** Snapshot renvoyé côté serveur : rien n'est installable avant hydratation. */
const SERVER_STATE: PWAState = {
  deferredPrompt: null,
  isStandalone: false,
  isIOS: false,
  platform: 'desktop',
  dismissed: true, // masque la bannière dans le HTML initial
}

let state: PWAState = SERVER_STATE
let initialized = false
const listeners = new Set<() => void>()

function emit() {
  listeners.forEach((listener) => listener())
}

function setState(patch: Partial<PWAState>) {
  // Nouvel objet à chaque changement : `useSyncExternalStore` compare par
  // identité pour décider de re-rendre.
  state = { ...state, ...patch }
  emit()
}

/** Détection initiale + abonnements globaux, exécutés une seule fois. */
function initialize() {
  if (initialized || typeof window === 'undefined') return
  initialized = true

  const ios = detectIOS()
  state = {
    deferredPrompt: null,
    isStandalone: detectStandalone(),
    isIOS: ios,
    platform: ios ? 'ios' : detectAndroid() ? 'android' : 'desktop',
    dismissed: isRecentlyDismissed(),
  }

  // Chromium émet cet événement quand les critères d'installabilité sont
  // réunis. On l'intercepte pour déclencher l'invite depuis notre bouton.
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault() // empêche la mini-infobar native
    setState({ deferredPrompt: event as BeforeInstallPromptEvent })
  })

  // L'app vient d'être installée : on masque la bannière immédiatement.
  window.addEventListener('appinstalled', () => {
    setState({ deferredPrompt: null, isStandalone: true })
  })

  // Le passage en mode application peut survenir pendant la session.
  window
    .matchMedia('(display-mode: standalone)')
    .addEventListener('change', (event) => {
      if (event.matches) setState({ isStandalone: true })
    })
}

function subscribe(listener: () => void): () => void {
  initialize()
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

function getSnapshot(): PWAState {
  return state
}

function getServerSnapshot(): PWAState {
  return SERVER_STATE
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export function usePWAInstall(): UsePWAInstallResult {
  const { deferredPrompt, isStandalone, isIOS, platform, dismissed } =
    useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  const dismiss = useCallback(() => {
    setState({ dismissed: true })
    try {
      window.localStorage.setItem(DISMISS_KEY, String(Date.now()))
    } catch {
      // Stockage indisponible : la bannière réapparaîtra à la prochaine visite.
    }
  }, [])

  const promptInstall = useCallback(async (): Promise<boolean> => {
    const prompt = state.deferredPrompt
    if (!prompt) return false

    await prompt.prompt()
    const { outcome } = await prompt.userChoice

    // L'événement n'est utilisable qu'une fois : Chromium en réémettra un
    // nouveau si l'utilisateur a refusé et redevient éligible.
    setState({ deferredPrompt: null })

    if (outcome === 'accepted') return true

    // Refus dans l'invite native : on respecte le même délai de 2 jours.
    dismiss()
    return false
  }, [dismiss])

  // Conditions d'affichage :
  //  - jamais si l'app est déjà installée / lancée en standalone
  //  - jamais si l'utilisateur a fermé la bannière il y a moins de 2 jours
  //  - sinon : soit le navigateur l'a déclarée installable (beforeinstallprompt),
  //    soit on est sur iOS où l'on affiche le guide manuel (Safari n'émet
  //    jamais l'événement).
  const canShowBanner =
    !isStandalone && !dismissed && (deferredPrompt !== null || isIOS)

  return {
    canShowBanner,
    isStandalone,
    isIOS,
    platform,
    promptInstall,
    dismiss,
  }
}
