import BoostModal from '@/components/boost/BoostModal'
import CoachButton from '@/components/dashboard/CoachButton'
import CoachModal from '@/components/coach/CoachModal'
import BottomNav from '@/components/dashboard/BottomNav'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
      <BoostModal />
      <CoachButton />
      <CoachModal />
      <BottomNav />
    </div>
  )
}
