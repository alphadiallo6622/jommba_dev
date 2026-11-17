// app/api/cron/mobile-money-reconcile/route.ts
// Garde-fou : reprend les paiements Mobile Money réglés (`settled`) dont
// l'activation n'a pas abouti — abonnement (Premium) ou boost (Boost) jamais
// créé. Cela arrive si un insert échoue juste après le règlement, ou si le
// webhook ET le polling de statut sont manqués.
//
// Un paiement `settled` SANS objet lié (subscription_id / boost_id) est le
// marqueur d'un blocage. L'activation (lib/sayele/activate-dispatch) est
// idempotente et re-entrante : la rejouer est sans risque de doublon.
//
// Déclenché par Vercel Cron (voir vercel.json) et protégé par CRON_SECRET.
// C'est un filet de dernier recours : la reprise immédiate se fait côté polling
// de statut (/api/payments/mobile-money/status) tant que le client sonde.
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { activateMobileMoneyPayment } from '@/lib/sayele/activate-dispatch'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET
  const auth = req.headers.get('authorization')
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const admin = createAdminClient()
  // Marge : on laisse quelques minutes au flux normal (webhook / polling) avant
  // de reprendre, pour ne pas courir après une activation déjà en cours.
  const cutoff = new Date(Date.now() - 5 * 60 * 1000).toISOString()

  const [premiumRes, boostRes] = await Promise.all([
    admin
      .from('mobile_money_payments')
      .select('id')
      .eq('status', 'settled')
      .eq('kind', 'premium')
      .is('subscription_id', null)
      .lt('settled_at', cutoff)
      .limit(100),
    admin
      .from('mobile_money_payments')
      .select('id')
      .eq('status', 'settled')
      .eq('kind', 'boost')
      .is('boost_id', null)
      .lt('settled_at', cutoff)
      .limit(100),
  ])

  const ids = [...(premiumRes.data ?? []), ...(boostRes.data ?? [])].map((r) => r.id)
  let recovered = 0
  let failed = 0
  for (const id of ids) {
    try {
      const result = await activateMobileMoneyPayment(id)
      if (result.activated) recovered++
    } catch (err) {
      console.error('[cron/mobile-money-reconcile] activation échouée', id, err)
      failed++
    }
  }

  return NextResponse.json({ ok: true, candidates: ids.length, recovered, failed })
}
