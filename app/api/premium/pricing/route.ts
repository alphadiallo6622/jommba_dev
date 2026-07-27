// GET /api/premium/pricing
// Prix Premium calculés depuis platform_settings.pricing.monthlyPrice (voir
// lib/pricing.ts) — consommé par la page /dashboard/premium pour ne jamais
// dupliquer les montants affichés par rapport à ce qui sera réellement facturé
// (app/api/payments/subscribe recalcule le même prix côté serveur au paiement).
import { NextResponse } from 'next/server'
import { getPlatformSettings } from '@/lib/admin/queries'
import {
  computePlanPrices, computeFullPrices, computeMonthlyEquivalents, computeDiscountLabels,
} from '@/lib/pricing'

export const dynamic = 'force-dynamic'

export async function GET() {
  const { pricing } = await getPlatformSettings()
  return NextResponse.json({
    prices: computePlanPrices(pricing.monthlyPrice),
    fullPrices: computeFullPrices(pricing.monthlyPrice),
    monthlyEquivalents: computeMonthlyEquivalents(pricing.monthlyPrice),
    discounts: computeDiscountLabels(),
  })
}
