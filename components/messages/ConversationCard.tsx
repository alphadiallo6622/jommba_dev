'use client'

import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import { Conversation } from '@/lib/mock-messages'

type Props = { conv: Conversation }

export default function ConversationCard({ conv }: Props) {
  const router = useRouter()
  const t = useTranslations('dashboard.messages')
  const isEmpty = conv.lastMessage === ''

  return (
    <div
      onClick={() => router.push(`/dashboard/messages/${conv.id}`)}
      className="flex items-center gap-3 bg-white rounded-xl p-4 cursor-pointer hover:bg-gray-50 transition-colors border border-gray-100 shadow-sm"
    >
      <img
        src={conv.photo}
        alt={conv.firstName}
        className="w-12 h-12 rounded-full object-cover shrink-0"
      />

      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 text-sm">
          {conv.firstName} {conv.lastInitial}.
        </p>
        <p className={cn(
          'text-xs truncate mt-0.5',
          isEmpty ? 'text-gray-300 italic' : 'text-gray-400',
        )}>
          {isEmpty ? t('startConversation') : conv.lastMessage}
        </p>
      </div>

      <div className="flex flex-col items-end gap-1 shrink-0">
        <span className="text-gray-400 text-xs">{conv.timeAgo}</span>
        {conv.unreadCount > 0 && (
          <span className="w-5 h-5 rounded-full bg-[#10B981] text-white text-xs flex items-center justify-center font-bold">
            {conv.unreadCount}
          </span>
        )}
      </div>
    </div>
  )
}
