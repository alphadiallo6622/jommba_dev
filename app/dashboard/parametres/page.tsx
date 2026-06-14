import DashboardNavbar from '@/components/dashboard/Navbar'
import ParametresPage from '@/components/parametres/ParametresPage'

export default function Page() {
  return (
    <>
      <DashboardNavbar />
      <main className="pt-16 pb-20 md:pb-0">
        <ParametresPage />
      </main>
    </>
  )
}
