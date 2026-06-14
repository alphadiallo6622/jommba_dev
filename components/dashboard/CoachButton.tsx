'use client'

import { usePathname } from 'next/navigation'
import { useCoachStore } from '@/store/coach.store'
import { useCurrentUser } from '@/lib/use-current-user'

export default function CoachButton() {
  const pathname = usePathname()
  const { isOpen, openCoach } = useCoachStore()
  const { avatar } = useCurrentUser()

  if (pathname.startsWith('/dashboard/messages')) return null

  return (
    <button
      onClick={openCoach}
      className={`fixed bottom-24 right-4 md:bottom-6 md:right-6 z-40 flex items-center gap-1.5 pl-0.5 pr-3 py-0.5 rounded-full shadow-lg transition-all border-2 border-amber-400 ${
        isOpen
          ? 'bg-[#059669] scale-95'
          : 'bg-[#10B981] hover:bg-[#059669] hover:scale-105'
      }`}
      aria-label="Coach"
    >
      <img
        src={avatar}
        alt="Coach"
        className="w-7 h-7 rounded-full object-cover shrink-0"
      />
      <span className="text-white text-xs font-semibold">Coach</span>
    </button>
  )
}
