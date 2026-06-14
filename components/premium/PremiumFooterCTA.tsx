'use client'

import { Crown, Shield, UserCheck, Calendar } from 'lucide-react'
import { toast } from 'sonner'
import { useCurrentUser } from '@/lib/use-current-user'

const securityBadges = [
  {
    icon: Shield,
    title: 'Paiement 100% sécurisé',
    sub: 'Bissrys & PayTech certifiés',
  },
  {
    icon: UserCheck,
    title: 'Profils vérifiés manuellement',
    sub: 'Notre équipe valide chaque inscription',
  },
  {
    icon: Calendar,
    title: 'Sans engagement',
    sub: 'Pas de renouvellement surprise',
  },
]

export default function PremiumFooterCTA() {
  const { firstName } = useCurrentUser()

  return (
    <section className="py-6 pb-12">
      {/* Security badges */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        {securityBadges.map(({ icon: Icon, title, sub }) => (
          <div key={title} className="flex flex-col items-center text-center gap-1.5">
            <Icon className="w-5 h-5 text-emerald-500" />
            <span className="text-xs font-semibold text-gray-800 leading-tight">{title}</span>
            <span className="text-[10px] text-gray-400 leading-tight">{sub}</span>
          </div>
        ))}
      </div>

      {/* Dark CTA block */}
      <div className="bg-emerald-900 rounded-2xl p-10 text-center text-white">
        <p className="font-serif text-2xl font-bold mb-4 leading-snug">
          {firstName}, le bon moment c&apos;est maintenant
        </p>
        <p className="text-emerald-200 text-sm mb-2">
          Chaque jour tu l&apos;attends, c&apos;est peut-être la future épouse que tu ne découvres pas.
        </p>
        <p className="text-emerald-200 text-sm mb-8">
          Fais le premier pas vers ton avenir.
        </p>

        <button
          onClick={() => toast.success('Paiement bientôt disponible 🔒')}
          className="bg-white text-emerald-900 font-semibold px-8 py-3 rounded-xl hover:bg-gray-100 transition-colors inline-flex items-center gap-2 mx-auto"
        >
          <Crown className="w-5 h-5" />
          Passer Premium
        </button>

        <p className="text-emerald-300 text-xs mt-8 italic opacity-80">
          &ldquo;Et parmi Ses signes, il a créé pour vous des épouses.&rdquo; — Sourate Al-Rum, 30:21
        </p>
      </div>
    </section>
  )
}
