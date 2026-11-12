'use client'

// Formulaire de paiement Mobile Money (Sayele Gate) — Guinée / GNF.
// Moyen de paiement ADDITIONNEL, indépendant du formulaire carte Square.
//
// Flux asynchrone : on initie le pay-in (/api/payments/mobile-money), puis on
// sonde l'état (/api/payments/mobile-money/status) pendant que l'utilisateur
// valide sur son téléphone. L'activation Premium est faite côté serveur
// (webhook + réconciliation) ; ici on attend « settled » puis onSuccess().
import { useEffect, useRef, useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { Lock, Smartphone, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

type Operator = 'orange' | 'mtn'

interface Config {
  enabled: boolean
  operators: Operator[]
  currency: string
  usdToGnf: number
  /** Montant minimum accepté (unités mineures GNF), 0 si non fourni. */
  minAmountMinor?: number
}

interface Props {
  planId: string
  promoCode?: string
  /** Montant total en USD (déjà remisé le cas échéant). */
  amountUsd: number
  onSuccess: () => void
}

const POLL_INTERVAL_MS = 3000
const MAX_POLLS = 50 // ~2,5 min

export default function MobileMoneyForm({ planId, promoCode, amountUsd, onSuccess }: Props) {
  const t = useTranslations('dashboard.premium.payment')
  const tp = useTranslations('dashboard.payment')
  const locale = useLocale()

  const [config, setConfig] = useState<Config | null>(null)
  const [operator, setOperator] = useState<Operator | null>(null)
  const [phone, setPhone] = useState('')
  const [phase, setPhase] = useState<'form' | 'submitting' | 'waiting' | 'error'>('form')
  const [error, setError] = useState<string | null>(null)

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const pollCount = useRef(0)

  // Charge la config publique (disponibilité, opérateurs, taux).
  useEffect(() => {
    let active = true
    fetch('/api/premium/mobile-money-config')
      .then((r) => r.json())
      .then((c: Config) => {
        if (!active) return
        setConfig(c)
        if (c.operators?.length && !operator) setOperator(c.operators[0])
      })
      .catch(() => active && setConfig({ enabled: false, operators: [], currency: 'GNF', usdToGnf: 0 }))
    return () => {
      active = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Nettoyage du polling au démontage.
  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [])

  const stopPolling = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current)
      pollRef.current = null
    }
  }

  const startPolling = (id: string) => {
    pollCount.current = 0
    stopPolling()
    pollRef.current = setInterval(async () => {
      pollCount.current += 1
      try {
        const res = await fetch(`/api/payments/mobile-money/status?id=${encodeURIComponent(id)}`)
        const json = await res.json().catch(() => ({}))
        if (json.status === 'settled') {
          stopPolling()
          onSuccess()
          return
        }
        if (json.status === 'failed' || json.status === 'expired') {
          stopPolling()
          setError(t('mobileFailed'))
          setPhase('error')
          return
        }
      } catch {
        // Erreur réseau ponctuelle : on retentera au prochain tick.
      }
      if (pollCount.current >= MAX_POLLS) {
        stopPolling()
        setError(t('mobileTimeout'))
        setPhase('error')
      }
    }, POLL_INTERVAL_MS)
  }

  const handleSubmit = async () => {
    if (!operator || !phone.trim() || phase === 'submitting' || belowMin) return
    setPhase('submitting')
    setError(null)
    try {
      const res = await fetch('/api/payments/mobile-money', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId, operator, phone: phone.trim(), promoCode: promoCode?.trim() || undefined, locale }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(json.error ?? tp('genericError'))
        setPhase('error')
        return
      }
      setPhase('waiting')
      startPolling(json.paymentId)
    } catch {
      setError(tp('genericError'))
      setPhase('error')
    }
  }

  const reset = () => {
    stopPolling()
    setError(null)
    setPhase('form')
  }

  // Indisponible : repli discret (le bouton carte reste utilisable).
  if (config && !config.enabled) {
    return (
      <div className="mt-5 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-5 text-center text-sm text-gray-500">
        {t('mobileSoon')}
      </div>
    )
  }

  const amountGnf =
    config && config.usdToGnf > 0 ? Math.round(amountUsd * config.usdToGnf) : null
  const amountGnfLabel = amountGnf != null ? new Intl.NumberFormat('fr-FR').format(amountGnf) : null
  // Sous le minimum opérateur : l'appel échouerait (503). On prévient et on
  // désactive le bouton plutôt que de laisser partir une tentative vouée à l'échec.
  const minMinor = config?.minAmountMinor ?? 0
  const belowMin = amountGnf != null && minMinor > 0 && amountGnf < minMinor
  const minLabel = new Intl.NumberFormat('fr-FR').format(minMinor)

  // Écran d'attente (paiement validé sur le téléphone).
  if (phase === 'waiting') {
    return (
      <div className="mt-5 rounded-2xl border border-orange-200 bg-orange-50/60 px-5 py-6 text-center">
        <Loader2 className="mx-auto mb-3 h-8 w-8 animate-spin text-orange-500" />
        <p className="text-sm font-semibold text-gray-800">{t('waiting')}</p>
        <p className="mt-1.5 text-xs leading-relaxed text-gray-500">{t('waitingHint')}</p>
        <button
          onClick={reset}
          className="mt-4 text-xs font-medium text-gray-400 underline underline-offset-2 hover:text-gray-600"
        >
          {locale.startsWith('en') ? 'Cancel' : 'Annuler'}
        </button>
      </div>
    )
  }

  return (
    <div className="mt-5">
      {/* Opérateur */}
      <label className="mb-1.5 block text-xs font-semibold text-gray-600">{t('operatorLabel')}</label>
      <div className="grid grid-cols-2 gap-2.5">
        {(config?.operators ?? ['orange', 'mtn']).map((op) => (
          <button
            key={op}
            type="button"
            onClick={() => setOperator(op)}
            className={cn(
              'flex items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-medium transition-all',
              operator === op
                ? op === 'orange'
                  ? 'border-2 border-orange-400 bg-orange-50 text-orange-700'
                  : 'border-2 border-yellow-400 bg-yellow-50 text-yellow-700'
                : 'border border-gray-200 bg-white text-gray-700 hover:border-gray-300',
            )}
          >
            <Smartphone className="h-4 w-4" />
            {t(op)}
          </button>
        ))}
      </div>

      {/* Numéro */}
      <label className="mb-1.5 mt-4 block text-xs font-semibold text-gray-600">{t('phoneLabel')}</label>
      <div className="flex items-stretch overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-100">
        <span className="flex items-center bg-gray-50 px-3 text-sm font-medium text-gray-500">+224</span>
        <input
          type="tel"
          inputMode="numeric"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder={t('phonePlaceholder')}
          className="w-full bg-transparent px-3 py-3.5 text-sm text-gray-900 outline-none placeholder:text-gray-400"
        />
      </div>

      {belowMin && (
        <p className="mt-2.5 flex items-center gap-1.5 text-sm text-amber-600">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-500" />
          {t('belowMinimum', { amount: minLabel })}
        </p>
      )}

      {error && (
        <p className="mt-2.5 flex items-center gap-1.5 text-sm text-red-600">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-red-500" />
          {error}
        </p>
      )}

      <button
        onClick={handleSubmit}
        disabled={!operator || !phone.trim() || phase === 'submitting' || belowMin}
        className="mt-5 w-full rounded-2xl bg-gradient-to-b from-emerald-500 to-emerald-600 py-4 text-base font-semibold text-white shadow-lg shadow-emerald-500/30 transition-all duration-200 hover:from-emerald-600 hover:to-emerald-700 hover:shadow-xl active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none"
      >
        {phase === 'submitting' ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            {tp('processing')}
          </span>
        ) : (
          <>
            {t('pay')} · {amountUsd} ${amountGnfLabel ? ` · ${t('approx', { amount: amountGnfLabel })}` : ''}
          </>
        )}
      </button>

      <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-gray-400">
        <Lock className="h-3 w-3" />
        {tp('secure')}
      </p>
    </div>
  )
}
