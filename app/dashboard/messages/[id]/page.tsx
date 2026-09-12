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
      <main className="pt-16 h-dvh overflow-hidden bg-gray-50">
        {/* Sur desktop la discussion devient une carte centrée ; plein écran sur mobile */}
        <div className="h-full mx-auto w-full max-w-6xl md:px-4 md:py-4">
          <div className="h-full overflow-hidden bg-white md:rounded-3xl md:border md:border-gray-200/70 md:shadow-[0_18px_50px_-24px_rgba(6,78,59,0.28)]">
            <ConversationPage id={id} />
          </div>
        </div>
      </main>
    </>
  )
}
