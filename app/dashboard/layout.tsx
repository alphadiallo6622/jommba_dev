import { createClient } from '@/lib/supabase/server'
import { profileToMockUser } from '@/lib/supabase/profile-service'
import ProfileInitializer from '@/components/providers/ProfileInitializer'
import BoostModal from '@/components/boost/BoostModal'
import CoachButton from '@/components/dashboard/CoachButton'
import CoachModal from '@/components/coach/CoachModal'
import BottomNav from '@/components/dashboard/BottomNav'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Récupère le profil Supabase côté serveur — le middleware garantit qu'un
  // utilisateur authentifié est présent ici.
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let mockUser = null
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (profile) {
      mockUser = profileToMockUser(profile, user.email ?? '')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Initialise le store Zustand avec les données réelles Supabase */}
      <ProfileInitializer profile={mockUser} />
      {children}
      <BoostModal />
      <CoachButton />
      <CoachModal />
      <BottomNav />
    </div>
  )
}
