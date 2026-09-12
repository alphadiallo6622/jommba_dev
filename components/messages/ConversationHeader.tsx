'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { ArrowLeft, Heart, Clock, MoreVertical, ChevronRight, Lock, LockOpen, User, Ban, Flag } from 'lucide-react'
import { Conversation } from '@/lib/mock-messages'
import ConfirmActionModal from './ConfirmActionModal'

type Props = {
  conv: Conversation
  msgsRemaining: number
  msgsTotal?: number
  /** Blocage du membre — la discussion se ferme ensuite (géré par le parent). */
  onBlock: () => Promise<void>
  /** Signalement du membre à la modération. */
  onReport: () => Promise<void>
}

export default function ConversationHeader({ conv, msgsRemaining, msgsTotal = 30, onBlock, onReport }: Props) {
  const router    = useRouter()
  const t         = useTranslations('dashboard.messages.conv')
  const [menuOpen,    setMenuOpen]    = useState(false)
  const [showTooltip, setShowTooltip] = useState(false)
  // Action de modération en attente de confirmation dans la feuille.
  const [confirming,  setConfirming]  = useState<null | 'block' | 'report'>(null)
  const [pending,     setPending]     = useState(false)

  const fullName = `${conv.firstName} ${conv.lastInitial}.`

  const runConfirmed = async () => {
    if (!confirming) return
    setPending(true)
    try {
      await (confirming === 'block' ? onBlock() : onReport())
      setConfirming(null)
    } finally {
      setPending(false)
    }
  }

  const contactsUnlocked = msgsRemaining === 0

  // Progression purement visuelle vers le déblocage de l'échange de contacts.
  const progress = Math.min(100, Math.max(0, ((msgsTotal - msgsRemaining) / msgsTotal) * 100))

  const handleLockClick = () => {
    setShowTooltip(true)
    setTimeout(() => setShowTooltip(false), 3000)
  }

  const handleViewProfile = () => {
    setMenuOpen(false)
    router.push(`/dashboard/profil/${conv.id}`)
  }

  return (
    <div className="relative shrink-0 z-10">
      {/* Main header row */}
      <div className="flex items-center gap-2 px-2.5 sm:px-4 py-2.5 bg-white/90 backdrop-blur-md border-b border-gray-100">
        {/* Back */}
        <button
          onClick={() => router.push('/dashboard/messages')}
          className="w-9 h-9 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-700 active:scale-95 transition-all shrink-0"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* Avatar */}
        <div className="relative shrink-0">
          <img
            src={conv.photo}
            alt={conv.firstName}
            className="w-10 h-10 rounded-full object-cover ring-2 ring-[#10B981]/25 ring-offset-2 ring-offset-white"
          />
        </div>

        {/* Name + time */}
        <div className="flex-1 min-w-0 ml-0.5">
          <p className="font-semibold text-gray-900 text-[15px] leading-tight truncate">
            {conv.firstName} {conv.lastInitial}.
          </p>
          <p className="text-gray-400 text-[11px] flex items-center gap-0.5 mt-0.5 truncate">
            {conv.timeAgo} <ChevronRight className="w-3 h-3 shrink-0" />
          </p>
        </div>

        {/* Message counter pill */}
        <button
          onClick={handleLockClick}
          className="flex items-center gap-1.5 bg-gradient-to-r from-[#10B981] to-[#059669] text-white text-[11px] pl-2.5 pr-2 py-1.5 rounded-full font-semibold shrink-0 shadow-[0_2px_10px_-2px_rgba(16,185,129,0.6)] hover:brightness-105 active:scale-95 transition-all"
        >
          <Heart className="w-3 h-3 fill-white shrink-0" />
          <span className="tabular-nums whitespace-nowrap">{t('counter', { count: msgsRemaining })}</span>
          <Clock className="w-3 h-3 opacity-70 shrink-0" />
        </button>

        {/* Lock icon */}
        <button
          onClick={handleLockClick}
          className={`w-9 h-9 rounded-full border flex items-center justify-center shrink-0 active:scale-95 transition-all ${
            contactsUnlocked
              ? 'border-[#10B981]/30 bg-[#E1F5EE] hover:bg-[#d1eee3]'
              : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
          }`}
        >
          {contactsUnlocked
            ? <LockOpen className="w-4 h-4 text-emerald-600" />
            : <Lock className="w-4 h-4 text-gray-400" />
          }
        </button>

        {/* 3-dot menu */}
        <div className="relative shrink-0">
          <button
            onClick={() => setMenuOpen(v => !v)}
            className="w-9 h-9 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 active:scale-95 transition-all"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-11 bg-white rounded-2xl shadow-xl shadow-gray-900/10 border border-gray-100 p-1 min-w-[210px] z-20 origin-top-right animate-fade-in-up">
                <button
                  onClick={handleViewProfile}
                  className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 flex items-center gap-2.5 hover:bg-gray-50 transition-colors"
                >
                  <User className="w-4 h-4 text-gray-400 shrink-0" />
                  {t('viewProfile')}
                </button>

                <div className="my-1 h-px bg-gray-100" />

                <button
                  onClick={() => { setMenuOpen(false); setConfirming('block') }}
                  className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 flex items-center gap-2.5 hover:bg-gray-50 transition-colors"
                >
                  <Ban className="w-4 h-4 text-gray-400 shrink-0" />
                  {t('block')}
                </button>

                <button
                  onClick={() => { setMenuOpen(false); setConfirming('report') }}
                  className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 flex items-center gap-2.5 hover:bg-red-50 transition-colors"
                >
                  <Flag className="w-4 h-4 text-red-400 shrink-0" />
                  {t('report')}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Progress vers le déblocage des contacts — purement indicatif */}
      <div className="h-[3px] bg-gray-100">
        <div
          className="h-full bg-gradient-to-r from-[#34D399] to-[#10B981] transition-[width] duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Confirmation de blocage / signalement */}
      {confirming === 'block' && (
        <ConfirmActionModal
          icon={<Ban className="w-6 h-6" />}
          tone="danger"
          title={t('blockTitle', { name: fullName })}
          description={t('blockDesc')}
          confirmLabel={t('block')}
          cancelLabel={t('cancel')}
          pending={pending}
          onConfirm={runConfirmed}
          onCancel={() => setConfirming(null)}
        />
      )}

      {confirming === 'report' && (
        <ConfirmActionModal
          icon={<Flag className="w-6 h-6" />}
          tone="warning"
          title={t('reportTitle', { name: fullName })}
          description={t('reportDesc')}
          confirmLabel={t('report')}
          cancelLabel={t('cancel')}
          pending={pending}
          onConfirm={runConfirmed}
          onCancel={() => setConfirming(null)}
        />
      )}

      {/* Tooltip banner — appears below header, covers conversation top */}
      {showTooltip && (
        <div className="absolute left-0 right-0 top-full z-30 px-3 pt-2">
          <div className="mx-auto max-w-md rounded-2xl bg-gray-900/92 backdrop-blur text-white text-xs font-medium text-center py-2.5 px-4 shadow-xl shadow-gray-900/20 animate-fade-in-up">
            {contactsUnlocked
              ? t('unlockedTooltip')
              : t('lockedTooltip', { count: msgsRemaining })
            }
          </div>
        </div>
      )}
    </div>
  )
}
