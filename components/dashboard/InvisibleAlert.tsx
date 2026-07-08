'use client'

import { AlertTriangle, PauseCircle, MessageCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCurrentUser } from '@/lib/use-current-user'
import { useVisibilityStore } from '@/store/visibility.store'
import { MIN_VISIBLE_PROFILE_COMPLETION } from '@/lib/constants'

export default function InvisibleAlert() {
  const router = useRouter()
  const { profileCompletion } = useCurrentUser()
  const mode = useVisibilityStore(s => s.mode)

  if (mode === 'pause') {
    return (
      <div className="flex flex-col gap-2">
        <div className="rounded-xl p-4 bg-red-50 border border-red-200 flex items-center gap-3">
          <PauseCircle className="w-5 h-5 text-red-500 shrink-0" />
          <div>
            <p className="font-bold text-red-700 text-sm">Ton profil est invisible !</p>
            <p className="text-xs text-red-500 mt-0.5">Personne ne peut te trouver dans les recherches.</p>
          </div>
        </div>
        <div className="rounded-xl px-4 py-2.5 bg-amber-50 border border-amber-200">
          <p className="text-xs text-amber-700">⏸️ <span className="font-semibold">Mode pause activé</span> — Réactive ton profil pour redevenir visible.</p>
        </div>
      </div>
    )
  }

  if (mode === 'discussion') {
    return (
      <div className="flex flex-col gap-2">
        <div className="rounded-xl p-4 bg-pink-50 border border-pink-200 flex items-center gap-3">
          <MessageCircle className="w-5 h-5 text-pink-500 shrink-0" />
          <div>
            <p className="font-bold text-pink-700 text-sm">Tu es en discussion sérieuse.</p>
            <p className="text-xs text-pink-500 mt-0.5">Personne ne peut te contacter pour le moment.</p>
          </div>
        </div>
        <div className="rounded-xl px-4 py-2.5 bg-pink-50 border border-pink-200">
          <p className="text-xs text-pink-600">💬 <span className="font-semibold">Mode En Discussion activé</span> — Tu apparais avec un badge spécial.</p>
        </div>
      </div>
    )
  }

  if (profileCompletion >= MIN_VISIBLE_PROFILE_COMPLETION) return null

  return (
    <div className="rounded-xl p-4 border border-amber-200" style={{ background: '#FEF3C7' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <span className="font-bold text-gray-900 text-sm">Ton profil est invisible</span>
        </div>
        <span className="text-amber-700 font-bold text-sm">{profileCompletion}%</span>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-amber-200 rounded-full overflow-hidden mb-3">
        <div
          className="h-full bg-amber-500 rounded-full transition-all"
          style={{ width: `${profileCompletion}%` }}
        />
      </div>

      {/* Description */}
      <p className="text-gray-600 text-xs mb-4 leading-relaxed">
        Personne ne peut voir ton profil tant qu&rsquo;il n&rsquo;est pas complet. Remplis-le pour devenir visible&nbsp;!
      </p>

      {/* CTA button */}
      <button
        onClick={() => router.push('/dashboard/parametres')}
        className="w-full py-2.5 rounded-lg text-white text-sm font-semibold transition-opacity hover:opacity-90"
        style={{ background: '#10B981' }}
      >
        Compléter mon profil →
      </button>
    </div>
  )
}
