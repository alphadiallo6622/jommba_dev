import { NextIntlClientProvider } from 'next-intl'
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
  let prefs: { photosBlurred: boolean; soundEnabled: boolean } | null = null
  if (user) {
    const [{ data: profile }, { count: views }, { count: visitors }, { count: favorites }, { count: requests }, { count: likesUsedToday }, { data: preferences }, { data: settings }] = await Promise.all([
      supabase.from('profiles').select('*').eq('user_id', user.id).single(),
      supabase.from('profile_views').select('*', { count: 'exact', head: true }).eq('profile_id', user.id),
      supabase.from('profile_visitors').select('*', { count: 'exact', head: true }).eq('profile_id', user.id),
      supabase.from('likes').select('*', { count: 'exact', head: true }).eq('receiver_id', user.id).eq('type', 'favorite'),
      supabase.from('likes').select('*', { count: 'exact', head: true }).eq('receiver_id', user.id).eq('type', 'request'),
      supabase.from('likes').select('*', { count: 'exact', head: true }).eq('sender_id', user.id).eq('type', 'request').gte('created_at', new Date().toISOString().slice(0, 10)),
      supabase.from('user_preferences').select('sound_enabled').eq('user_id', user.id).maybeSingle(),
      supabase.from('platform_settings').select('limits').eq('id', 1).maybeSingle(),
    ])

    // Limite quotidienne pilotée par la console admin (Paramètres → Limites)
    const freeDailyLimit =
      Number((settings?.limits as { contacts?: number } | null)?.contacts) || 3

    if (profile) {
      mockUser = profileToMockUser(profile, user.email ?? '')
      mockUser.stats = {
        views:     views     ?? 0,
        visitors:  visitors  ?? 0,
        favorites: favorites ?? 0,
        requests:  requests  ?? 0,
      }
      mockUser.dailyRequests = {
        used:  likesUsedToday ?? 0,
        total: profile.is_premium ? 999 : freeDailyLimit,
      }
      // Le flou vit sur profiles (lisible par les visiteurs via RLS)
      prefs = {
        photosBlurred: profile.photos_blurred ?? false,
        soundEnabled:  preferences?.sound_enabled ?? true,
      }
    }
  }

  return (
    // /dashboard vit hors de app/[locale]/ : le provider fournit les
    // traductions au client (locale + messages résolus par i18n/request.ts via
    // le cookie NEXT_LOCALE).
    <NextIntlClientProvider>
      <div className="min-h-screen bg-gray-50">
        {/* Initialise les stores Zustand avec les données réelles Supabase */}
        <ProfileInitializer profile={mockUser} prefs={prefs} />
        {children}
        <BoostModal />
        <CoachButton />
        <CoachModal />
        <BottomNav />
      </div>
    </NextIntlClientProvider>
  )
}
