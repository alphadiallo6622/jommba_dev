'use client'

import { useState } from 'react'
import DashboardNavbar     from '@/components/dashboard/Navbar'
import PremiumHero         from '@/components/premium/PremiumHero'
import PremiumFeatures     from '@/components/premium/PremiumFeatures'
import PremiumGuarantees   from '@/components/premium/PremiumGuarantees'
import PremiumPricing      from '@/components/premium/PremiumPricing'
import PremiumPayment      from '@/components/premium/PremiumPayment'
import PremiumCTA          from '@/components/premium/PremiumCTA'
import PremiumTestimonials from '@/components/premium/PremiumTestimonials'
import PremiumFAQ          from '@/components/premium/PremiumFAQ'
import PremiumFooterCTA    from '@/components/premium/PremiumFooterCTA'
import PremiumMemberView   from '@/components/premium/PremiumMemberView'
import { useCurrentUser }  from '@/lib/use-current-user'

export default function PremiumPage() {
  const [selectedPlan, setSelectedPlan] = useState('1m')
  const { isPremium } = useCurrentUser()

  return (
    <>
      <DashboardNavbar />
      <main className="pt-16 pb-20 md:pb-0 bg-white min-h-screen">
        <div className="max-w-lg mx-auto px-4">
          {isPremium ? (
            <PremiumMemberView />
          ) : (
            <>
              <PremiumHero />
              <PremiumFeatures />
              <PremiumGuarantees />
              <PremiumPricing selectedPlan={selectedPlan} setSelectedPlan={setSelectedPlan} />
              <PremiumPayment selectedPlan={selectedPlan} />
              <PremiumCTA />
              <PremiumTestimonials />
              <PremiumFAQ />
              <PremiumFooterCTA />
            </>
          )}
        </div>
      </main>
    </>
  )
}
