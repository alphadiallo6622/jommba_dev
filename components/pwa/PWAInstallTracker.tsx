'use client'

// components/pwa/PWAInstallTracker.tsx
// Signale à /api/pwa/install que l'app vient d'être installée, pour alimenter
// le KPI « Apps installées » de la console d'administration et sa carte des
// lieux. Composant sans rendu, monté dans le layout racine.
//
// L'enregistrement passe par une route serveur et non par le client Supabase :
// seul le serveur voit les en-têtes de géolocalisation du réseau Edge, d'où
// viennent le pays et la ville de l'installation.
//
// Aucune API navigateur ne permet d'interroger « cette app est-elle
// installée ? ». On s'appuie donc sur deux signaux complémentaires :
//   1. `appinstalled` — émis par Chromium juste après l'installation, dans
//      l'onglet qui l'a déclenchée ;
//   2. le lancement en mode standalone — seul signal disponible sur iOS, où
//      Safari n'émet jamais `appinstalled`, et filet de sécurité partout
//      ailleurs si le premier signal a été manqué.
//
// Un drapeau localStorage garantit qu'un appareil ne compte qu'une fois. Il
// n'est posé qu'APRÈS une insertion réussie : un échec (table absente, réseau
// coupé) doit pouvoir être rattrapé au prochain lancement, sinon
// l'installation est perdue pour toujours. Contre le risque inverse — réessayer
// en boucle — un verrou en mémoire limite à une tentative par chargement.

import { useEffect } from 'react'
import { usePWAInstall } from '@/lib/use-pwa-install'
import type { PWAInstallPlatform } from '@/lib/supabase/types'

/** Clé localStorage : cet appareil a déjà été compté.
 *  Suffixe `v2` : la première version posait le drapeau avant l'insertion, si
 *  bien que les appareils installés avant la création de la table étaient
 *  marqués « comptés » sans l'être. Changer de clé les remet dans la course. */
const RECORDED_KEY = 'jommba:pwa-install-recorded-v2'

/** Une seule tentative par chargement de page, même si plusieurs signaux
 *  d'installation se déclenchent (appinstalled + mode standalone). */
let attemptedThisLoad = false

function alreadyRecorded(): boolean {
  try {
    return window.localStorage.getItem(RECORDED_KEY) === '1'
  } catch {
    // Stockage indisponible (mode privé, cookies bloqués) : on s'abstient
    // plutôt que de risquer un enregistrement à chaque visite.
    return true
  }
}

function markRecorded(): void {
  try {
    window.localStorage.setItem(RECORDED_KEY, '1')
  } catch {
    // Stockage indisponible : le verrou en mémoire évite déjà les doublons
    // sur ce chargement ; une réouverture pourra recompter cet appareil.
  }
}

export default function PWAInstallTracker() {
  const { isStandalone, platform } = usePWAInstall()

  useEffect(() => {
    const record = async (detected: PWAInstallPlatform) => {
      if (attemptedThisLoad || alreadyRecorded()) return
      attemptedThisLoad = true

      try {
        const res = await fetch('/api/pwa/install', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ platform: detected }),
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
      } catch (err) {
        // Réseau coupé, route indisponible : on ne pose pas le drapeau, la
        // prochaine ouverture de l'app réessaiera.
        console.error('[pwa] enregistrement de l’installation impossible:', err)
        return
      }
      markRecorded()
    }

    // 1. Installation en direct depuis le navigateur.
    const onInstalled = () => { void record(platform) }
    window.addEventListener('appinstalled', onInstalled)

    // 2. L'app est ouverte en mode application : elle est donc installée.
    if (isStandalone) void record(platform)

    return () => window.removeEventListener('appinstalled', onInstalled)
  }, [isStandalone, platform])

  return null
}
