import DashboardNavbar    from '@/components/dashboard/Navbar'
import NotificationsPage from '@/components/notifications/NotificationsPage'

export default function Page() {
  return (
    <>
      <DashboardNavbar />
      <main className="pt-16 pb-20 md:pb-0 bg-gray-50 min-h-screen">
        <NotificationsPage />
      </main>
    </>
  )
}
