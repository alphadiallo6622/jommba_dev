import DashboardNavbar from '@/components/dashboard/Navbar'
import VisiteursPage   from '@/components/visiteurs/VisiteursPage'

export default function Page() {
  return (
    <>
      <DashboardNavbar />
      <main className="pt-16 pb-20 md:pb-0 bg-gray-50 min-h-screen">
        <VisiteursPage />
      </main>
    </>
  )
}
