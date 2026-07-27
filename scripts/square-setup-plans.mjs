// DÉPRÉCIÉ : Premium est désormais facturé en paiement unique (Square Payments
// API) avec un prix dynamique (voir lib/pricing.ts), plus via des abonnements
// Square catalogués. Ce script ne sert plus à rien pour les nouveaux achats —
// conservé pour référence tant que des abonnements Square légataires existent.
//
// Crée les plans d'abonnement Premium dans le Catalog Square (une fois par environnement).
// Usage : node scripts/square-setup-plans.mjs
// Lit SQUARE_ACCESS_TOKEN / SQUARE_ENVIRONMENT depuis .env.local.
// Affiche à la fin les IDs de variation à coller dans .env.local (SQUARE_PLAN_*).
//
// Idempotent au niveau du batch (idempotencyKey fixe) : relancer ne crée pas de doublons
// tant que la définition ne change pas. Pour repartir de zéro, supprimez les objets
// dans le dashboard Square puis changez la clé.
import { readFileSync } from 'node:fs'
import { randomUUID } from 'node:crypto'
import { SquareClient, SquareEnvironment } from 'square'

// --- Chargement minimal de .env.local (sans dépendance) ---
function loadEnv() {
  const raw = readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
  for (const line of raw.split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
  }
}
loadEnv()

const token = process.env.SQUARE_ACCESS_TOKEN
if (!token) {
  console.error('SQUARE_ACCESS_TOKEN manquant.')
  process.exit(1)
}
const environment =
  process.env.SQUARE_ENVIRONMENT === 'production'
    ? SquareEnvironment.Production
    : SquareEnvironment.Sandbox

const square = new SquareClient({ token, environment })

// Doit rester aligné avec lib/square/plans.ts.
const PLANS = [
  { id: '15j', name: 'Premium 15 jours', priceUsd: 6,  cadence: 'EVERY_TWO_WEEKS',  env: 'SQUARE_PLAN_15J' },
  { id: '1m',  name: 'Premium 1 mois',   priceUsd: 10, cadence: 'MONTHLY',          env: 'SQUARE_PLAN_1M'  },
  { id: '3m',  name: 'Premium 3 mois',   priceUsd: 15, cadence: 'QUARTERLY',        env: 'SQUARE_PLAN_3M'  },
  { id: '6m',  name: 'Premium 6 mois',   priceUsd: 25, cadence: 'EVERY_SIX_MONTHS', env: 'SQUARE_PLAN_6M'  },
]

const objects = PLANS.map((p) => ({
  type: 'SUBSCRIPTION_PLAN',
  id: `#plan_${p.id}`,
  subscriptionPlanData: {
    name: p.name,
    subscriptionPlanVariations: [
      {
        type: 'SUBSCRIPTION_PLAN_VARIATION',
        id: `#var_${p.id}`,
        subscriptionPlanVariationData: {
          name: p.name,
          phases: [
            {
              cadence: p.cadence,
              pricing: {
                type: 'STATIC',
                priceMoney: { amount: BigInt(Math.round(p.priceUsd * 100)), currency: 'USD' },
              },
            },
          ],
        },
      },
    ],
  },
}))

const res = await square.catalog.batchUpsert({
  idempotencyKey: randomUUID(),
  batches: [{ objects }],
})

// Associe les IDs temporaires (#var_xxx) aux IDs réels renvoyés par Square.
const mappings = res.idMappings ?? []
console.log('\n✅ Plans créés. Colle ces lignes dans .env.local :\n')
for (const p of PLANS) {
  const mapping = mappings.find((m) => m.clientObjectId === `#var_${p.id}`)
  console.log(`${p.env}=${mapping?.objectId ?? '(introuvable)'}`)
}
console.log('')
