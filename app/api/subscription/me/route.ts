// GET /api/subscription/me
// Abonnement Premium du membre connecté + historique de ses transactions.
// Consommé par le panneau « Mon abonnement » de /dashboard/parametres.
//
// Deux blocs :
//  - `subscription` : le cycle Premium EN COURS (le plus récent non remboursé
//    dont la période n'est pas terminée), ou null si le membre est Free.
//  - `transactions` : tous les achats du membre (Premium + boosts), triés du
//    plus récent au plus ancien.
//
// Le membre ne lit que ses propres lignes (RLS : owner_reads_own_subscription),
// on utilise donc le client serveur classique et non le client admin.
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export type SubscriptionTransaction = {
  id: string
  type: 'premium' | 'boost'
  /** Durée du cycle Premium acheté (null pour un boost). */
  durationMonths: number | null
  amountUsd: number | null
  createdAt: string
  /** 'paid' | 'refunded' — un boost n'est jamais remboursé. */
  status: 'paid' | 'refunded'
  refundedAt: string | null
}

export type SubscriptionSummary = {
  id: string
  plan: string
  status: string
  durationMonths: number | null
  priceUsd: number | null
  startedAt: string
  currentPeriodEnd: string | null
  cancelledAt: string | null
  /** Jours restants avant l'échéance (0 si échue). */
  daysLeft: number | null
}

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  const [subsRes, boostsRes] = await Promise.all([
    supabase
      .from('subscriptions')
      .select('id,plan,status,duration_months,price_usd,created_at,current_period_end,cancelled_at,refunded_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('boosts')
      .select('id,amount_usd,created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
  ])

  if (subsRes.error) {
    console.error('[subscription/me] lecture subscriptions échouée', subsRes.error)
    return NextResponse.json({ error: 'Lecture impossible' }, { status: 500 })
  }

  const subs = subsRes.data ?? []
  const now = Date.now()

  // Cycle en cours : premier Premium actif, non remboursé, dont la période court
  // encore. Les lignes sont déjà triées du plus récent au plus ancien.
  const current = subs.find(
    (s) =>
      s.plan === 'premium' &&
      s.status === 'active' &&
      !s.refunded_at &&
      s.current_period_end != null &&
      new Date(s.current_period_end).getTime() > now,
  )

  const subscription: SubscriptionSummary | null = current
    ? {
        id: current.id,
        plan: current.plan,
        status: current.status,
        durationMonths: current.duration_months ?? null,
        priceUsd: current.price_usd != null ? Number(current.price_usd) : null,
        startedAt: current.created_at,
        currentPeriodEnd: current.current_period_end,
        cancelledAt: current.cancelled_at ?? null,
        daysLeft: current.current_period_end
          ? Math.max(
              0,
              Math.ceil((new Date(current.current_period_end).getTime() - now) / 86_400_000),
            )
          : null,
      }
    : null

  // Historique : les achats Premium (on écarte la ligne 'free' créée à
  // l'inscription, qui ne correspond à aucun paiement) + les boosts.
  const transactions: SubscriptionTransaction[] = [
    ...subs
      .filter((s) => s.plan === 'premium')
      .map((s) => ({
        id: s.id,
        type: 'premium' as const,
        durationMonths: s.duration_months ?? null,
        amountUsd: s.price_usd != null ? Number(s.price_usd) : null,
        createdAt: s.created_at,
        status: (s.refunded_at ? 'refunded' : 'paid') as 'paid' | 'refunded',
        refundedAt: s.refunded_at ?? null,
      })),
    ...(boostsRes.data ?? []).map((b) => ({
      id: b.id,
      type: 'boost' as const,
      durationMonths: null,
      amountUsd: b.amount_usd != null ? Number(b.amount_usd) : null,
      createdAt: b.created_at,
      status: 'paid' as const,
      refundedAt: null,
    })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  return NextResponse.json({ subscription, transactions })
}
