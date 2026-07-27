'use client'

import { useEffect, useState } from 'react'
import DashboardNavbar     from '@/components/dashboard/Navbar'
import PremiumHero         from '@/components/premium/PremiumHero'
import PremiumFeatures     from '@/components/premium/PremiumFeatures'
import PremiumGuarantees   from '@/components/premium/PremiumGuarantees'
import PremiumPricing, { type PremiumPricingData } from '@/components/premium/PremiumPricing'
import PremiumPayment      from '@/components/premium/PremiumPayment'
import PremiumTestimonials from '@/components/premium/PremiumTestimonials'
import PremiumFAQ          from '@/components/premium/PremiumFAQ'
import PremiumFooterCTA    from '@/components/premium/PremiumFooterCTA'
import PremiumMemberView   from '@/components/premium/PremiumMemberView'
import { useCurrentUser }  from '@/lib/use-current-user'

export interface AppliedPromo {
  code: string
  discountedPrice: number
}

export default function PremiumPage() {
  const [selectedPlan, setSelectedPlan] = useState('1m')
  const [pricing, setPricing] = useState<PremiumPricingData | null>(null)
  const [appliedPromo, setAppliedPromo] = useState<AppliedPromo | null>(null)
  const { isPremium } = useCurrentUser()

  useEffect(() => {
    fetch('/api/premium/pricing')
      .then((r) => r.json())
      .then(setPricing)
      .catch(() => setPricing(null))
  }, [])

  // Un code promo n'est valable que pour le plan sur lequel il a été appliqué.
  const handleSelectPlan = (id: string) => {
    setSelectedPlan(id)
    setAppliedPromo(null)
  }

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
              <PremiumPricing
                selectedPlan={selectedPlan}
                setSelectedPlan={handleSelectPlan}
                pricing={pricing}
                appliedPromo={appliedPromo}
                onPromoApplied={setAppliedPromo}
              />
              <PremiumPayment
                selectedPlan={selectedPlan}
                pricing={pricing}
                appliedPromo={appliedPromo}
              />
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
