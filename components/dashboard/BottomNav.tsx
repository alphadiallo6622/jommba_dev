'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { LayoutGrid, UserPlus, Search, MessageCircle, Heart } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useNotifCount } from '@/lib/use-notif-count'
import { useDemandesCount } from '@/lib/use-demandes-count'
import { useUnreadMessagesCount } from '@/lib/use-unread-messages'

export default function BottomNav() {
  const pathname       = usePathname()
  const router         = useRouter()
  const t              = useTranslations('dashboard.nav')
  const actUnread      = useNotifCount()
  const demandesUnread = useDemandesCount()

  const msgUnread = useUnreadMessagesCount()

  const isActive = (path: string) =>
    path === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(path)

  const sideItems = [
    { id: 'accueil',  label: t('home'),     icon: LayoutGrid,    path: '/dashboard',               badge: 0 },
    { id: 'demandes', label: t('requests'), icon: UserPlus,      path: '/dashboard/demandes',      badge: demandesUnread },
    { id: 'messages', label: t('messages'), icon: MessageCircle, path: '/dashboard/messages',      badge: msgUnread },
    { id: 'activite', label: t('activity'), icon: Heart,         path: '/dashboard/notifications', badge: actUnread },
  ]

  const isDiscoverActive = isActive('/dashboard/explorer')

  const NavItem = ({
    id, label, icon: Icon, path, badge,
  }: typeof sideItems[number]) => {
    const active = isActive(path)
    return (
      <button
        key={id}
        onClick={() => router.push(path)}
        className="flex flex-col items-center gap-0.5 flex-1 pb-1 pt-2"
      >
        {/* Icon — active gets a light pill background */}
        <div className="relative">
          <div className={cn(
            'rounded-lg px-2 py-0.5',
            active ? 'bg-emerald-50' : 'bg-transparent',
          )}>
            <Icon className={cn(
              'w-5 h-5',
              active ? 'text-emerald-500' : 'text-gray-400',
            )} />
          </div>
          {badge > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[13px] h-3 bg-red-500 text-white text-[8px] rounded-full flex items-center justify-center px-0.5 font-bold leading-none">
              {badge}
            </span>
          )}
        </div>
        <span className={cn(
          'text-[9px]',
          active ? 'font-semibold text-emerald-600' : 'font-medium text-gray-400',
        )}>
          {label}
        </span>
      </button>
    )
  }

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-end justify-around px-1 pb-2 pt-1">

        {sideItems.slice(0, 2).map(item => <NavItem key={item.id} {...item} />)}

        {/* Center — Découvrir (slightly raised) */}
        <button
          onClick={() => router.push('/dashboard/explorer')}
          className="flex flex-col items-center gap-0.5 flex-1 -translate-y-2"
        >
          <div className={cn(
            'w-12 h-12 rounded-full flex items-center justify-center shadow-md transition-colors',
            isDiscoverActive ? 'bg-emerald-600' : 'bg-emerald-500',
          )}>
            <Search className="w-5 h-5 text-white" />
          </div>
          <span className={cn(
            'text-[9px] font-semibold',
            isDiscoverActive ? 'text-emerald-600' : 'text-emerald-500',
          )}>
            {t('discover')}
          </span>
        </button>

        {sideItems.slice(2).map(item => <NavItem key={item.id} {...item} />)}

      </div>
    </nav>
  )
}
