// Complétude par section des Paramètres.
//
// Les Paramètres affichent, à droite de chaque ligne, une coche verte si la
// section est entièrement renseignée et un point d'exclamation ambre s'il y
// manque quelque chose. Ce module dit, pour chaque section, quels champs elle
// couvre — en repartant EXACTEMENT des 10 champs clés de
// computeProfileCompletion (lib/supabase/profile-completion.ts), pour que les
// pastilles et le pourcentage affiché juste au-dessus ne puissent jamais se
// contredire (ex. « 100 % » avec une section encore marquée incomplète).
//
// Les sections absentes de cette table (Personnalité, Pratique religieuse,
// Projet de vie, Confidentialité, Notifications, Sécurité, Compte, Abonnement)
// n'entrent pas dans le score et n'affichent donc aucun indicateur.
import type { MockUser } from '@/lib/mock-user'

/** Sections dont la complétude est mesurable. */
export type TrackedSection = 'photo' | 'infos' | 'location' | 'vision'

/**
 * Champs clés couverts par chaque section, dans le même découpage que les
 * panneaux d'édition correspondants :
 *  - photo    -> avatar_url
 *  - infos    -> gender, age, marital_status, height
 *  - location -> city, country, job, education
 *  - vision   -> marriage_vision
 */
const SECTION_FIELDS: Record<TrackedSection, (u: MockUser) => unknown[]> = {
  photo:    (u) => [u.avatar && u.avatar !== '/avatar-placeholder.svg' ? u.avatar : ''],
  infos:    (u) => [u.gender, u.age, u.maritalStatus, u.height],
  location: (u) => [u.city, u.country, u.job, u.education],
  vision:   (u) => [u.marriageVision],
}

/** true si tous les champs clés de la section sont renseignés. */
export function isSectionComplete(section: TrackedSection, user: MockUser): boolean {
  return SECTION_FIELDS[section](user).every(Boolean)
}

/** true si la section porte un indicateur de complétude. */
export function isTrackedSection(key: string): key is TrackedSection {
  return key in SECTION_FIELDS
}
