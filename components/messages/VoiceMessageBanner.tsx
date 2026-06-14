'use client'

import { Mic, ChevronRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useCurrentUser } from '@/lib/use-current-user'

export default function VoiceMessageBanner() {
  const router = useRouter()
  const { isPremium } = useCurrentUser()

  if (isPremium) {
    return (
      <div
        className="flex items-center gap-3 bg-[#064E3B] rounded-xl p-4 mb-4 cursor-pointer hover:opacity-95 transition-opacity"
        onClick={() => toast.info('Messages vocaux — disponible dans la prochaine version 🎤')}
      >
        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
          <Mic className="w-5 h-5 text-[#10B981]" />
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-white font-semibold text-sm">Messages vocaux</span>
            <span className="bg-[#10B981] text-white text-xs px-2 py-0.5 rounded-full font-medium">
              ACTIF
            </span>
          </div>
          <p className="text-emerald-300 text-xs mt-0.5">
            Envoie des messages vocaux à tes contacts →
          </p>
        </div>

        <ChevronRight className="w-5 h-5 text-white/40 shrink-0" />
      </div>
    )
  }

  return (
    <div
      className="flex items-center gap-3 bg-[#D97706] rounded-xl p-4 mb-4 cursor-pointer hover:opacity-95 transition-opacity"
      onClick={() => router.push('/dashboard/premium')}
    >
      <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
        <Mic className="w-5 h-5 text-white" />
      </div>

      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="text-white font-semibold text-sm">Messages vocaux</span>
          <span className="bg-[#10B981] text-white text-xs px-2 py-0.5 rounded-full font-medium">
            NOUVEAU
          </span>
        </div>
        <p className="text-white/80 text-xs mt-0.5">
          Fais entendre ta voix ! Exclusif Premium →
        </p>
      </div>

      <ChevronRight className="w-5 h-5 text-white/70 shrink-0" />
    </div>
  )
}
