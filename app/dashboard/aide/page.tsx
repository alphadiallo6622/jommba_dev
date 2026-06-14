import DashboardNavbar from '@/components/dashboard/Navbar'
import AidePage from '@/components/aide/AidePage'

export default function Page() {
  return (
    <>
      <DashboardNavbar />
      <main className="pt-16 pb-20 md:pb-0">
        <AidePage />
      </main>
    </>
  )
}
