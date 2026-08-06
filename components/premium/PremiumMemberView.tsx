'use client'

import { useState, useEffect } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { CheckCircle, Crown, RefreshCw, X, ChevronDown, ChevronUp, Calendar, Zap } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/providers/AuthProvider'
import { useCurrentUser } from '@/lib/use-current-user'
import { features } from '@/lib/mock-premium'

type SubInfo = { expiry: string; daysLeft: number; durationMonths: number }
type FeatureItem = { title: string; description: string; free: string; premium: string }
type FaqItem = { question: string; answer: string }

export default function PremiumMemberView() {
  const router = useRouter()
  const t = useTranslations('dashboard.premium.member')
  const tf = useTranslations('dashboard.premium.features')
  const tFaq = useTranslations('dashboard.premium.faq')
  const locale = useLocale()
  const { user } = useAuth()
  const { firstName, stats } = useCurrentUser()
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [sub, setSub] = useState<SubInfo | null>(null)

  const featureItems = tf.raw('items') as FeatureItem[]
  const faqs = tFaq.raw('items') as FaqItem[]

  // Date localisée via Intl (fr/en) — pas de mois codés en dur.
  const localizedDate = (iso: string): string =>
    new Date(iso).toLocaleDateString(locale === 'en' ? 'en-GB' : 'fr-FR', {
      day: 'numeric', month: 'long', year: 'numeric',
    })

  // Abonnement réel du membre (subscriptions — RLS : propriétaire uniquement).
  // `subscriptions` est un historique : une ligne par achat, plus la ligne
  // 'free' posée à l'inscription. On isole donc le cycle EN COURS avec les
  // mêmes critères que GET /api/subscription/me (Premium actif, non remboursé,
  // période non échue, le plus récent d'abord).
  useEffect(() => {
    if (!user) return
    const supabase = createClient()
    supabase
      .from('subscriptions')
      .select('plan, status, duration_months, current_period_end')
      .eq('user_id', user.id)
      .eq('plan', 'premium')
      .eq('status', 'active')
      .is('refunded_at', null)
      .gt('current_period_end', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) {
          console.error('[PremiumMemberView] lecture subscriptions échouée:', error)
          return
        }
        if (!data?.current_period_end) return
        const end = new Date(data.current_period_end)
        const daysLeft = Math.max(0, Math.ceil((end.getTime() - Date.now()) / 86_400_000))
        setSub({
          expiry: localizedDate(data.current_period_end),
          daysLeft,
          durationMonths: data.duration_months ?? 1,
        })
      })
  }, [user, locale])

  const expiry = sub?.expiry ?? '—'

  const handleRenew = () => {
    toast.success(t('renewToast'))
  }

  const handleCancel = () => {
    setShowCancelConfirm(false)
    toast.info(t('cancelledToast', { date: expiry }))
  }

  return (
    <div className="space-y-6 py-6">

      {/* Member hero */}
      <section className="bg-[#064E3B] rounded-2xl p-6 text-white text-center space-y-3">
        <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center mx-auto">
          <Crown className="w-7 h-7 text-amber-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold">{t('title', { name: firstName })}</h1>
          <p className="text-emerald-300 text-sm mt-1">
            {t('allActive')}
          </p>
        </div>
        {sub && (
          <div className="bg-white/10 rounded-xl px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-emerald-300" />
              <span className="text-white/80">{t('expiresOn')}</span>
              <span className="font-semibold">{sub.expiry}</span>
            </div>
            <span className="text-xs bg-emerald-500 text-white px-2 py-0.5 rounded-full font-medium">
              {t('daysLeft', { n: sub.daysLeft })}
            </span>
          </div>
        )}
        {sub && <div className="text-xs text-white/50">{t('planLine', { plan: t('planLabel', { n: sub.durationMonths }) })}</div>}
      </section>

      {/* Impact stats since premium */}
      <section>
        <h2 className="font-bold text-gray-900 text-base mb-3">{t('impactTitle')}</h2>
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: stats?.visitors ?? 0,  label: t('visitors') },
            { value: stats?.favorites ?? 0, label: t('favorites') },
            { value: stats?.requests ?? 0,  label: t('contacts') },
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
        <h2 className="font-bold text-gray-900 text-base mb-3">{t('activeFeaturesTitle')}</h2>
        <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
          {features.map((feature, i) => {
            const Icon = feature.icon
            const item = featureItems[i]
            return (
              <div
                key={i}
                className={`flex items-start gap-3 p-4 ${i < features.length - 1 ? 'border-b border-gray-50' : ''}`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${feature.iconBg}`}>
                  <Icon className={`w-5 h-5 ${feature.iconColor}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                    <span className="font-semibold text-sm text-gray-900">{item.title}</span>
                    {feature.isNew && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-600 font-medium">
                        {t('new')}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed mb-1.5">{item.description}</p>
                  <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 font-medium">
                    <CheckCircle className="w-3 h-3" />
                    {item.premium}
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
          <h2 className="font-bold text-gray-900 text-sm">{t('manageTitle')}</h2>
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
            <p className="text-sm font-semibold text-gray-900">{t('renewTitle')}</p>
            <p className="text-xs text-gray-400">{t('renewSub', { date: expiry })}</p>
          </div>
          <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
            {t('renewOffer')}
          </span>
        </button>

        {/* Boost */}
        <button
          onClick={() => toast.info(t('boostToast'))}
          className="w-full flex items-center gap-3 px-4 py-4 hover:bg-gray-50 transition-colors border-b border-gray-50"
        >
          <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
            <Zap className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-semibold text-gray-900">{t('boostTitle')}</p>
            <p className="text-xs text-gray-400">{t('boostSub')}</p>
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
            <p className="text-sm font-semibold text-red-500">{t('cancelTitle')}</p>
            <p className="text-xs text-gray-400">{t('cancelSub', { date: expiry })}</p>
          </div>
        </button>
      </section>

      {/* FAQ */}
      <section>
        <h2 className="font-bold text-gray-900 text-base mb-3">{t('faqTitle')}</h2>
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
            <h3 className="font-bold text-gray-900 text-lg">{t('cancelModalTitle')}</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              {t('cancelModalBodyPrefix')}<span className="font-semibold text-gray-800">{expiry}</span>{t('cancelModalBodySuffix')}
            </p>
            <div className="space-y-2 pt-1">
              <button
                onClick={handleCancel}
                className="w-full py-3 rounded-xl bg-red-500 text-white font-semibold text-sm hover:bg-red-600 transition-colors"
              >
                {t('cancelConfirm')}
              </button>
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="w-full py-3 rounded-xl bg-gray-100 text-gray-700 font-semibold text-sm hover:bg-gray-200 transition-colors"
              >
                {t('cancelKeep')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
