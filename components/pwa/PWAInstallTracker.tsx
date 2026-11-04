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
// est posé AVANT l'appel réseau : mieux vaut manquer une installation que
// gonfler le compteur à chaque ouverture de l'app.

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { usePWAInstall } from '@/lib/use-pwa-install'
import type { PWAInstallPlatform } from '@/lib/supabase/types'

/** Clé localStorage : cet appareil a déjà été compté. */
const RECORDED_KEY = 'jommba:pwa-install-recorded'

function alreadyRecorded(): boolean {
  try {
    return window.localStorage.getItem(RECORDED_KEY) === '1'
  } catch {
    // Stockage indisponible (mode privé, cookies bloqués) : on s'abstient
    // plutôt que de risquer un enregistrement à chaque visite.
    return true
  }
}

function markRecorded(): boolean {
  try {
    window.localStorage.setItem(RECORDED_KEY, '1')
    return true
  } catch {
    return false
  }
}

export default function PWAInstallTracker() {
  const { isStandalone, platform } = usePWAInstall()

  useEffect(() => {
    const record = async (detected: PWAInstallPlatform) => {
      if (alreadyRecorded()) return
      // Le drapeau est posé d'abord : si l'insertion échoue, on ne réessaie
      // pas en boucle à chaque navigation.
      if (!markRecorded()) return

      const supabase = createClient()
      const { data } = await supabase.auth.getUser()

      const { error } = await supabase.from('pwa_installs').insert({
        user_id:    data.user?.id ?? null,
        platform:   detected,
        user_agent: window.navigator.userAgent.slice(0, 500),
      })
      if (error) {
        // Table absente (migration pas encore appliquée) ou réseau coupé :
        // l'app n'a aucune raison de s'en trouver affectée.
        console.error('[pwa] enregistrement de l’installation impossible:', error)
      }
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
