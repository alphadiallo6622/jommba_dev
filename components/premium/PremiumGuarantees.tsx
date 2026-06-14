import { RotateCcw, Shield, Lock } from 'lucide-react'

const guarantees = [
  { icon: RotateCcw, text: 'Annulable à tout moment, en 1 clic depuis les paramètres' },
  { icon: Shield,    text: "Sans engagement, tu gardes tes avantages jusqu'à la fin"  },
  { icon: Lock,      text: 'Paiement 100% sécurisé, données jamais partagées'         },
]

export default function PremiumGuarantees() {
  return (
    <section className="py-2">
      <div className="bg-yellow-50 border border-amber-200 rounded-xl p-4 flex flex-col gap-3">
        {guarantees.map(({ icon: Icon, text }) => (
          <div key={text} className="flex items-center gap-3">
            <Icon className="w-4 h-4 text-emerald-500 shrink-0" />
            <span className="text-sm text-gray-700">{text}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
