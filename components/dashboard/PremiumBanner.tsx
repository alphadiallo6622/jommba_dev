'use client'

import { Crown, CheckCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCurrentUser } from '@/lib/use-current-user'

export default function PremiumBanner() {
  const router = useRouter()
  const { isPremium, firstName } = useCurrentUser()

  if (isPremium) {
    return (
      <div
        className="rounded-xl p-4 flex items-center gap-3"
        style={{ background: 'linear-gradient(135deg, #065F46 0%, #064E3B 100%)' }}
      >
        <div className="shrink-0 w-9 h-9 rounded-full bg-amber-500/20 flex items-center justify-center">
          <Crown className="w-5 h-5 text-amber-400" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-white font-bold text-sm">Membre Premium</span>
            <span className="text-xs font-semibold bg-amber-500 text-white px-2 py-0.5 rounded-full">ACTIF</span>
          </div>
          <p className="text-xs text-emerald-200 mt-0.5 leading-snug">
            Bienvenue {firstName} ! Tu profites de tous les avantages Premium.
          </p>
        </div>
        <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
      </div>
    )
  }

  return (
    <div
      className="rounded-xl p-4 flex items-center justify-between gap-3"
      style={{ background: '#064E3B' }}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="shrink-0 w-9 h-9 rounded-full bg-amber-500/20 flex items-center justify-center">
          <Crown className="w-5 h-5 text-amber-400" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-white font-bold text-sm">Passe Premium</span>
            <span className="text-xs font-semibold bg-amber-500 text-white px-2 py-0.5 rounded-full">48%</span>
          </div>
          <p className="text-xs text-emerald-200 mt-0.5 leading-snug">
            Demandes illimitées, profil mis en avant, badge Premium
          </p>
        </div>
      </div>
      <button
        onClick={() => router.push('/dashboard/premium')}
        className="shrink-0 text-sm font-semibold text-white px-4 py-2 rounded-lg transition-opacity hover:opacity-90 whitespace-nowrap"
        style={{ background: '#D97706' }}
      >
        Découvrir →
      </button>
    </div>
  )
}
