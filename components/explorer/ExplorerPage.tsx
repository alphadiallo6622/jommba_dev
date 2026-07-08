'use client'

import { useEffect } from 'react'
import { cn } from '@/lib/utils'
import DashboardNavbar  from '@/components/dashboard/Navbar'
import SecondaryNav     from './SecondaryNav'
import SwipeView        from './SwipeView'
import GridView         from './GridView'
import FilterPanel      from './FilterPanel'
import PremiumGridModal from './PremiumGridModal'
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

export default function ExplorerPage() {
  const mode        = useExplorerStore(s => s.mode)
  const setProfiles = useExplorerStore(s => s.setProfiles)
  const hydrateFavorites = useFavorisStore(s => s.hydrate)
  const { user }    = useAuth()
  const { gender }  = useCurrentUser()

  useEffect(() => {
    if (!user) return
    // Sans genre connu (onboarding non terminé), on ne peut pas déterminer
    // le genre opposé — on n'affiche aucun profil plutôt que de mélanger.
    const targetGender = oppositeGender(gender)
    if (!targetGender) { setProfiles([]); return }
    const supabase = createClient()

    async function load(targetGender: Gender) {
      if (!user) return
      const [{ data: profilesData }, { data: myFavorites }] = await Promise.all([
        supabase
          .from('profiles')
          .select('*')
          .neq('user_id', user.id)
          .eq('status', 'validated')
          .eq('visibility', 'active')
          .eq('gender', targetGender)
          .gte('profile_completion', MIN_VISIBLE_PROFILE_COMPLETION)
          .order('created_at', { ascending: false })
          .limit(50),
        supabase
          .from('likes')
          .select('receiver_id, created_at')
          .eq('sender_id', user.id)
          .eq('type', 'favorite'),
      ])

      const explorerProfiles = (profilesData ?? []).map(p => supabaseProfileToExplorer(p as unknown as Profile))
      setProfiles(explorerProfiles)

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
  }, [user, gender, setProfiles, hydrateFavorites])

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNavbar />

      <div className="pt-16">
        <SecondaryNav />

        <main className={cn(
          'mx-auto px-4 py-4 pb-20 md:pb-4',
          mode === 'swipe' ? 'max-w-lg' : 'max-w-5xl',
        )}>
          {mode === 'swipe' ? <SwipeView /> : <GridView />}
        </main>
      </div>

      <FilterPanel />
      <PremiumGridModal />
      <OnboardingGuide />
    </div>
  )
}
