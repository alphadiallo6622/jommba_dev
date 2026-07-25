// Client Square (serveur uniquement) — SDK v45 (SquareClient / SquareEnvironment).
// Ne JAMAIS importer ce fichier dans un composant client : il utilise l'Access Token secret.
import { SquareClient, SquareEnvironment } from 'square'

const token = process.env.SQUARE_ACCESS_TOKEN
if (!token) {
  throw new Error('SQUARE_ACCESS_TOKEN manquant dans .env.local')
}

// 'production' bascule sur l'environnement réel ; tout le reste reste en sandbox.
const environment =
  process.env.SQUARE_ENVIRONMENT === 'production'
    ? SquareEnvironment.Production
    : SquareEnvironment.Sandbox

export const square = new SquareClient({ token, environment })

// Emplacement (boutique) qui encaisse les paiements.
export const SQUARE_LOCATION_ID = process.env.SQUARE_LOCATION_ID!

// Devise unique du projet (décision produit : USD).
export const CURRENCY = 'USD' as const

// Convertit un montant en dollars (ex. 2.5) vers le plus petit sous-multiple
// attendu par Square (cents, en BigInt). 2.5 $ -> 250n.
export function toMinorUnits(dollars: number): bigint {
  return BigInt(Math.round(dollars * 100))
}
