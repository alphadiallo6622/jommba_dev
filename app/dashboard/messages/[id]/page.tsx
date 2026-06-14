'use client'

import { useParams } from 'next/navigation'
import DashboardNavbar  from '@/components/dashboard/Navbar'
import ConversationPage from '@/components/messages/ConversationPage'

export default function Page() {
  const params = useParams()
  const id = params.id as string

  return (
    <>
      <DashboardNavbar />
      {/* h-dvh + overflow-hidden ensures the chat fills exactly the viewport */}
      <main className="pt-16 h-dvh overflow-hidden">
        <ConversationPage id={id} />
      </main>
    </>
  )
}
