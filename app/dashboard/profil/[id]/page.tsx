'use client'

import { useParams } from 'next/navigation'
import DashboardNavbar from '@/components/dashboard/Navbar'
import ProfilePage     from '@/components/profil/ProfilePage'

export default function Page() {
  const params = useParams()
  const id = params.id as string

  return (
    <>
      <DashboardNavbar />
      <main className="pt-16 pb-20 md:pb-0 bg-gray-50 min-h-screen">
        <ProfilePage id={id} />
      </main>
    </>
  )
}
