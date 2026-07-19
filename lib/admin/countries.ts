// lib/admin/countries.ts
// Ré-exporte la liste partagée (lib/countries.ts) pour la console admin
// (sélecteur de disponibilité par pays). La liste vit désormais dans
// lib/countries.ts pour être partagée avec l'onboarding et les paramètres.

export type { Country } from "@/lib/countries";
export { COUNTRIES, countryName } from "@/lib/countries";
