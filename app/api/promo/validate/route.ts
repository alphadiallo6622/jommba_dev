// POST /api/promo/validate
// Prévisualisation d'un code promo pendant la saisie (aucune mutation en base :
// ne consomme pas le code). La validation réelle est refaite intégralement côté
// serveur au moment du paiement (app/api/payments/subscribe), qui seul incrémente
// l'usage — on ne fait jamais confiance à un prix renvoyé par le client.
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { computePlanPrices, isPlanId } from '@/lib/pricing'
import { getPlatformSettings } from '@/lib/admin/queries'
import { validatePromoCode } from '@/lib/promo'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  const { code, planId } = (await req.json().catch(() => ({}))) as {
    code?: string
    planId?: string
  }
  if (!code?.trim()) {
    return NextResponse.json({ error: 'Code promo manquant.' }, { status: 400 })
  }
  if (!planId || !isPlanId(planId)) {
    return NextResponse.json({ error: 'Plan inconnu.' }, { status: 400 })
  }

  const { pricing } = await getPlatformSettings()
  const basePrice = computePlanPrices(pricing.monthlyPrice)[planId]

  const admin = createAdminClient()
  const result = await validatePromoCode(admin, code, planId, basePrice)

  if (!result.valid) {
    return NextResponse.json({ valid: false, error: result.error }, { status: 400 })
  }
  return NextResponse.json({
    valid: true,
    code: code.trim().toUpperCase(),
    basePrice: result.basePrice,
    discountedPrice: result.discountedPrice,
  })
}
