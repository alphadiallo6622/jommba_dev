// GET /api/boost/pricing
// Prix des boosts réglés depuis la console admin (platform_settings.boost_pricing).
// Consommé par la modale de boost pour ne jamais dupliquer les montants affichés
// par rapport à ce qui sera réellement facturé (app/api/payments/boost recharge
// les mêmes valeurs côté serveur au moment du paiement).
import { NextResponse } from 'next/server'
import { getPlatformSettings } from '@/lib/admin/queries'
import { BOOSTS } from '@/lib/square/plans'

export const dynamic = 'force-dynamic'

export async function GET() {
  const { boostPricing } = await getPlatformSettings()
  return NextResponse.json({
    boosts: Object.values(BOOSTS).map((b) => ({
      id: b.id,
      durationLabel: b.durationLabel,
      priceUsd: boostPricing[b.id],
    })),
  })
}
