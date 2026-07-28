'use client'

// components/pwa/ServiceWorkerRegistrar.tsx
// Enregistre public/sw.js au chargement. Composant sans rendu : il vit dans le
// layout racine pour couvrir tout le site (public, dashboard, admin…).
//
// Le service worker est indispensable pour que Chromium juge l'application
// installable et émette `beforeinstallprompt`.

import { useEffect } from 'react'

export default function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return

    // En développement, le HMR de Next.js et un service worker actif se
    // gênent mutuellement : on n'enregistre qu'en production, et on nettoie
    // un éventuel worker resté d'une session précédente.
    if (process.env.NODE_ENV !== 'production') {
      navigator.serviceWorker
        .getRegistrations()
        .then((registrations) =>
          registrations.forEach((registration) => registration.unregister())
        )
        .catch(() => {})
      return
    }

    // `load` évite de concurrencer le rendu initial pour la bande passante.
    const register = () => {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/', updateViaCache: 'none' })
        .catch(() => {
          // Échec silencieux : le site reste parfaitement fonctionnel sans
          // service worker (il perd seulement le repli hors ligne).
        })
    }

    if (document.readyState === 'complete') {
      register()
      return
    }

    window.addEventListener('load', register)
    return () => window.removeEventListener('load', register)
  }, [])

  return null
}
