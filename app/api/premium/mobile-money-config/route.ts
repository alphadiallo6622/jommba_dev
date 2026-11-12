// GET /api/premium/mobile-money-config
// Config PUBLIQUE (non sensible) pour le formulaire Mobile Money : sait-on
// l'afficher, quels opérateurs, et quel taux USD→GNF pour l'estimation affichée.
// Aucun secret n'est exposé (clés lues uniquement par les routes serveur).
import { NextResponse } from 'next/server'
import { getSayeleServerConfig, SAYELE_MIN_AMOUNT_MINOR } from '@/lib/sayele/config'

export const dynamic = 'force-dynamic'

export async function GET() {
  const config = await getSayeleServerConfig()
  // « Disponible » = activé en admin ET secret résolu (sinon le bouton mènerait
  // à une erreur). On n'expose que des informations non sensibles.
  const available = config.enabled && !!config.secretKey && config.usdToGnf > 0
  return NextResponse.json({
    enabled: available,
    operators: config.operators,
    currency: config.currency,
    usdToGnf: config.usdToGnf,
    minAmountMinor: SAYELE_MIN_AMOUNT_MINOR,
  })
}
