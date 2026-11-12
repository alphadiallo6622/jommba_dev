// GET /api/payments/mobile-money/status?id=<paymentId>
// Suivi de l'état d'une transaction Mobile Money, interrogé par le client pendant
// que l'utilisateur valide sur son téléphone.
//
// Filet de sécurité : si Sayele indique « settled » mais que notre webhook n'a
// pas (encore) activé Premium — par ex. si la vérification de signature échoue —
// on RÉCONCILIE ici en interrogeant l'API, puis on active. L'activation reste
// idempotente (lib/sayele/activate) : webhook et polling ne peuvent pas la
// dédoubler.
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getSayeleServerConfig } from '@/lib/sayele/config'
import { getTransaction } from '@/lib/sayele/client'
import { activateMobileMoneyPayment } from '@/lib/sayele/activate-dispatch'
import { createNotification } from '@/lib/push/notify'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  const id = req.nextUrl.searchParams.get('id')
  if (!id) {
    return NextResponse.json({ error: 'Paramètre id manquant' }, { status: 400 })
  }

  const admin = createAdminClient()
  const { data: row } = await admin
    .from('mobile_money_payments')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id) // un membre ne voit que ses propres transactions
    .maybeSingle()

  if (!row) {
    return NextResponse.json({ error: 'Transaction introuvable' }, { status: 404 })
  }

  // États terminaux : rien à réconcilier.
  if (row.status === 'settled') {
    return NextResponse.json({ status: 'settled', settledAt: row.settled_at })
  }
  if (row.status === 'failed' || row.status === 'expired') {
    return NextResponse.json({ status: row.status })
  }

  // En cours : on tente une réconciliation auprès de Sayele.
  if (row.provider_tx_id) {
    try {
      const config = await getSayeleServerConfig()
      if (config.secretKey) {
        const tx = await getTransaction(config.baseUrl, config.secretKey, row.provider_tx_id)
        if (tx.status === 'settled') {
          const result = await activateMobileMoneyPayment(row.id)
          return NextResponse.json({ status: 'settled', expiresAt: result.expiresAt })
        }
        if (tx.status === 'failed' || tx.status === 'expired') {
          await admin
            .from('mobile_money_payments')
            .update({ status: tx.status, updated_at: new Date().toISOString() })
            .eq('id', row.id)
            .in('status', ['pending', 'processing'])
          await createNotification({
            userId: user.id,
            type: 'premium',
            title: 'Paiement échoué 💳',
            body: "Ton paiement Mobile Money n'a pas abouti. Réessaie ou change d'opérateur.",
            i18n: 'paymentFailed',
          })
          return NextResponse.json({ status: tx.status })
        }
        // Toujours en cours : on reflète 'processing' le cas échéant.
        if (tx.status === 'processing' && row.status !== 'processing') {
          await admin
            .from('mobile_money_payments')
            .update({ status: 'processing', updated_at: new Date().toISOString() })
            .eq('id', row.id)
        }
      }
    } catch (err) {
      // La réconciliation est best-effort : en cas d'erreur réseau on renvoie
      // simplement l'état connu, le client continuera de sonder.
      console.error('[mobile-money/status] réconciliation échouée', err)
    }
  }

  return NextResponse.json({ status: row.status === 'processing' ? 'processing' : 'pending' })
}
