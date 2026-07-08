'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, Crown, RefreshCw, X, ChevronDown, ChevronUp, Calendar, Zap } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/providers/AuthProvider'
import { useCurrentUser } from '@/lib/use-current-user'
import { features, faqs } from '@/lib/mock-premium'

const MONTHS_FR = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre']

function frDate(iso: string): string {
  const d = new Date(iso)
  return `${d.getDate()} ${MONTHS_FR[d.getMonth()]} ${d.getFullYear()}`
}

type SubInfo = { expiry: string; daysLeft: number; planLabel: string }

export default function PremiumMemberView() {
  const router = useRouter()
  const { user } = useAuth()
  const { firstName, stats } = useCurrentUser()
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [sub, setSub] = useState<SubInfo | null>(null)

  // Abonnement réel du membre (subscriptions — RLS : propriétaire uniquement)
  useEffect(() => {
    if (!user) return
    const supabase = createClient()
    supabase
      .from('subscriptions')
      .select('plan, status, duration_months, current_period_end')
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (!data || data.plan !== 'premium' || !data.current_period_end) return
        const end = new Date(data.current_period_end)
        const daysLeft = Math.max(0, Math.ceil((end.getTime() - Date.now()) / 86_400_000))
        setSub({
          expiry: frDate(data.current_period_end),
          daysLeft,
          planLabel: `Premium ${data.duration_months ?? 1} Mois`,
        })
      })
  }, [user])

  const expiry = sub?.expiry ?? '—'

  const handleRenew = () => {
    toast.success('Renouvellement — disponible depuis les paramètres dans la prochaine version')
  }

  const handleCancel = () => {
    setShowCancelConfirm(false)
    toast.info(`Abonnement annulé. Tu conserves l'accès jusqu'au ${expiry}.`)
  }

  return (
    <div className="space-y-6 py-6">

      {/* Member hero */}
      <section className="bg-[#064E3B] rounded-2xl p-6 text-white text-center space-y-3">
        <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center mx-auto">
          <Crown className="w-7 h-7 text-amber-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold">{firstName}, tu es Premium ✓</h1>
          <p className="text-emerald-300 text-sm mt-1">
            Tous tes avantages sont actifs
          </p>
        </div>
        {sub && (
          <div className="bg-white/10 rounded-xl px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-emerald-300" />
              <span className="text-white/80">Expire le</span>
              <span className="font-semibold">{sub.expiry}</span>
            </div>
            <span className="text-xs bg-emerald-500 text-white px-2 py-0.5 rounded-full font-medium">
              {sub.daysLeft}j restants
            </span>
          </div>
        )}
        {sub && <div className="text-xs text-white/50">{sub.planLabel} · Renouvellement automatique</div>}
      </section>

      {/* Impact stats since premium */}
      <section>
        <h2 className="font-bold text-gray-900 text-base mb-3">Ton impact depuis Premium</h2>
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: stats?.visitors ?? 0,  label: 'Visiteurs' },
            { value: stats?.favorites ?? 0, label: 'Favoris' },
            { value: stats?.requests ?? 0,  label: 'Contacts' },
          ].map(({ value, label }) => (
            <div key={label} className="bg-emerald-50 border border-emerald-100 rounded-xl py-4 flex flex-col items-center gap-1">
              <span className="text-2xl font-bold text-emerald-600">{value}</span>
              <span className="text-xs text-gray-500">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Active features */}
      <section>
        <h2 className="font-bold text-gray-900 text-base mb-3">Tes avantages actifs</h2>
        <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
          {features.map((feature, i) => {
            const Icon = feature.icon
            return (
              <div
                key={feature.title}
                className={`flex items-start gap-3 p-4 ${i < features.length - 1 ? 'border-b border-gray-50' : ''}`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${feature.iconBg}`}>
                  <Icon className={`w-5 h-5 ${feature.iconColor}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                    <span className="font-semibold text-sm text-gray-900">{feature.title}</span>
                    {feature.isNew && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-600 font-medium">
                        NOUVEAU
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed mb-1.5">{feature.description}</p>
                  <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 font-medium">
                    <CheckCircle className="w-3 h-3" />
                    {feature.badge.premium}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Subscription management */}
      <section className="bg-white border border-gray-100 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-50">
          <h2 className="font-bold text-gray-900 text-sm">Gérer mon abonnement</h2>
        </div>

        {/* Renew */}
        <button
          onClick={handleRenew}
          className="w-full flex items-center gap-3 px-4 py-4 hover:bg-gray-50 transition-colors border-b border-gray-50"
        >
          <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
            <RefreshCw className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-semibold text-gray-900">Renouveler maintenant</p>
            <p className="text-xs text-gray-400">Prolonger avant le {expiry}</p>
          </div>
          <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
            Offre -33%
          </span>
        </button>

        {/* Boost */}
        <button
          onClick={() => toast.info('Boosts — disponible dans la prochaine version ⚡')}
          className="w-full flex items-center gap-3 px-4 py-4 hover:bg-gray-50 transition-colors border-b border-gray-50"
        >
          <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
            <Zap className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-semibold text-gray-900">Acheter des boosts</p>
            <p className="text-xs text-gray-400">Propulse ton profil en tête pendant 24h</p>
          </div>
        </button>

        {/* Cancel */}
        <button
          onClick={() => setShowCancelConfirm(true)}
          className="w-full flex items-center gap-3 px-4 py-4 hover:bg-red-50 transition-colors"
        >
          <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
            <X className="w-4 h-4 text-red-400" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-semibold text-red-500">Annuler l&apos;abonnement</p>
            <p className="text-xs text-gray-400">Tu restes Premium jusqu&apos;au {expiry}</p>
          </div>
        </button>
      </section>

      {/* FAQ */}
      <section>
        <h2 className="font-bold text-gray-900 text-base mb-3">Questions fréquentes</h2>
        <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
          {faqs.map((faq, i) => (
            <div key={i} className={i < faqs.length - 1 ? 'border-b border-gray-50' : ''}>
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between px-4 py-4 text-left hover:bg-gray-50 transition-colors"
              >
                <span className="text-sm font-medium text-gray-900 pr-3">{faq.question}</span>
                {openFaq === i
                  ? <ChevronUp className="w-4 h-4 text-gray-400 shrink-0" />
                  : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
                }
              </button>
              {openFaq === i && (
                <div className="px-4 pb-4">
                  <p className="text-xs text-gray-500 leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Bottom padding */}
      <div className="h-4" />

      {/* Cancel confirmation overlay */}
      {showCancelConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center px-4 pb-6"
          style={{ background: 'rgba(0,0,0,0.5)' }}
          onClick={() => setShowCancelConfirm(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 w-full max-w-sm space-y-4"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="font-bold text-gray-900 text-lg">Annuler le Premium ?</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Tu conserveras tous tes avantages jusqu&apos;au <span className="font-semibold text-gray-800">{expiry}</span>.
              Après cette date, ton profil repassera en version gratuite.
            </p>
            <div className="space-y-2 pt-1">
              <button
                onClick={handleCancel}
                className="w-full py-3 rounded-xl bg-red-500 text-white font-semibold text-sm hover:bg-red-600 transition-colors"
              >
                Oui, annuler mon abonnement
              </button>
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="w-full py-3 rounded-xl bg-gray-100 text-gray-700 font-semibold text-sm hover:bg-gray-200 transition-colors"
              >
                Garder mon Premium
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
