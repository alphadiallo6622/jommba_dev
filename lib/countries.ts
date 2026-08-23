// lib/countries.ts
// Liste des pays du monde (ISO 3166-1 alpha-2) avec libellés français et
// anglais, triée par nom français. Partagée entre l'onboarding, les paramètres
// et la console admin.
//
// ⚠ `name` (français) reste la valeur canonique stockée en base : seul
// l'affichage est traduit, via `countryLabel()` / `countriesForLocale()`.

export interface Country {
  code: string; // ISO 3166-1 alpha-2 (majuscules)
  name: string; // nom français — valeur canonique stockée
  nameEn: string; // libellé anglais (affichage uniquement)
}

export const COUNTRIES: Country[] = [
  { code: "AF", name: "Afghanistan", nameEn: "Afghanistan" },
  { code: "ZA", name: "Afrique du Sud", nameEn: "South Africa" },
  { code: "AL", name: "Albanie", nameEn: "Albania" },
  { code: "DZ", name: "Algérie", nameEn: "Algeria" },
  { code: "DE", name: "Allemagne", nameEn: "Germany" },
  { code: "AD", name: "Andorre", nameEn: "Andorra" },
  { code: "AO", name: "Angola", nameEn: "Angola" },
  { code: "AG", name: "Antigua-et-Barbuda", nameEn: "Antigua and Barbuda" },
  { code: "SA", name: "Arabie saoudite", nameEn: "Saudi Arabia" },
  { code: "AR", name: "Argentine", nameEn: "Argentina" },
  { code: "AM", name: "Arménie", nameEn: "Armenia" },
  { code: "AU", name: "Australie", nameEn: "Australia" },
  { code: "AT", name: "Autriche", nameEn: "Austria" },
  { code: "AZ", name: "Azerbaïdjan", nameEn: "Azerbaijan" },
  { code: "BS", name: "Bahamas", nameEn: "Bahamas" },
  { code: "BH", name: "Bahreïn", nameEn: "Bahrain" },
  { code: "BD", name: "Bangladesh", nameEn: "Bangladesh" },
  { code: "BB", name: "Barbade", nameEn: "Barbados" },
  { code: "BE", name: "Belgique", nameEn: "Belgium" },
  { code: "BZ", name: "Belize", nameEn: "Belize" },
  { code: "BJ", name: "Bénin", nameEn: "Benin" },
  { code: "BT", name: "Bhoutan", nameEn: "Bhutan" },
  { code: "BY", name: "Biélorussie", nameEn: "Belarus" },
  { code: "MM", name: "Birmanie (Myanmar)", nameEn: "Myanmar (Burma)" },
  { code: "BO", name: "Bolivie", nameEn: "Bolivia" },
  { code: "BA", name: "Bosnie-Herzégovine", nameEn: "Bosnia and Herzegovina" },
  { code: "BW", name: "Botswana", nameEn: "Botswana" },
  { code: "BR", name: "Brésil", nameEn: "Brazil" },
  { code: "BN", name: "Brunei", nameEn: "Brunei" },
  { code: "BG", name: "Bulgarie", nameEn: "Bulgaria" },
  { code: "BF", name: "Burkina Faso", nameEn: "Burkina Faso" },
  { code: "BI", name: "Burundi", nameEn: "Burundi" },
  { code: "KH", name: "Cambodge", nameEn: "Cambodia" },
  { code: "CM", name: "Cameroun", nameEn: "Cameroon" },
  { code: "CA", name: "Canada", nameEn: "Canada" },
  { code: "CV", name: "Cap-Vert", nameEn: "Cape Verde" },
  { code: "CF", name: "République centrafricaine", nameEn: "Central African Republic" },
  { code: "CL", name: "Chili", nameEn: "Chile" },
  { code: "CN", name: "Chine", nameEn: "China" },
  { code: "CY", name: "Chypre", nameEn: "Cyprus" },
  { code: "CO", name: "Colombie", nameEn: "Colombia" },
  { code: "KM", name: "Comores", nameEn: "Comoros" },
  { code: "CG", name: "Congo", nameEn: "Congo" },
  { code: "CD", name: "Congo (RDC)", nameEn: "Congo (DRC)" },
  { code: "KP", name: "Corée du Nord", nameEn: "North Korea" },
  { code: "KR", name: "Corée du Sud", nameEn: "South Korea" },
  { code: "CR", name: "Costa Rica", nameEn: "Costa Rica" },
  { code: "CI", name: "Côte d’Ivoire", nameEn: "Côte d’Ivoire" },
  { code: "HR", name: "Croatie", nameEn: "Croatia" },
  { code: "CU", name: "Cuba", nameEn: "Cuba" },
  { code: "DK", name: "Danemark", nameEn: "Denmark" },
  { code: "DJ", name: "Djibouti", nameEn: "Djibouti" },
  { code: "DO", name: "République dominicaine", nameEn: "Dominican Republic" },
  { code: "DM", name: "Dominique", nameEn: "Dominica" },
  { code: "EG", name: "Égypte", nameEn: "Egypt" },
  { code: "AE", name: "Émirats arabes unis", nameEn: "United Arab Emirates" },
  { code: "EC", name: "Équateur", nameEn: "Ecuador" },
  { code: "ER", name: "Érythrée", nameEn: "Eritrea" },
  { code: "ES", name: "Espagne", nameEn: "Spain" },
  { code: "EE", name: "Estonie", nameEn: "Estonia" },
  { code: "SZ", name: "Eswatini", nameEn: "Eswatini" },
  { code: "US", name: "États-Unis", nameEn: "United States" },
  { code: "ET", name: "Éthiopie", nameEn: "Ethiopia" },
  { code: "FJ", name: "Fidji", nameEn: "Fiji" },
  { code: "FI", name: "Finlande", nameEn: "Finland" },
  { code: "FR", name: "France", nameEn: "France" },
  { code: "GA", name: "Gabon", nameEn: "Gabon" },
  { code: "GM", name: "Gambie", nameEn: "Gambia" },
  { code: "GE", name: "Géorgie", nameEn: "Georgia" },
  { code: "GH", name: "Ghana", nameEn: "Ghana" },
  { code: "GR", name: "Grèce", nameEn: "Greece" },
  { code: "GD", name: "Grenade", nameEn: "Grenada" },
  { code: "GT", name: "Guatemala", nameEn: "Guatemala" },
  { code: "GN", name: "Guinée", nameEn: "Guinea" },
  { code: "GW", name: "Guinée-Bissau", nameEn: "Guinea-Bissau" },
  { code: "GQ", name: "Guinée équatoriale", nameEn: "Equatorial Guinea" },
  { code: "GY", name: "Guyana", nameEn: "Guyana" },
  { code: "HT", name: "Haïti", nameEn: "Haiti" },
  { code: "HN", name: "Honduras", nameEn: "Honduras" },
  { code: "HU", name: "Hongrie", nameEn: "Hungary" },
  { code: "IN", name: "Inde", nameEn: "India" },
  { code: "ID", name: "Indonésie", nameEn: "Indonesia" },
  { code: "IQ", name: "Irak", nameEn: "Iraq" },
  { code: "IR", name: "Iran", nameEn: "Iran" },
  { code: "IE", name: "Irlande", nameEn: "Ireland" },
  { code: "IS", name: "Islande", nameEn: "Iceland" },
  { code: "IL", name: "Israël", nameEn: "Israel" },
  { code: "IT", name: "Italie", nameEn: "Italy" },
  { code: "JM", name: "Jamaïque", nameEn: "Jamaica" },
  { code: "JP", name: "Japon", nameEn: "Japan" },
  { code: "JO", name: "Jordanie", nameEn: "Jordan" },
  { code: "KZ", name: "Kazakhstan", nameEn: "Kazakhstan" },
  { code: "KE", name: "Kenya", nameEn: "Kenya" },
  { code: "KG", name: "Kirghizistan", nameEn: "Kyrgyzstan" },
  { code: "KI", name: "Kiribati", nameEn: "Kiribati" },
  { code: "KW", name: "Koweït", nameEn: "Kuwait" },
  { code: "LA", name: "Laos", nameEn: "Laos" },
  { code: "LS", name: "Lesotho", nameEn: "Lesotho" },
  { code: "LV", name: "Lettonie", nameEn: "Latvia" },
  { code: "LB", name: "Liban", nameEn: "Lebanon" },
  { code: "LR", name: "Liberia", nameEn: "Liberia" },
  { code: "LY", name: "Libye", nameEn: "Libya" },
  { code: "LI", name: "Liechtenstein", nameEn: "Liechtenstein" },
  { code: "LT", name: "Lituanie", nameEn: "Lithuania" },
  { code: "LU", name: "Luxembourg", nameEn: "Luxembourg" },
  { code: "MK", name: "Macédoine du Nord", nameEn: "North Macedonia" },
  { code: "MG", name: "Madagascar", nameEn: "Madagascar" },
  { code: "MY", name: "Malaisie", nameEn: "Malaysia" },
  { code: "MW", name: "Malawi", nameEn: "Malawi" },
  { code: "MV", name: "Maldives", nameEn: "Maldives" },
  { code: "ML", name: "Mali", nameEn: "Mali" },
  { code: "MT", name: "Malte", nameEn: "Malta" },
  { code: "MA", name: "Maroc", nameEn: "Morocco" },
  { code: "MH", name: "Îles Marshall", nameEn: "Marshall Islands" },
  { code: "MR", name: "Mauritanie", nameEn: "Mauritania" },
  { code: "MU", name: "Maurice", nameEn: "Mauritius" },
  { code: "MX", name: "Mexique", nameEn: "Mexico" },
  { code: "FM", name: "Micronésie", nameEn: "Micronesia" },
  { code: "MD", name: "Moldavie", nameEn: "Moldova" },
  { code: "MC", name: "Monaco", nameEn: "Monaco" },
  { code: "MN", name: "Mongolie", nameEn: "Mongolia" },
  { code: "ME", name: "Monténégro", nameEn: "Montenegro" },
  { code: "MZ", name: "Mozambique", nameEn: "Mozambique" },
  { code: "NA", name: "Namibie", nameEn: "Namibia" },
  { code: "NR", name: "Nauru", nameEn: "Nauru" },
  { code: "NP", name: "Népal", nameEn: "Nepal" },
  { code: "NI", name: "Nicaragua", nameEn: "Nicaragua" },
  { code: "NE", name: "Niger", nameEn: "Niger" },
  { code: "NG", name: "Nigeria", nameEn: "Nigeria" },
  { code: "NO", name: "Norvège", nameEn: "Norway" },
  { code: "NZ", name: "Nouvelle-Zélande", nameEn: "New Zealand" },
  { code: "OM", name: "Oman", nameEn: "Oman" },
  { code: "UG", name: "Ouganda", nameEn: "Uganda" },
  { code: "UZ", name: "Ouzbékistan", nameEn: "Uzbekistan" },
  { code: "PK", name: "Pakistan", nameEn: "Pakistan" },
  { code: "PW", name: "Palaos", nameEn: "Palau" },
  { code: "PS", name: "Palestine", nameEn: "Palestine" },
  { code: "PA", name: "Panama", nameEn: "Panama" },
  { code: "PG", name: "Papouasie-Nouvelle-Guinée", nameEn: "Papua New Guinea" },
  { code: "PY", name: "Paraguay", nameEn: "Paraguay" },
  { code: "NL", name: "Pays-Bas", nameEn: "Netherlands" },
  { code: "PE", name: "Pérou", nameEn: "Peru" },
  { code: "PH", name: "Philippines", nameEn: "Philippines" },
  { code: "PL", name: "Pologne", nameEn: "Poland" },
  { code: "PT", name: "Portugal", nameEn: "Portugal" },
  { code: "QA", name: "Qatar", nameEn: "Qatar" },
  { code: "RO", name: "Roumanie", nameEn: "Romania" },
  { code: "GB", name: "Royaume-Uni", nameEn: "United Kingdom" },
  { code: "RU", name: "Russie", nameEn: "Russia" },
  { code: "RW", name: "Rwanda", nameEn: "Rwanda" },
  { code: "KN", name: "Saint-Christophe-et-Niévès", nameEn: "Saint Kitts and Nevis" },
  { code: "SM", name: "Saint-Marin", nameEn: "San Marino" },
  { code: "VC", name: "Saint-Vincent-et-les-Grenadines", nameEn: "Saint Vincent and the Grenadines" },
  { code: "LC", name: "Sainte-Lucie", nameEn: "Saint Lucia" },
  { code: "SB", name: "Salomon", nameEn: "Solomon Islands" },
  { code: "SV", name: "Salvador", nameEn: "El Salvador" },
  { code: "WS", name: "Samoa", nameEn: "Samoa" },
  { code: "ST", name: "Sao Tomé-et-Principe", nameEn: "São Tomé and Príncipe" },
  { code: "SN", name: "Sénégal", nameEn: "Senegal" },
  { code: "RS", name: "Serbie", nameEn: "Serbia" },
  { code: "SC", name: "Seychelles", nameEn: "Seychelles" },
  { code: "SL", name: "Sierra Leone", nameEn: "Sierra Leone" },
  { code: "SG", name: "Singapour", nameEn: "Singapore" },
  { code: "SK", name: "Slovaquie", nameEn: "Slovakia" },
  { code: "SI", name: "Slovénie", nameEn: "Slovenia" },
  { code: "SO", name: "Somalie", nameEn: "Somalia" },
  { code: "SD", name: "Soudan", nameEn: "Sudan" },
  { code: "SS", name: "Soudan du Sud", nameEn: "South Sudan" },
  { code: "LK", name: "Sri Lanka", nameEn: "Sri Lanka" },
  { code: "SE", name: "Suède", nameEn: "Sweden" },
  { code: "CH", name: "Suisse", nameEn: "Switzerland" },
  { code: "SR", name: "Suriname", nameEn: "Suriname" },
  { code: "SY", name: "Syrie", nameEn: "Syria" },
  { code: "TJ", name: "Tadjikistan", nameEn: "Tajikistan" },
  { code: "TW", name: "Taïwan", nameEn: "Taiwan" },
  { code: "TZ", name: "Tanzanie", nameEn: "Tanzania" },
  { code: "TD", name: "Tchad", nameEn: "Chad" },
  { code: "CZ", name: "Tchéquie", nameEn: "Czechia" },
  { code: "TH", name: "Thaïlande", nameEn: "Thailand" },
  { code: "TL", name: "Timor oriental", nameEn: "Timor-Leste" },
  { code: "TG", name: "Togo", nameEn: "Togo" },
  { code: "TO", name: "Tonga", nameEn: "Tonga" },
  { code: "TT", name: "Trinité-et-Tobago", nameEn: "Trinidad and Tobago" },
  { code: "TN", name: "Tunisie", nameEn: "Tunisia" },
  { code: "TM", name: "Turkménistan", nameEn: "Turkmenistan" },
  { code: "TR", name: "Turquie", nameEn: "Turkey" },
  { code: "TV", name: "Tuvalu", nameEn: "Tuvalu" },
  { code: "UA", name: "Ukraine", nameEn: "Ukraine" },
  { code: "UY", name: "Uruguay", nameEn: "Uruguay" },
  { code: "VU", name: "Vanuatu", nameEn: "Vanuatu" },
  { code: "VA", name: "Vatican", nameEn: "Vatican City" },
  { code: "VE", name: "Venezuela", nameEn: "Venezuela" },
  { code: "VN", name: "Vietnam", nameEn: "Vietnam" },
  { code: "YE", name: "Yémen", nameEn: "Yemen" },
  { code: "ZM", name: "Zambie", nameEn: "Zambia" },
  { code: "ZW", name: "Zimbabwe", nameEn: "Zimbabwe" },
].sort((a, b) => a.name.localeCompare(b.name, "fr"));

/** Sous-ensemble des pays du continent africain (par code ISO), pour l'onboarding. */
const AFRICA_CODES = new Set([
  "DZ", "AO", "BJ", "BW", "BF", "BI", "CM", "CV", "CF", "TD", "KM", "CG", "CD",
  "CI", "DJ", "EG", "GQ", "ER", "SZ", "ET", "GA", "GM", "GH", "GN", "GW", "KE",
  "LS", "LR", "LY", "MG", "MW", "ML", "MR", "MU", "MA", "MZ", "NA", "NE", "NG",
  "RW", "ST", "SN", "SC", "SL", "SO", "ZA", "SS", "SD", "TZ", "TG", "TN", "UG",
  "ZM", "ZW",
]);

export const AFRICAN_COUNTRIES: Country[] = COUNTRIES.filter((c) => AFRICA_CODES.has(c.code));
export const NON_AFRICAN_COUNTRIES: Country[] = COUNTRIES.filter((c) => !AFRICA_CODES.has(c.code));

const CODE_TO_NAME = new Map(COUNTRIES.map((c) => [c.code, c]));
const FR_NAME_TO_COUNTRY = new Map(COUNTRIES.map((c) => [c.name.toLowerCase(), c]));

/**
 * Libellé d'affichage d'un pays dans la locale demandée.
 * La valeur stockée reste `country.name` (français).
 */
export function countryLabel(country: Country, locale: string): string {
  return locale.startsWith("en") ? country.nameEn : country.name;
}

/** Copie triée d'une liste de pays selon le libellé affiché dans la locale. */
export function countriesForLocale(list: Country[], locale: string): Country[] {
  return [...list].sort((a, b) =>
    countryLabel(a, locale).localeCompare(countryLabel(b, locale), locale),
  );
}

/** Nom d'un pays à partir de son code ISO, ou le code si inconnu. */
export function countryName(code: string, locale = "fr"): string {
  const country = CODE_TO_NAME.get(code.toUpperCase());
  return country ? countryLabel(country, locale) : code.toUpperCase();
}

/**
 * Traduit un pays tel qu'il est stocké en base — c'est-à-dire son nom
 * français, ou parfois un code ISO pour les données les plus anciennes.
 * Une valeur non reconnue est renvoyée inchangée.
 */
export function localizeStoredCountry(stored: string, locale: string): string {
  if (!stored) return stored;
  const byName = FR_NAME_TO_COUNTRY.get(stored.trim().toLowerCase());
  if (byName) return countryLabel(byName, locale);
  const byCode = CODE_TO_NAME.get(stored.trim().toUpperCase());
  return byCode ? countryLabel(byCode, locale) : stored;
}
