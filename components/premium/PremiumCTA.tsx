'use client'

import { Crown, Shield } from 'lucide-react'
import { toast } from 'sonner'

export default function PremiumCTA() {
  return (
    <section className="py-4">
      <button
        onClick={() => toast.success('Paiement bientôt disponible 🔒')}
        className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold text-lg py-4 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-md"
      >
        <Crown className="w-5 h-5" />
        Devenir membre Premium
      </button>

      <p className="text-center text-xs text-gray-400 mt-3">
        Activation instantanée • Annulable en 1 clic
      </p>
      <p className="text-center text-xs text-gray-400 mt-1 flex items-center justify-center gap-1">
        <Shield className="w-3 h-3" />
        Bissrys &amp; PayTech certifiés
      </p>
    </section>
  )
}
