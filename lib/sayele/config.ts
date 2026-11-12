// Configuration Mobile Money (Sayele Gate) — SERVEUR UNIQUEMENT.
//
// Source de vérité en deux couches :
//   1. platform_settings.mobile_money (réglable en console admin) — SURCHARGE ;
//   2. à défaut, les variables d'environnement (.env.local) :
//        SECRET_KEY, WEBHOOK_SECRET_KEY, WH_URL_NOTIFICATION.
//
// Les secrets stockés en base sont chiffrés (lib/crypto/secret-box). Ce module
// ne doit JAMAIS être importé par un composant client : il expose des secrets en
// clair. Pour l'affichage admin, utiliser getMobileMoneyAdminView() (présence
// seulement, aucune valeur sensible).
import { cache } from 'react'
import { createAdminClient } from '@/lib/supabase/admin'
import { decryptSecret, isEncrypted } from '@/lib/crypto/secret-box'
import type { MobileMoneyAdminSettings } from '@/lib/admin/types'

/** Guinée : pays et devise imposés (devise sans sous-unité → minor == major). */
export const SAYELE_COUNTRY = 'GN' as const
export const SAYELE_CURRENCY = 'GNF' as const
export const SAYELE_OPERATORS = ['orange', 'mtn'] as const
export type SayeleOperator = (typeof SAYELE_OPERATORS)[number]

export const DEFAULT_BASE_URL = 'https://api.gate.sayele.co'
export const DEFAULT_WEBHOOK_URL = 'https://jommba.com/api/webhooks/sayele'
/** Taux de repli indicatif ; l'admin le règle réellement dans /parametres. */
export const DEFAULT_USD_TO_GNF = 8600
/**
 * Montant minimum accepté par Sayele / l'agrégateur (chapchappay) par
 * transaction, en unités mineures GNF. Confirmé en live le 2026-11-12 : en
 * dessous, l'API renvoie 503 « moyen de paiement temporairement indisponible ».
 * On bloque donc proprement côté app avant l'appel.
 */
export const SAYELE_MIN_AMOUNT_MINOR = 3000

/** Forme stockée dans platform_settings.mobile_money (jsonb). */
export interface StoredMobileMoney {
  enabled?: boolean
  baseUrl?: string
  webhookUrl?: string
  usdToGnf?: number
  /** Chiffré (v1:…) en base ; surcharge process.env.SECRET_KEY. */
  secretKey?: string | null
  /** Chiffré (v1:…) en base ; surcharge process.env.WEBHOOK_SECRET_KEY. */
  webhookSecret?: string | null
}

/** Config résolue, prête à l'emploi côté serveur (secrets EN CLAIR). */
export interface SayeleServerConfig {
  enabled: boolean
  baseUrl: string
  webhookUrl: string
  usdToGnf: number
  secretKey: string | null
  webhookSecret: string | null
  country: typeof SAYELE_COUNTRY
  currency: typeof SAYELE_CURRENCY
  operators: readonly SayeleOperator[]
}

function envTrim(name: string): string | undefined {
  const v = process.env[name]
  const t = typeof v === 'string' ? v.trim() : undefined
  return t ? t : undefined
}

async function readStored(): Promise<StoredMobileMoney> {
  try {
    const admin = createAdminClient()
    const { data } = await admin
      .from('platform_settings')
      .select('mobile_money')
      .eq('id', 1)
      .maybeSingle()
    return ((data?.mobile_money ?? {}) as StoredMobileMoney) || {}
  } catch (err) {
    console.error('[sayele/config] lecture platform_settings échouée', err)
    return {}
  }
}

/** Résout un secret : valeur base (déchiffrée) en priorité, sinon variable env. */
function resolveSecret(stored: string | null | undefined, envName: string): string | null {
  if (typeof stored === 'string' && stored.trim()) {
    return decryptSecret(stored)
  }
  return envTrim(envName) ?? null
}

/** Config complète côté serveur (routes API, webhook). Mémoïsée par requête. */
export const getSayeleServerConfig = cache(async (): Promise<SayeleServerConfig> => {
  const stored = await readStored()

  const usdToGnf =
    typeof stored.usdToGnf === 'number' && stored.usdToGnf > 0
      ? stored.usdToGnf
      : Number(envTrim('SAYELE_USD_TO_GNF')) || DEFAULT_USD_TO_GNF

  return {
    enabled: stored.enabled === true,
    baseUrl: stored.baseUrl?.trim() || envTrim('SAYELE_BASE_URL') || DEFAULT_BASE_URL,
    webhookUrl:
      stored.webhookUrl?.trim() || envTrim('WH_URL_NOTIFICATION') || DEFAULT_WEBHOOK_URL,
    usdToGnf,
    secretKey: resolveSecret(stored.secretKey, 'SECRET_KEY'),
    webhookSecret: resolveSecret(stored.webhookSecret, 'WEBHOOK_SECRET_KEY'),
    country: SAYELE_COUNTRY,
    currency: SAYELE_CURRENCY,
    operators: SAYELE_OPERATORS,
  }
})

/** Vue admin : présence des secrets seulement, jamais les valeurs. */
export async function getMobileMoneyAdminView(): Promise<MobileMoneyAdminSettings> {
  const stored = await readStored()
  const storedSecret = typeof stored.secretKey === 'string' && stored.secretKey.trim() !== ''
  const storedWebhook = typeof stored.webhookSecret === 'string' && stored.webhookSecret.trim() !== ''
  const usdToGnf =
    typeof stored.usdToGnf === 'number' && stored.usdToGnf > 0 ? stored.usdToGnf : DEFAULT_USD_TO_GNF
  return {
    enabled: stored.enabled === true,
    baseUrl: stored.baseUrl?.trim() || DEFAULT_BASE_URL,
    webhookUrl: stored.webhookUrl?.trim() || envTrim('WH_URL_NOTIFICATION') || DEFAULT_WEBHOOK_URL,
    usdToGnf,
    hasSecretKey: storedSecret || !!envTrim('SECRET_KEY'),
    hasWebhookSecret: storedWebhook || !!envTrim('WEBHOOK_SECRET_KEY'),
    secretKeyFromEnv: !storedSecret && !!envTrim('SECRET_KEY'),
    webhookSecretFromEnv: !storedWebhook && !!envTrim('WEBHOOK_SECRET_KEY'),
  }
}

export function isSayeleOperator(v: string): v is SayeleOperator {
  return (SAYELE_OPERATORS as readonly string[]).includes(v)
}

/** Convertit un montant USD en GNF entier (devise sans sous-unité). */
export function usdToGnfMinor(amountUsd: number, usdToGnf: number): number {
  return Math.max(0, Math.round(amountUsd * usdToGnf))
}

/** Normalise un numéro guinéen au format international +224XXXXXXXXX. */
export function normalizeGuineaPhone(raw: string): string | null {
  const digits = (raw || '').replace(/[^\d+]/g, '')
  let n = digits.replace(/^\+/, '')
  if (n.startsWith('00224')) n = n.slice(5)
  else if (n.startsWith('224')) n = n.slice(3)
  n = n.replace(/\D/g, '')
  // Numéros mobiles guinéens : 9 chiffres (ex. 62X XX XX XX / 61X / 66X…).
  if (n.length !== 9) return null
  return `+224${n}`
}

export { isEncrypted }
