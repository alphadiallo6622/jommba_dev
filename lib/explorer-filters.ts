import type { ExplorerProfile } from '@/lib/mock-explorer'
import { COUNTRIES } from '@/lib/countries'

export const ALL_COUNTRIES_VALUE = '__all__'

const COUNTRY_NAMES = new Set(COUNTRIES.map(c => c.name))

function ageInRange(age: number, bracket: string): boolean {
  if (bracket === '18-25') return age >= 18 && age <= 25
  if (bracket === '26-35') return age >= 26 && age <= 35
  if (bracket === '36+')   return age >= 36
  return true
}

export function applyExplorerFilters(profiles: ExplorerProfile[], filters: string[]): ExplorerProfile[] {
  if (filters.length === 0 || filters.includes(ALL_COUNTRIES_VALUE)) return profiles

  const ageBrackets  = filters.filter(f => f === '18-25' || f === '26-35' || f === '36+')
  const countryNames = filters.filter(f => COUNTRY_NAMES.has(f))
  const wantsPhoto      = filters.includes('Photo')
  const wantsSingle     = filters.includes('Célibataire')

  return profiles.filter(p => {
    if (wantsPhoto && (p.photos.length === 0 || !p.photos[0] || p.photos[0].includes('avatar-placeholder'))) return false
    if (wantsSingle && p.maritalStatus.toLowerCase() !== 'célibataire') return false
    if (ageBrackets.length > 0 && !ageBrackets.some(b => ageInRange(p.age, b))) return false
    if (countryNames.length > 0 && !countryNames.includes(p.country)) return false
    return true
  })
}
