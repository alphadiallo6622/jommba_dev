'use client'

import { cn } from '@/lib/utils'
import DashboardNavbar  from '@/components/dashboard/Navbar'
import SecondaryNav     from './SecondaryNav'
import SwipeView        from './SwipeView'
import GridView         from './GridView'
import FilterPanel      from './FilterPanel'
import PremiumGridModal from './PremiumGridModal'
import OnboardingGuide  from './onboarding/OnboardingGuide'
import { useExplorerStore } from '@/store/explorer.store'

export default function ExplorerPage() {
  const mode = useExplorerStore(s => s.mode)

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNavbar />

      <div className="pt-16">
        {/* Secondary navigation bar */}
        <SecondaryNav />

        {/* Main content */}
        <main className={cn(
          'mx-auto px-4 py-4 pb-20 md:pb-4',
          mode === 'swipe' ? 'max-w-lg' : 'max-w-5xl',
        )}>
          {mode === 'swipe' ? <SwipeView /> : <GridView />}
        </main>
      </div>

      {/* Overlays + panels */}
      <FilterPanel />
      <PremiumGridModal />
      <OnboardingGuide />
    </div>
  )
}
