'use client'

import { useRouter } from 'next/navigation'
import { Heart, MessageCircle, Eye, Crown, CheckCircle, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { type Notification, type NotifType } from '@/lib/mock-notifications'
import { useAuthStore } from '@/store/auth.store'

const iconConfig: Record<NotifType, { icon: React.ElementType; bg: string; color: string }> = {
  demande: { icon: Heart,         bg: 'bg-pink-100',   color: 'text-pink-500'   },
  decline: { icon: XCircle,       bg: 'bg-red-100',    color: 'text-red-500'    },
  profil:  { icon: CheckCircle,   bg: 'bg-green-100',  color: 'text-green-500'  },
  message: { icon: MessageCircle, bg: 'bg-blue-100',   color: 'text-blue-500'   },
  visite:  { icon: Eye,           bg: 'bg-purple-100', color: 'text-purple-500' },
  premium: { icon: Crown,         bg: 'bg-amber-100',  color: 'text-amber-500'  },
}

function routeFor(notif: Notification, userId: string): string {
  switch (notif.type) {
    case 'demande': return `/dashboard/profil/${notif.targetId}`
    case 'decline': return '/dashboard/explorer'
    case 'profil':  return `/dashboard/profil/${notif.targetId ?? userId}`
    case 'message': return `/dashboard/messages/${notif.targetId}`
    case 'visite':  return '/dashboard/visiteurs'
    case 'premium': return '/dashboard/premium'
  }
}

type Props = {
  notif: Notification
  onRead: (id: string) => void
}

export default function NotificationCard({ notif, onRead }: Props) {
  const router = useRouter()
  const userId = useAuthStore(s => s.currentUser.id)
  const cfg  = iconConfig[notif.type]
  const Icon = cfg.icon

  const handleClick = () => {
    onRead(notif.id)
    router.push(routeFor(notif, userId))
  }

  return (
    <button
      onClick={handleClick}
      className={cn(
        'w-full flex items-start gap-3 px-4 py-3 rounded-xl text-left transition-colors hover:brightness-95',
        notif.isRead ? 'bg-white' : 'bg-[#F0FDF4]',
      )}
    >
      <div className={cn('w-10 h-10 rounded-full flex items-center justify-center shrink-0 mt-0.5', cfg.bg)}>
        <Icon className={cn('w-5 h-5', cfg.color)} />
      </div>

      <div className="flex-1 min-w-0">
        <p className={cn('text-sm', notif.isRead ? 'text-gray-700' : 'text-gray-900 font-semibold')}>
          {notif.title}
        </p>
        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{notif.description}</p>
        <p className="text-xs text-gray-400 mt-1">{notif.date}</p>
      </div>

      {!notif.isRead && (
        <div className="w-2.5 h-2.5 bg-[#10B981] rounded-full shrink-0 mt-2" />
      )}
    </button>
  )
}
