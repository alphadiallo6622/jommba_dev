import DashboardNavbar from '@/components/dashboard/Navbar'
import FavorisPage     from '@/components/favoris/FavorisPage'

export default function Page() {
  return (
    <>
      <DashboardNavbar />
      <main className="pt-16 pb-20 md:pb-0 bg-gray-50 min-h-screen">
        <FavorisPage />
      </main>
    </>
  )
}
