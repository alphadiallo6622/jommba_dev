import type { Profile } from './types'

// Les 16 champs clés qui définissent un profil "complet" (100%) — utilisés à
// la fois par l'onboarding et par chaque sauvegarde depuis les Paramètres,
// pour que le score reste toujours juste, peu importe où le profil est modifié.
//
// Le périmètre couvre l'ensemble des champs que les panneaux des Paramètres
// permettent de saisir, section par section (voir lib/profile-sections.ts, qui
// s'appuie sur le même découpage pour les pastilles vert / ambre). Les deux
// indicateurs restent ainsi cohérents : 100 % <=> les 5 sections de profil sont
// vertes, et aucune ne peut afficher « complet » pendant que l'autre dit le
// contraire.
//
// Deux champs saisissables sont volontairement HORS score :
//  - first_name : renseigné d'office à l'inscription, il vaudrait un point
//    gratuit pour tout le monde et fausserait le score vers le haut.
//  - flaws (les défauts) : trop intime pour être exigé. La pastille de la
//    section Personnalité le vérifie, mais le pourcentage ne le sanctionne pas.
type CompletionInput = Pick<
  Profile,
  | 'gender' | 'age' | 'marital_status' | 'height' | 'last_name' | 'has_children'
  | 'job' | 'education' | 'city' | 'country'
  | 'marriage_vision' | 'seeking' | 'dealbreakers'
  | 'interests' | 'qualities'
  | 'avatar_url'
>

export function computeProfileCompletion(p: Partial<CompletionInput>): number {
  const keyFields = [
    // Mes informations
    p.gender,
    p.age,
    p.marital_status,
    p.height,
    p.last_name,
    p.has_children,
    // Localisation & parcours
    p.job,
    p.education,
    p.city,
    p.country,
    // Ma vision
    p.marriage_vision,
    p.seeking,
    p.dealbreakers,
    // Personnalité
    p.interests,
    p.qualities,
    // Photo de profil
    p.avatar_url,
  ]
  return Math.round((keyFields.filter(Boolean).length / keyFields.length) * 100)
}
