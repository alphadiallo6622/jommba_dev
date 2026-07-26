'use client'

// Formulaire de carte Square (Web Payments SDK).
// PCI SAQ-A : le SDK injecte un iframe sécurisé ; le numéro de carte ne touche
// jamais notre code ni notre serveur. On récupère seulement un token (tokenize())
// qu'on envoie à nos routes API (/api/payments/boost ou /subscribe).
import { useEffect, useRef, useState } from 'react'
import Script from 'next/script'
import { Lock } from 'lucide-react'
import { cn } from '@/lib/utils'

// URL du SDK selon l'environnement (sandbox vs production).
const SDK_SRC =
  process.env.NEXT_PUBLIC_SQUARE_ENVIRONMENT === 'production'
    ? 'https://web.squarecdn.com/v1/square.js'
    : 'https://sandbox.web.squarecdn.com/v1/square.js'

type SquareCard = { tokenize: () => Promise<{ status: string; token?: string }> }
type SquarePayments = {
  card: () => Promise<SquareCard & { attach: (el: HTMLElement) => Promise<void> }>
}
declare global {
  interface Window {
    Square?: { payments: (appId: string, locationId: string) => SquarePayments }
  }
}

interface Props {
  /** Où envoyer le token. 'boost' = paiement unique ; 'subscribe' = abonnement. */
  mode: 'boost' | 'subscribe'
  /** Requis pour mode 'subscribe' : identifiant du plan (15j / 1m / 3m / 6m). */
  planId?: string
  /** Requis pour mode 'boost' : identifiant du boost (24h / 3j / 7j). */
  boostId?: string
  /** Libellé du bouton (ex. « Payer 2,5 $ »). */
  submitLabel: string
  /** Couleur d'accent du bouton et du focus. 'green' (défaut) ou 'orange'. */
  accent?: 'green' | 'orange'
  /** Appelé après un paiement réussi. */
  onSuccess: () => void
}

// Classes du bouton selon l'accent (dégradé + ombre teintée).
const ACCENT = {
  green: 'bg-gradient-to-b from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-emerald-500/30',
  orange: 'bg-gradient-to-b from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-orange-500/30',
} as const

export default function SquareCardForm({ mode, planId, boostId, submitLabel, accent = 'green', onSuccess }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<(SquareCard & { attach: (el: HTMLElement) => Promise<void> }) | null>(null)
  const [ready, setReady] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const initSquare = async () => {
    if (!window.Square || !containerRef.current || cardRef.current) return
    const appId = process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID as string
    const locationId = process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID as string
    try {
      const payments = window.Square.payments(appId, locationId)
      const card = await payments.card()
      await card.attach(containerRef.current)
      cardRef.current = card
      setReady(true)
    } catch (e) {
      console.error('[SquareCardForm] init', e)
      setError('Impossible de charger le formulaire de paiement.')
    }
  }

  useEffect(() => {
    // Le SDK peut déjà être chargé (navigation client) : on initialise alors ici,
    // sinon c'est le onLoad du <Script> qui déclenche initSquare. Différé via
    // queueMicrotask pour ne pas déclencher setState en synchrone dans l'effet.
    if (window.Square) queueMicrotask(initSquare)
    return () => {
      cardRef.current = null
    }
  }, [])

  const handlePay = async () => {
    if (!cardRef.current || loading) return
    setLoading(true)
    setError(null)
    try {
      const result = await cardRef.current.tokenize()
      if (result.status !== 'OK' || !result.token) {
        setError('Carte invalide. Vérifiez vos informations.')
        setLoading(false)
        return
      }

      const endpoint = mode === 'boost' ? '/api/payments/boost' : '/api/payments/subscribe'
      const body =
        mode === 'boost'
          ? { sourceId: result.token, boostId }
          : { sourceId: result.token, planId }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const json = await res.json().catch(() => ({}))

      if (!res.ok) {
        setError(json.error ?? 'Le paiement a échoué.')
        setLoading(false)
        return
      }

      onSuccess()
    } catch (e) {
      console.error('[SquareCardForm] pay', e)
      setError('Une erreur est survenue. Réessayez.')
      setLoading(false)
    }
  }

  return (
    <div>
      <Script src={SDK_SRC} strategy="afterInteractive" onLoad={initSquare} />

      {/* Le SDK injecte l'iframe de saisie carte ici. */}
      <div
        ref={containerRef}
        className="rounded-2xl border border-gray-200 bg-white px-4 py-3.5 min-h-[56px] shadow-sm transition-all focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-100"
      />

      {error && (
        <p className="mt-2.5 flex items-center gap-1.5 text-sm text-red-600">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-red-500" />
          {error}
        </p>
      )}

      <button
        onClick={handlePay}
        disabled={!ready || loading}
        className={cn(
          'mt-5 w-full rounded-2xl py-4 text-base font-semibold text-white shadow-lg transition-all duration-200 hover:shadow-xl active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none',
          ACCENT[accent],
        )}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            Traitement…
          </span>
        ) : (
          submitLabel
        )}
      </button>

      {/* Réassurance : paiement sécurisé. */}
      <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-gray-400">
        <Lock className="h-3 w-3" />
        Paiement 100 % sécurisé
      </p>
    </div>
  )
}
