// lib/mock-explorer.ts
// ⚠ Nom historique — ne contient plus aucune donnée fictive.
// Définit la forme des profils affichés dans l'explorateur ; les données
// réelles viennent de Supabase via supabaseProfileToExplorer().

export type ExplorerProfile = {
  id: string
  firstName: string
  lastInitial: string
  age: number
  location: string
  /** Code ISO 3166-1 alpha-2 du pays (ex. "SN"), pour le filtrage par pays. */
  countryCode: string
  maritalStatus: string
  job: string
  photos: string[]
  isEnAvant: boolean
  /** Le membre a choisi de flouter ses photos (pudeur) — s'impose aux visiteurs. */
  photosBlurred: boolean
  marriageVision: string
  ceQueJeRecherche: string
  centresInteret: string
  mesQualites: string
  info: {
    madhhab: string
    education: string
    enfants: string
    souhaitEnfants: string
    peutDemenager: string
    polygamie: string
  }
}
