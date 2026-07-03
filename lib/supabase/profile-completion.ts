import type { Profile } from './types'

// Les 10 champs clés qui définissent un profil "complet" (100%) — utilisés à
// la fois par l'onboarding et par chaque sauvegarde depuis les Paramètres,
// pour que le score reste toujours juste, peu importe où le profil est modifié.
type CompletionInput = Pick<
  Profile,
  'gender' | 'age' | 'marital_status' | 'job' | 'education' | 'height' | 'city' | 'country' | 'marriage_vision' | 'avatar_url'
>

export function computeProfileCompletion(p: Partial<CompletionInput>): number {
  const keyFields = [
    p.gender,
    p.age,
    p.marital_status,
    p.job,
    p.education,
    p.height,
    p.city,
    p.country,
    p.marriage_vision,
    p.avatar_url,
  ]
  return Math.round((keyFields.filter(Boolean).length / keyFields.length) * 100)
}
