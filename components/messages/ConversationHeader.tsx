'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { ArrowLeft, Heart, Clock, MoreVertical, ChevronRight, Lock, LockOpen, User } from 'lucide-react'
import { Conversation } from '@/lib/mock-messages'

type Props = {
  conv: Conversation
  msgsRemaining: number
}

export default function ConversationHeader({ conv, msgsRemaining }: Props) {
  const router    = useRouter()
  const t         = useTranslations('dashboard.messages.conv')
  const [menuOpen,    setMenuOpen]    = useState(false)
  const [showTooltip, setShowTooltip] = useState(false)

  const contactsUnlocked = msgsRemaining === 0

  const handleLockClick = () => {
    setShowTooltip(true)
    setTimeout(() => setShowTooltip(false), 3000)
  }

  const handleViewProfile = () => {
    setMenuOpen(false)
    router.push(`/dashboard/profil/${conv.id}`)
  }

  return (
    <div className="relative shrink-0">
      {/* Main header row */}
      <div className="flex items-center gap-2 px-3 py-2.5 bg-white border-b border-gray-100">
        {/* Back */}
        <button
          onClick={() => router.push('/dashboard/messages')}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors shrink-0"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>

        {/* Avatar */}
        <img
          src={conv.photo}
          alt={conv.firstName}
          className="w-9 h-9 rounded-full object-cover shrink-0"
        />

        {/* Name + time */}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 text-sm leading-tight">
            {conv.firstName} {conv.lastInitial}.
          </p>
          <p className="text-gray-400 text-xs flex items-center gap-0.5">
            {conv.timeAgo} <ChevronRight className="w-3 h-3" />
          </p>
        </div>

        {/* Message counter pill */}
        <button
          onClick={handleLockClick}
          className="flex items-center gap-1 bg-[#10B981] text-white text-[11px] px-2.5 py-1.5 rounded-full font-semibold shrink-0"
        >
          <Heart className="w-3 h-3 fill-white" />
          <span>{t('counter', { count: msgsRemaining })}</span>
          <Clock className="w-3 h-3 opacity-70" />
        </button>

        {/* Lock icon */}
        <button
          onClick={handleLockClick}
          className="w-8 h-8 rounded-full border border-gray-200 bg-gray-50 flex items-center justify-center shrink-0 hover:bg-gray-100 transition-colors"
        >
          {contactsUnlocked
            ? <LockOpen className="w-4 h-4 text-emerald-500" />
            : <Lock className="w-4 h-4 text-gray-400" />
          }
        </button>

        {/* 3-dot menu */}
        <div className="relative shrink-0">
          <button
            onClick={() => setMenuOpen(v => !v)}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <MoreVertical className="w-4 h-4 text-gray-500" />
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-10 bg-white rounded-xl shadow-lg border border-gray-100 py-1 min-w-[180px] z-20">
                <button
                  onClick={handleViewProfile}
                  className="w-full text-left px-4 py-3 text-sm text-gray-700 flex items-center gap-2.5 hover:bg-gray-50 transition-colors"
                >
                  <User className="w-4 h-4 text-gray-400 shrink-0" />
                  {t('viewProfile')}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Tooltip banner — appears below header, covers conversation top */}
      {showTooltip && (
        <div className="absolute left-0 right-0 top-full z-30 bg-gray-900/90 text-white text-xs font-medium text-center py-2.5 px-4 shadow-lg">
          {contactsUnlocked
            ? t('unlockedTooltip')
            : t('lockedTooltip', { count: msgsRemaining })
          }
        </div>
      )}
    </div>
  )
}
