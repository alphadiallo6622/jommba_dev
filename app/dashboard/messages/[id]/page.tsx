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
      {/* Caler la discussion sur le viewport RÉELLEMENT visible.
          On l'ancre en `fixed` entre le bas de l'en-tête (bandeau PWA + navbar
          h-16) et `bottom-0`, exactement comme la barre de navigation. Les
          navigateurs intégrés (WebView Facebook/Instagram) sur-estiment `100dvh`
          en oubliant leur propre barre d'outils basse : la zone de saisie, posée
          au fond d'une boîte `dvh`, passait alors sous le pli / derrière cette
          barre et devenait invisible, alors que la nav `fixed bottom-0` restait
          visible. L'ancrage `fixed … bottom-0` partage la même référence que la
          nav, donc la saisie se cale toujours juste au-dessus d'elle. */}
      <main className="fixed inset-x-0 bottom-0 top-[calc(var(--pwa-bar-h)+4rem)] overflow-hidden bg-gray-50">
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
