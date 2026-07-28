'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations, useLocale } from 'next-intl'
import { Crown, Receipt, Calendar, CheckCircle, FileText, Zap, RotateCcw } from 'lucide-react'
import SettingsDrawer from '../SettingsDrawer'
import { useAuth } from '@/components/providers/AuthProvider'
import type { SubscriptionSummary, SubscriptionTransaction } from '@/app/api/subscription/me/route'

type Props = { open: boolean; onClose: () => void }
type Tab = 'subscription' | 'history'

export default function SubscriptionPanel({ open, onClose }: Props) {
  const router = useRouter()
  const t = useTranslations('dashboard.parametres.subscription')
  const locale = useLocale()
  const { user } = useAuth()

  const [tab, setTab] = useState<Tab>('subscription')
  // `loading` reste vrai tant que le fetch d'ouverture n'a pas répondu ; il est
  // remis à vrai par la fermeture du panneau (voir handleClose).
  const [loading, setLoading] = useState(true)
  const [subscription, setSubscription] = useState<SubscriptionSummary | null>(null)
  const [transactions, setTransactions] = useState<SubscriptionTransaction[]>([])

  // Charge à chaque ouverture : un achat a pu avoir lieu entre deux ouvertures.
  useEffect(() => {
    if (!open || !user) return
    let cancelled = false
    fetch('/api/subscription/me')
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('fetch failed'))))
      .then((data: { subscription: SubscriptionSummary | null; transactions: SubscriptionTransaction[] }) => {
        if (cancelled) return
        setSubscription(data.subscription)
        setTransactions(data.transactions ?? [])
      })
      .catch(() => {
        if (!cancelled) { setSubscription(null); setTransactions([]) }
      })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [open, user])

  // Réinitialise à la fermeture : la prochaine ouverture repart de l'onglet
  // Abonnement et réaffiche le skeleton pendant le rechargement.
  const handleClose = () => {
    setTab('subscription')
    setLoading(true)
    onClose()
  }

  const localizedDate = (iso: string) =>
    new Date(iso).toLocaleDateString(locale === 'en' ? 'en-GB' : 'fr-FR', {
      day: 'numeric', month: 'long', year: 'numeric',
    })

  const money = (usd: number | null) =>
    usd == null ? '—' : `${usd.toFixed(2).replace(/\.00$/, '')} $`

  /** « 3 mois » à partir de duration_months. La colonne est un entier : le plan
   *  15 jours y est stocké arrondi à 1 mois, d'où le repli sur les jours si une
   *  valeur fractionnaire venait à apparaître. */
  const durationLabel = (months: number | null) => {
    if (months == null) return '—'
    if (months < 1) return t('durationDays', { n: Math.max(1, Math.round(months * 30)) })
    return t('durationMonths', { n: months })
  }

  const goPremium = () => { handleClose(); router.push('/dashboard/premium') }

  return (
    <SettingsDrawer open={open} title={t('title')} onClose={handleClose}
      footer={
        <button onClick={handleClose} className="w-full py-3 bg-gray-100 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-200 transition-colors">
          {t('close')}
        </button>
      }
    >
      {/* Onglets */}
      <div className="px-4 pt-4">
        <div className="flex gap-2 bg-gray-100 p-1 rounded-xl">
          {([
            { id: 'subscription' as Tab, icon: Crown,   label: t('tabSubscription') },
            { id: 'history'      as Tab, icon: Receipt, label: t('tabHistory') },
          ]).map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                tab === id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-5">
        {loading ? (
          <div className="space-y-3">
            <div className="h-24 bg-gray-100 rounded-xl animate-pulse" />
            <div className="h-16 bg-gray-100 rounded-xl animate-pulse" />
          </div>
        ) : tab === 'subscription' ? (
          subscription ? (
            <div className="space-y-4">
              {/* Carte abonnement actif */}
              <div className="bg-gradient-to-br from-amber-50 to-amber-100/60 border border-amber-200 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-11 h-11 rounded-full bg-amber-200/70 flex items-center justify-center shrink-0">
                    <Crown className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{t('activeTitle')}</p>
                    <p className="text-xs text-amber-700">
                      {t('activeSub', { duration: durationLabel(subscription.durationMonths) })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-white/70 rounded-lg px-3 py-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-[#10B981] shrink-0" />
                  <p className="text-xs font-medium text-gray-700">
                    {t('daysLeft', { n: subscription.daysLeft ?? 0 })}
                  </p>
                </div>

                <div className="flex items-center gap-2 bg-white/70 rounded-lg px-3 py-2">
                  <Calendar className="w-4 h-4 text-amber-600 shrink-0" />
                  <p className="text-xs text-gray-700">
                    {subscription.currentPeriodEnd
                      ? t('expiresOn', { date: localizedDate(subscription.currentPeriodEnd) })
                      : '—'}
                  </p>
                </div>
              </div>

              {/* Détails */}
              <div className="bg-gray-50 rounded-xl divide-y divide-gray-100">
                {[
                  { label: t('fieldStart'),    value: localizedDate(subscription.startedAt) },
                  { label: t('fieldDuration'), value: durationLabel(subscription.durationMonths) },
                  { label: t('fieldAmount'),   value: money(subscription.priceUsd) },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between px-4 py-3">
                    <p className="text-xs text-gray-500">{label}</p>
                    <p className="text-sm font-medium text-gray-800">{value}</p>
                  </div>
                ))}
              </div>

              {/* Renouvellement : le Premium n'est pas reconduit automatiquement. */}
              <div className="bg-[#E1F5EE] rounded-xl p-4">
                <p className="text-xs text-[#064E3B] mb-3">{t('renewNotice')}</p>
                <button
                  onClick={goPremium}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#10B981] text-white text-sm font-semibold rounded-xl hover:bg-[#059669] transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  {t('renewAction')}
                </button>
              </div>
            </div>
          ) : (
            /* Aucun abonnement actif */
            <div className="flex flex-col items-center text-center py-10 px-2">
              <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mb-4">
                <Crown className="w-7 h-7 text-amber-500" />
              </div>
              <p className="text-base font-semibold text-gray-900 mb-1.5">{t('emptyTitle')}</p>
              <p className="text-xs text-gray-500 max-w-xs mb-5">{t('emptyDesc')}</p>
              <button
                onClick={goPremium}
                className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-amber-400 to-amber-500 text-white text-sm font-semibold rounded-xl shadow hover:from-amber-500 hover:to-amber-600 transition-colors"
              >
                <Crown className="w-4 h-4" />
                {t('emptyCta')}
              </button>
            </div>
          )
        ) : transactions.length > 0 ? (
          /* Historique */
          <div className="space-y-2">
            {transactions.map((tx) => (
              <div key={tx.id} className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                  tx.type === 'boost' ? 'bg-blue-100' : 'bg-amber-100'
                }`}>
                  {tx.type === 'boost'
                    ? <Zap className="w-4 h-4 text-blue-500" />
                    : <Crown className="w-4 h-4 text-amber-500" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {tx.type === 'boost'
                      ? t('txBoost')
                      : t('txPremium', { duration: durationLabel(tx.durationMonths) })}
                  </p>
                  <p className="text-xs text-gray-400">{localizedDate(tx.createdAt)}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className={`text-sm font-semibold ${tx.status === 'refunded' ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                    {money(tx.amountUsd)}
                  </p>
                  <p className={`text-[11px] ${tx.status === 'refunded' ? 'text-red-500' : 'text-[#10B981]'}`}>
                    {tx.status === 'refunded' ? t('statusRefunded') : t('statusPaid')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center text-center py-14">
            <FileText className="w-9 h-9 text-gray-300 mb-3" />
            <p className="text-sm text-gray-400">{t('historyEmpty')}</p>
          </div>
        )}
      </div>
    </SettingsDrawer>
  )
}
