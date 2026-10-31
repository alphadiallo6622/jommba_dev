// lib/onboarding-steps.ts
//
// Correspondance entre les etapes de l'onboarding et les colonnes de
// `profiles`. Elle sert deux fois : pour enregistrer chaque etape des qu'elle
// est franchie, et pour construire l'ecriture finale.
//
// L'onboarding n'ecrivait rien avant la derniere etape : quelqu'un qui
// abandonnait en route etait enregistre comme n'ayant rien fait, et repartait
// de zero des qu'il changeait d'appareil ou vidait son cache.

import { countryCode } from '@/lib/countries'
import { normalizeHeightCm } from '@/lib/utils'
import type { OnboardingData } from '@/store/onboarding.store'

export const TOTAL_STEPS = 7

/** Sous-ensemble de `profiles` ecrit par l'onboarding. */
export type ProfilePatch = Record<string, string | number | null>

/** Age revolu a partir de la date de naissance saisie, ou null si incomplete. */
export function ageFromBirthDate(birthDate: OnboardingData['birthDate']): number | null {
  if (!birthDate?.day || !birthDate?.month || !birthDate?.year) return null
  const birth = new Date(
    Number(birthDate.year),
    Number(birthDate.month) - 1,
    Number(birthDate.day),
  )
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  if (
    today.getMonth() < birth.getMonth() ||
    (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())
  ) age--
  return age
}

/** Liste de cases cochees -> valeur stockee, ou null si rien n'est coche. */
function joined(values: string[]): string | null {
  return values.length > 0 ? values.join(',') : null
}

/**
 * Colonnes renseignees par une etape donnee. Les valeurs vides sont omises
 * plutot que mises a null : une etape survolee ne doit pas effacer ce qu'une
 * visite precedente avait deja enregistre.
 */
export function stepPatch(step: number, s: OnboardingData): ProfilePatch {
  const patch: ProfilePatch = {}
  const put = (key: string, value: string | number | null) => {
    if (value !== null && value !== '') patch[key] = value
  }

  switch (step) {
    case 1:
      put('gender', s.gender)
      break
    case 2:
      put('age', ageFromBirthDate(s.birthDate))
      break
    case 3:
      put('marital_status', s.maritalStatus)
      break
    case 4:
      put('job', s.profession.trim())
      put('education', s.educationLevel)
      put('height', normalizeHeightCm(s.height))
      break
    case 5:
      // `country` est stocke en code ISO (GN, FR...), jamais en nom de pays.
      put('country', countryCode(s.location?.residenceCountry || s.location?.country))
      put('city', s.location?.region?.trim() ?? null)
      break
    case 6:
      put('marriage_vision', joined(s.values.marriageVision))
      put('seeking', joined(s.values.soughtQualities))
      put('polygamy', s.values.polygamy)
      put('has_children', s.values.children)
      break
    case 7:
      put('avatar_url', s.photos.find((p) => Boolean(p)) ?? null)
      break
  }
  return patch
}

/** Toutes les colonnes renseignees par le formulaire, etapes confondues. */
export function fullPatch(s: OnboardingData): ProfilePatch {
  const patch: ProfilePatch = {}
  for (let step = 1; step <= TOTAL_STEPS; step++) Object.assign(patch, stepPatch(step, s))
  return patch
}
