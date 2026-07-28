'use client'

import { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Home, Compass, Eye, Star, Heart, Crown, Zap, MessageCircle, Bell, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCurrentUser } from '@/lib/use-current-user'
import { useBoostStore } from '@/store/boost.store'
import { useNotifCount } from '@/lib/use-notif-count'
import { useUnreadMessagesCount } from '@/lib/use-unread-messages'
import ProfileDropdown from './ProfileDropdown'

type TabId = 'accueil' | 'decouvrir' | 'visiteurs' | 'favoris' | 'demandes' | 'premium'

const ROUTE_TO_TAB: Record<string, TabId> = {
  '/dashboard':           'accueil',
  '/dashboard/explorer':  'decouvrir',
  '/dashboard/visiteurs': 'visiteurs',
  '/dashboard/favoris':   'favoris',
  '/dashboard/demandes':  'demandes',
  '/dashboard/premium':   'premium',
}

const TAB_TO_ROUTE: Partial<Record<TabId, string>> = {
  accueil:   '/dashboard',
  decouvrir: '/dashboard/explorer',
  visiteurs: '/dashboard/visiteurs',
  favoris:   '/dashboard/favoris',
  demandes:  '/dashboard/demandes',
  premium:   '/dashboard/premium',
}

const mainTabs = [
  { id: 'accueil' as TabId,   labelKey: 'home',      icon: Home    },
  { id: 'decouvrir' as TabId, labelKey: 'discover',  icon: Compass },
  { id: 'visiteurs' as TabId, labelKey: 'visitors',  icon: Eye     },
  { id: 'favoris' as TabId,   labelKey: 'favorites', icon: Star    },
  { id: 'demandes' as TabId,  labelKey: 'requests',  icon: Heart   },
] as const

export default function DashboardNavbar() {
  const pathname    = usePathname()
  const router      = useRouter()
  const t           = useTranslations('dashboard.nav')
  const currentUser = useCurrentUser()
  const openBoost   = useBoostStore(s => s.openBoost)
  const totalUnread = useUnreadMessagesCount()
  const notifUnread = useNotifCount()
  const [localTab, setLocalTab]     = useState<TabId>('accueil')
  const [dropdownOpen, setDropdown] = useState(false)

  const activeTab: TabId = ROUTE_TO_TAB[pathname]
    ?? (pathname.startsWith('/dashboard/profil') ? 'demandes' : localTab)

  const handleTabClick = (id: TabId) => {
    const route = TAB_TO_ROUTE[id]
    route ? router.push(route) : setLocalTab(id)
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100 md:bg-white/60 md:backdrop-blur-md md:border-gray-100/40 h-16 md:h-[72px]">
      <div className="h-full flex items-center justify-between px-4 md:px-20 max-w-screen-xl mx-auto">

        {/* ── Left: Logo + desktop tabs ── */}
        <div className="flex items-center">
          {/* Logo — cliquable → /dashboard */}
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center mr-2 shrink-0 focus:outline-none"
            aria-label={t('homeAria')}
          >
            <img
              src="/logo_jommba_fond_transparent.png"
              alt="Jommba"
              className="max-w-none w-[135px] h-auto md:w-auto md:h-14"
            />
          </button>

          {/* Main tabs — desktop only */}
          <div className="hidden md:flex items-center">
            {mainTabs.map(({ id, labelKey, icon: Icon }) => (
              <button
                key={id}
                onClick={() => handleTabClick(id)}
                className={cn(
                  'flex flex-col items-center justify-center gap-0.5 px-2.5 h-16 md:h-[72px] relative transition-colors duration-200 min-w-[52px]',
                  activeTab === id ? 'text-emerald-500' : 'text-gray-400 hover:text-gray-600',
                )}
              >
                <Icon className="w-[18px] h-[18px]" />
                <span className="text-[10px] font-medium leading-none">{t(labelKey)}</span>
                {activeTab === id && (
                  <span className="absolute bottom-0 left-1 right-1 h-0.5 bg-emerald-500 rounded-t" />
                )}
              </button>
            ))}

            <button
              onClick={() => handleTabClick('premium')}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 px-2.5 h-16 md:h-[72px] relative transition-colors duration-200 min-w-[52px]',
                activeTab === 'premium' ? 'text-amber-500' : 'text-amber-400 hover:text-amber-500',
              )}
            >
              <Crown className="w-[18px] h-[18px]" />
              <span className="text-[10px] font-medium leading-none">{t('premium')}</span>
              {activeTab === 'premium' && (
                <span className="absolute bottom-0 left-1 right-1 h-0.5 bg-amber-500 rounded-t" />
              )}
            </button>
          </div>
        </div>

        {/* ── Right: action icons ── */}
        <div className="flex items-center gap-2">

          {/* Boost */}
          <button
            onClick={openBoost}
            className="w-10 h-10 rounded-full border border-gray-200 bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-colors"
          >
            <Zap className="w-[18px] h-[18px] text-gray-500" />
          </button>

          {/* Crown — mobile only */}
          <button
            onClick={() => router.push('/dashboard/premium')}
            className={cn(
              'md:hidden w-10 h-10 rounded-full border flex items-center justify-center transition-colors',
              pathname.startsWith('/dashboard/premium')
                ? 'border-amber-300 bg-amber-100'
                : 'border-amber-200 bg-amber-50 hover:bg-amber-100',
            )}
          >
            <Crown className="w-[18px] h-[18px] text-amber-500" />
          </button>

          {/* Messages — desktop only */}
          <button
            onClick={() => router.push('/dashboard/messages')}
            className={cn(
              'hidden md:flex relative w-10 h-10 rounded-full border border-gray-200 bg-gray-50 items-center justify-center hover:bg-gray-100 transition-colors',
              pathname.startsWith('/dashboard/messages') && 'border-emerald-200 bg-emerald-50',
            )}
          >
            <MessageCircle className={cn(
              'w-[18px] h-[18px]',
              pathname.startsWith('/dashboard/messages') ? 'text-emerald-500' : 'text-gray-500',
            )} />
            {totalUnread > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 bg-red-500 text-white text-[9px] rounded-full flex items-center justify-center px-0.5 font-bold leading-none">
                {totalUnread}
              </span>
            )}
          </button>

          {/* Notifications */}
          <button
            onClick={() => router.push('/dashboard/notifications')}
            className={cn(
              'relative w-10 h-10 rounded-full border border-gray-200 bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-colors',
              pathname.startsWith('/dashboard/notifications') && 'border-emerald-200 bg-emerald-50',
            )}
          >
            <Bell className={cn(
              'w-[18px] h-[18px]',
              pathname.startsWith('/dashboard/notifications') ? 'text-emerald-500' : 'text-gray-500',
            )} />
            {notifUnread > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 bg-red-500 text-white text-[9px] rounded-full flex items-center justify-center px-0.5 font-bold leading-none">
                {notifUnread}
              </span>
            )}
          </button>

          {/* Avatar + dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdown(v => !v)}
              className="flex items-center gap-1"
            >
              <img
                src={currentUser.avatar}
                alt="Avatar"
                className="w-10 h-10 rounded-xl object-cover"
              />
              <ChevronDown className={cn(
                'hidden md:block w-3.5 h-3.5 text-gray-400 transition-transform duration-200',
                dropdownOpen && 'rotate-180',
              )} />
            </button>
            {dropdownOpen && (
              <ProfileDropdown onClose={() => setDropdown(false)} />
            )}
          </div>

          {dropdownOpen && (
            <div className="fixed inset-0 z-40" onClick={() => setDropdown(false)} />
          )}
        </div>

      </div>
    </header>
  )
}
