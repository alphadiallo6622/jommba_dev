'use client'

// components/pwa/PWAInstallTracker.tsx
// Enregistre une ligne dans `pwa_installs` quand l'app est installée, pour
// alimenter le KPI « Apps installées » de la console d'administration.
// Composant sans rendu, monté dans le layout racine.
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
import { createClient } from '@/lib/supabase/client'
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

      const supabase = createClient()
      const { data } = await supabase.auth.getUser()

      const { error } = await supabase.from('pwa_installs').insert({
        user_id:    data.user?.id ?? null,
        platform:   detected,
        user_agent: window.navigator.userAgent.slice(0, 500),
      })

      if (error) {
        // Table absente (migration pas encore appliquée) ou réseau coupé :
        // on ne pose pas le drapeau, la prochaine ouverture réessaiera.
        console.error('[pwa] enregistrement de l’installation impossible:', error)
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
