export type Gender = 'homme' | 'femme'

// Règle métier Jommba : matching hétérosexuel strict (mariage islamique).
// Retourne null si le genre n'est pas encore renseigné (onboarding incomplet) —
// dans ce cas on ne peut déterminer aucun genre opposé de façon sûre.
export function oppositeGender(gender: Gender | string | null | undefined): Gender | null {
  if (gender === 'homme') return 'femme'
  if (gender === 'femme') return 'homme'
  return null
}
