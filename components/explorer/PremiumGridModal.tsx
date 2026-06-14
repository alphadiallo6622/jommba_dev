'use client'

import { LayoutGrid, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useExplorerStore } from '@/store/explorer.store'
import { useCurrentUser } from '@/lib/use-current-user'

export default function PremiumGridModal() {
  const router = useRouter()
  const { showPremiumModal, setShowPremiumModal } = useExplorerStore()
  const { isPremium } = useCurrentUser()

  if (!showPremiumModal || isPremium) return null

  const handlePremium = () => {
    setShowPremiumModal(false)
    router.push('/dashboard/premium')
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-6"
      style={{ background: 'rgba(0,0,0,0.55)' }}
    >
      <div className="bg-white rounded-2xl p-8 w-full max-w-sm shadow-2xl space-y-6">
        {/* Close */}
        <div className="flex justify-end">
          <button
            onClick={() => setShowPremiumModal(false)}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Icon */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-amber-100 mx-auto flex items-center justify-center">
            <LayoutGrid className="w-7 h-7 text-amber-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Vue Grille Premium</h2>
          <p className="text-sm text-gray-500 leading-relaxed">
            Tu as utilisé tous tes essais gratuits.<br />
            Passe Premium pour un accès illimité !
          </p>
        </div>

        {/* Avantages */}
        <div className="space-y-2">
          {['Vue grille illimitée', 'Voir qui visite ton profil', 'Demandes illimitées'].map(avantage => (
            <div key={avantage} className="bg-amber-50 rounded-xl px-4 py-3 flex items-center gap-3">
              <span className="text-amber-500 font-bold">✓</span>
              <span className="text-sm font-medium text-gray-800">{avantage}</span>
            </div>
          ))}
        </div>

        <button
          onClick={handlePremium}
          className="w-full bg-amber-600 text-white py-3 rounded-xl font-semibold text-sm hover:bg-amber-500 transition-colors"
        >
          ⭐ Passer Premium ›
        </button>
      </div>
    </div>
  )
}
