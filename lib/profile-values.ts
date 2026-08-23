// lib/profile-values.ts
//
// Les champs « à choix » du profil (situation, études, vision du mariage,
// qualités recherchées, polygamie, enfants…) sont stockés en base sous leur
// libellé FRANÇAIS canonique — c'est la valeur historique, partagée avec la
// console admin et les exports, et on ne la change pas.
//
// Ce module fait la traduction à l'AFFICHAGE : valeur canonique → clé i18n
// (`dashboard.profileValues.*`). Toute valeur inconnue (texte libre saisi par
// le membre, ancienne donnée, nombre d'enfants…) est renvoyée telle quelle.

/** Minuscules, sans accents, espaces normalisés — pour un lookup tolérant. */
function normalize(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
}

/**
 * Valeur canonique normalisée → clé i18n.
 * Plusieurs variantes peuvent pointer vers la même clé : l'onboarding et les
 * paramètres n'écrivent pas toujours exactement le même libellé.
 */
const VALUE_TO_KEY: Record<string, string> = {
  // ── Situation matrimoniale ────────────────────────────────────────────────
  'celibataire': 'single',
  'divorce': 'divorced',
  'divorce(e)': 'divorced',
  'veuf': 'widowed',
  'veuf/veuve': 'widowed',
  'marie': 'married',
  'marie(e)': 'married',
  'marie(e) - polygamie': 'marriedPolygamy',

  // ── Niveau d'études ───────────────────────────────────────────────────────
  'aucun diplome': 'noDegree',
  'brevet': 'brevet',
  'bac': 'bac',
  'baccalaureat': 'bac',
  'bac+2': 'bac2',
  'bac +2 / bts': 'bac2',
  'bac+3': 'licence',
  'licence / bac +3': 'licence',
  'bac+5': 'master',
  'master / bac +5': 'master',
  'doctorat': 'doctorate',
  'autre': 'other',

  // ── Vision du mariage ─────────────────────────────────────────────────────
  'mariage des que possible': 'asap',
  'dans les 6 mois': 'sixMonths',
  "dans l'annee": 'thisYear',
  'dans l’annee': 'thisYear',
  'pas presse(e)': 'noRush',
  'apres connaissance serieuse': 'afterKnowing',
  "besoin d'istikhara": 'istikhara',
  'besoin d’istikhara': 'istikhara',

  // ── Qualités recherchées ──────────────────────────────────────────────────
  'pratiquant(e)': 'practicing',
  'serieux(se)': 'serious',
  'bon caractere': 'goodCharacter',
  'famille unie': 'unitedFamily',
  'travailleur(se)': 'hardworking',
  'discret(e)': 'discreet',
  'patient(e)': 'patient',
  'genereux(se)': 'generous',

  // ── Oui / non (polygamie, enfants, déménagement) ──────────────────────────
  'oui': 'yes',
  'non': 'no',
  'selon': 'conditional',
  'aucun': 'noneChildren',

  // ── Enfants — valeurs héritées d'anciennes versions de l'onboarding ───────
  'souhaite': 'wantsChildren',
  'ne_souhaite_pas': 'dontWantChildren',
}

export type ProfileValueTranslator = (key: string) => string

/**
 * Traduit une valeur canonique. `t` doit être lié à `dashboard.profileValues`.
 * Une valeur non répertoriée (texte libre, nombre d'enfants…) est renvoyée
 * inchangée.
 */
export function translateProfileValue(value: string, t: ProfileValueTranslator): string {
  if (!value) return value
  const key = VALUE_TO_KEY[normalize(value)]
  return key ? t(key) : value
}

/**
 * Idem pour les champs multi-valeurs stockés en CSV (`marriage_vision`,
 * `seeking`). Les séparateurs sont normalisés en « , ».
 */
export function translateProfileValueList(csv: string, t: ProfileValueTranslator): string {
  if (!csv) return csv
  return csv
    .split(',')
    .map(part => translateProfileValue(part.trim(), t))
    .filter(Boolean)
    .join(', ')
}
