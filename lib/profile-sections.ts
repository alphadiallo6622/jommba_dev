// Complétude par section des Paramètres.
//
// Les Paramètres affichent, à droite de chaque ligne, une coche verte si la
// section est entièrement renseignée et un point d'exclamation ambre s'il y
// manque quelque chose.
//
// La pastille reflète ce que le membre VOIT dans le panneau : elle vérifie les
// champs que le panneau correspondant permet de saisir. Sans ça « Ma vision »
// s'affichait complète alors que « Ce que je recherche » et « Ce que je
// n'accepte pas » étaient vides.
//
// Ce découpage est le MÊME que celui de computeProfileCompletion
// (lib/supabase/profile-completion.ts) : les deux indicateurs portent sur le
// même périmètre, donc 100 % équivaut exactement à « les 5 sections de profil
// sont vertes ». L'un ne peut pas contredire l'autre.
//
// Les sections absentes de cette table (Confidentialité, Notifications,
// Sécurité, Compte, Abonnement) sont des réglages sans état « complet » et
// n'affichent aucun indicateur.
import type { MockUser } from '@/lib/mock-user'

/** Sections dont la complétude est mesurable. */
export type TrackedSection = 'photo' | 'infos' | 'location' | 'vision' | 'personality'

/**
 * Champs vérifiés par section — alignés sur ce que chaque panneau enregistre
 * (voir le `updateMyProfile` de chacun) :
 *  - photo    -> avatar_url
 *  - infos    -> last_name, age, height, marital_status, has_children
 *    (first_name est exclu : toujours renseigné à l'inscription)
 *  - location -> city, country, job, education
 *  - vision   -> marriage_vision, seeking, dealbreakers
 *  - personality -> interests, qualities, flaws
 */
const SECTION_FIELDS: Record<TrackedSection, (u: MockUser) => unknown[]> = {
  photo:    (u) => [u.avatar && u.avatar !== '/avatar-placeholder.svg' ? u.avatar : ''],
  infos:    (u) => [u.lastName, u.age, u.height, u.maritalStatus, u.lifeProject.hasChildren],
  location: (u) => [u.city, u.country, u.job, u.education],
  vision:   (u) => [u.marriageVision, u.seeking, u.dealbreakers],
  // `flaws` est saisissable mais volontairement hors périmètre (trop intime
  // pour être exigé) — cf. computeProfileCompletion, qui l'exclut aussi.
  personality: (u) => [u.interests, u.qualities],
}

/** true si tous les champs clés de la section sont renseignés. */
export function isSectionComplete(section: TrackedSection, user: MockUser): boolean {
  return SECTION_FIELDS[section](user).every(Boolean)
}

/** true si la section porte un indicateur de complétude. */
export function isTrackedSection(key: string): key is TrackedSection {
  return key in SECTION_FIELDS
}
