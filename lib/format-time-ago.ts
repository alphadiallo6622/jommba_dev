// lib/format-time-ago.ts
// Ancienneté affichée sur les cartes (visiteurs, favoris) : en heures sous
// 24 h, en jours au-delà — « Il y a 23h », puis « Il y a 1 j », « Il y a 14 j ».
// Sans cette bascule, une visite d'il y a deux semaines s'affichait « Il y a 333h ».

const HOURS_PER_DAY = 24

type Translate = (key: string, values: Record<string, number>) => string

/**
 * @param hours       ancienneté en heures
 * @param t           fonction de traduction de la section courante, devant
 *                    exposer les clés `hoursAgo` et `daysAgo`
 */
export function formatHoursAgo(hours: number, t: Translate): string {
  const safeHours = Math.max(0, Math.floor(hours))
  if (safeHours < HOURS_PER_DAY) return t('hoursAgo', { n: safeHours })
  return t('daysAgo', { n: Math.floor(safeHours / HOURS_PER_DAY) })
}
