export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://jommba.com";

// Seuil de complétude à partir duquel un profil devient visible par les
// autres membres (accueil, explorateur, accès direct). Abaissé temporairement
// de 100 à 90 : le champ ville n'était pas collectable pour certains pays
// avant le fix de l'onboarding — remonter à 100 une fois les profils existants
// mis à jour.
export const MIN_VISIBLE_PROFILE_COMPLETION = 90;

export const SITE_METADATA = {
  title: "Jommba - Rencontre Halal & Mariage Musulman",
  description: "La plateforme de référence pour le mariage musulman et les rencontres halal. Trouvez votre partenaire idéal dans le respect des valeurs islamiques.",
  ogImage: "/assets/images/og-image.jpg",
};

// `labelKey` référence une clé du namespace "nav" dans messages/<locale>.json.
export const NAV_LINKS = [
  { labelKey: "home", href: "/" },
  { labelKey: "howToSignup", href: "/#how-it-works" },
  { labelKey: "pricing", href: "/#pricing" },
  { labelKey: "blog", href: "/blog" },
  { labelKey: "faq", href: "/faq" },
  { labelKey: "contact", href: "/contact" },
] as const;

export const SOCIAL_LINKS = {
  facebook: "https://facebook.com/Jommba",
  instagram: "https://instagram.com/Jommba",
  twitter: "https://twitter.com/Jommba",
  youtube: "https://youtube.com/Jommba",
};

export const CONTACT_INFO = {
  email: "jommba224@gmail.com",
  address: "Conakry, Guinée",
};

