import DashboardNavbar    from '@/components/dashboard/Navbar'
import PremiumBanner      from '@/components/dashboard/PremiumBanner'
import UserProfileCard    from '@/components/dashboard/UserProfileCard'
import ProfileGrid        from '@/components/dashboard/ProfileGrid'
import DailyReminder      from '@/components/dashboard/DailyReminder'
import DailyTip           from '@/components/dashboard/DailyTip'
import InvisibleAlert     from '@/components/dashboard/InvisibleAlert'
import QuickNav           from '@/components/dashboard/QuickNav'
import BoostUnavailable   from '@/components/dashboard/BoostUnavailable'
import DailyRequests      from '@/components/dashboard/DailyRequests'
import StatsPanel         from '@/components/dashboard/StatsPanel'
import VisibilityToggle   from '@/components/dashboard/VisibilityToggle'
import MarriageAcademy    from '@/components/dashboard/MarriageAcademy'
import ProfileAppreciation from '@/components/dashboard/ProfileAppreciation'

export default function DashboardPage() {
  return (
    <>
      <DashboardNavbar />

      <main className="pt-16 pb-28 md:pb-8 px-4 md:px-6 bg-gray-50 min-h-screen">
        <div className="max-w-5xl mx-auto flex flex-col gap-4 md:gap-5 py-4 md:py-5">

          {/* 1. Premium banner */}
          <PremiumBanner />

          {/* 2. User profile card */}
          <UserProfileCard />

          {/* 3. Profile grid — La sélection Jommba */}
          <ProfileGrid />

          {/* 4. "Ton profil ne passe pas inaperçu" — non-premium only */}
          <ProfileAppreciation />

          {/* 5. Daily reminder (hadith) */}
          <DailyReminder />

          {/* 5. Daily tip */}
          <DailyTip />

          {/* 6. Invisible / pause / discussion alert */}
          <InvisibleAlert />

          {/* 7. Quick navigation shortcuts */}
          <QuickNav />

          {/* 8. Boost unavailable (only when not validated) */}
          <BoostUnavailable />

          {/* 9. Daily requests counter */}
          <DailyRequests />

          {/* 10. Stats + right column */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
            <StatsPanel />
            <div className="flex flex-col gap-4">
              <VisibilityToggle />
              <MarriageAcademy />
            </div>
          </div>

        </div>
      </main>
    </>
  )
}
