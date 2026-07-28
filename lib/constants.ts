export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://jommba.com";

// Seuil de complétude à partir duquel un profil devient visible par les
// autres membres (accueil, explorateur, accès direct).
//
// Recalibré de 90 à 56 lors du passage de computeProfileCompletion de 10 à 16
// champs clés : le seuil est exprimé en pourcentage, donc élargir le score
// aurait mécaniquement durci l'exigence et fait disparaître de l'explorateur des
// profils jusque-là visibles. 56 % ≈ 9 champs sur 16, soit le même niveau réel
// d'exigence qu'avant (9 champs sur 10).
//
// À remonter progressivement une fois les profils existants complétés — la
// barre correspond désormais à un profil bien plus riche à exigence égale.
export const MIN_VISIBLE_PROFILE_COMPLETION = 56;

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
  facebook: "https://www.facebook.com/jommba224/",
  instagram: "https://www.instagram.com/Jommba",
  twitter: "https://x.com/Jommba224",
  youtube: "https://www.youtube.com/Jommba224",
  tiktok: "https://www.tiktok.com/jommba224",
};

export const CONTACT_INFO = {
  email: "jommba224@gmail.com",
  address: "New York, USA",
};

