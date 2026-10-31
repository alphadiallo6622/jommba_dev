'use client'

import { useCallback, useEffect, useState } from 'react'
import { useLocale } from 'next-intl'
import { cn } from '@/lib/utils'
import DashboardNavbar  from '@/components/dashboard/Navbar'
import SecondaryNav     from './SecondaryNav'
import SwipeView        from './SwipeView'
import GridView         from './GridView'
import FilterPanel      from './FilterPanel'
import PremiumGridModal from './PremiumGridModal'
import AdvancedFiltersModal from './AdvancedFiltersModal'
import OnboardingGuide  from './onboarding/OnboardingGuide'
import { useExplorerStore } from '@/store/explorer.store'
import { useFavorisStore } from '@/store/favoris.store'
import { useAuth } from '@/components/providers/AuthProvider'
import { useCurrentUser } from '@/lib/use-current-user'
import { createClient } from '@/lib/supabase/client'
import { supabaseProfileToExplorer } from '@/lib/supabase/profile-service'
import { oppositeGender, type Gender } from '@/lib/gender'
import { MIN_VISIBLE_PROFILE_COMPLETION } from '@/lib/constants'
import type { Profile } from '@/lib/supabase/types'

/** Taille d'une page d'exploration — multiple de 2 et de 4, les deux largeurs
 *  de la grille, pour qu'une page remplisse toujours des rangées entières. */
const PAGE_SIZE = 24

export default function ExplorerPage() {
  const mode        = useExplorerStore(s => s.mode)
  const setProfiles = useExplorerStore(s => s.setProfiles)
  const appendProfiles = useExplorerStore(s => s.appendProfiles)
  const profiles    = useExplorerStore(s => s.profiles)
  const total       = useExplorerStore(s => s.totalProfiles)
  const hydrateFavorites = useFavorisStore(s => s.hydrate)
  const { user }    = useAuth()
  const { gender }  = useCurrentUser()
  const locale      = useLocale()

  // La graine est tirée au montage : l'ordre des profils change donc à chaque
  // actualisation, mais reste le même d'une page à l'autre — sans quoi la
  // pagination sauterait des profils et en répéterait d'autres.
  const [seed] = useState(() => Math.random().toString(36).slice(2))
  const [loadingMore, setLoadingMore] = useState(false)

  const targetGender = oppositeGender(gender)
  const hasMore = profiles.length < total

  useEffect(() => {
    if (!user) return
    // Sans genre connu (onboarding non terminé), on ne peut pas déterminer
    // le genre opposé — on n'affiche aucun profil plutôt que de mélanger.
    if (!targetGender) { setProfiles([], 0); return }
    const supabase = createClient()

    async function load(targetGender: Gender) {
      if (!user) return
      const [{ data: profilesData }, { data: count }, { data: myFavorites }] = await Promise.all([
        supabase.rpc('discover_profiles', {
          p_viewer: user.id,
          p_gender: targetGender,
          p_seed: seed,
          p_completion: MIN_VISIBLE_PROFILE_COMPLETION,
          p_limit: PAGE_SIZE,
          p_offset: 0,
        }),
        supabase.rpc('discover_profiles_count', {
          p_viewer: user.id,
          p_gender: targetGender,
          p_completion: MIN_VISIBLE_PROFILE_COMPLETION,
        }),
        supabase
          .from('likes')
          .select('receiver_id, created_at')
          .eq('sender_id', user.id)
          .eq('type', 'favorite'),
      ])

      // Le tri aléatoire, la pagination et l'exclusion des membres bloqués
      // (dans les deux sens) sont faits par discover_profiles() côté serveur.
      const explorerProfiles = ((profilesData ?? []) as Profile[])
        .map(p => supabaseProfileToExplorer(p, locale))
      setProfiles(explorerProfiles, count ?? explorerProfiles.length)

      // Hydrate le store favoris depuis la BDD pour que l'état ⭐ soit correct
      const favTimes = new Map(
        ((myFavorites ?? []) as { receiver_id: string; created_at: string }[])
          .map(f => [f.receiver_id, f.created_at])
      )
      hydrateFavorites(
        explorerProfiles
          .filter(p => favTimes.has(p.id))
          .map(p => ({ profile: p, addedAt: favTimes.get(p.id)! }))
      )
    }

    load(targetGender)
  }, [user, targetGender, seed, locale, setProfiles, hydrateFavorites])

  // Page suivante : même graine, décalage égal au nombre de profils déjà reçus.
  const loadMore = useCallback(async () => {
    if (!user || !targetGender || loadingMore || !hasMore) return
    setLoadingMore(true)
    const { data, error } = await createClient().rpc('discover_profiles', {
      p_viewer: user.id,
      p_gender: targetGender,
      p_seed: seed,
      p_completion: MIN_VISIBLE_PROFILE_COMPLETION,
      p_limit: PAGE_SIZE,
      p_offset: profiles.length,
    })
    if (error) console.error('[explorer] loadMore:', error)
    else appendProfiles(((data ?? []) as Profile[]).map(p => supabaseProfileToExplorer(p, locale)))
    setLoadingMore(false)
  }, [user, targetGender, seed, locale, loadingMore, hasMore, profiles.length, appendProfiles])

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNavbar />

      <div className="pt-16">
        <SecondaryNav />

        <main className={cn(
          'mx-auto px-4 py-4 pb-20 md:pb-4',
          mode === 'swipe' ? 'max-w-lg' : 'max-w-5xl',
        )}>
          {mode === 'swipe'
            ? <SwipeView hasMore={hasMore} onLoadMore={loadMore} />
            : <GridView hasMore={hasMore} loadingMore={loadingMore} onLoadMore={loadMore} />}
        </main>
      </div>

      <FilterPanel />
      <PremiumGridModal />
      <AdvancedFiltersModal />
      <OnboardingGuide />
    </div>
  )
}
