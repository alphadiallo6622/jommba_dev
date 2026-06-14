export interface PricingFeature {
  text: string;
  included: boolean;
  tag?: string;
}

export interface PricingPlan {
  name: string;
  price: string;
  originalPrice?: string;
  period: string;
  description: string;
  features: PricingFeature[];
  buttonText: string;
  popular: boolean;
  badge?: string;
  note?: string;
  variant: "primary" | "secondary";
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    name: "Gratuit",
    price: "0",
    period: "Pour toujours",
    description: "Découvre la plateforme à ton rythme",
    features: [
      { text: "Création de profil complète", included: true },
      { text: "3 photos de profil", included: true },
      { text: "3 demandes de contact par jour", included: true },
      { text: "3 conversations actives en parallèle", included: true },
      { text: "3 questions par jour à Cheikh Moussa (Coach IA)", included: true },
      { text: "Répondre aux messages reçus", included: true },
      { text: "Ice Breaker : idées de messages", included: true },
      { text: "Accès à l'Académie du Mariage", included: true },
      { text: "Support par email", included: true },
      { text: "Demandes & conversations illimitées", included: false },
      { text: "Coach Cheikh Moussa illimité", included: false },
      { text: "Voir qui t'a mis en favori", included: false },
      { text: "Voir qui a visité ton profil", included: false },
      { text: "Messages vocaux 🎤", included: false },
      { text: "Message Flash personnalisé", included: false },
      { text: "Jusqu'à 10 photos HD", included: false },
      { text: "Score de compatibilité IA détaillé", included: false },
      { text: "Boosts de visibilité", included: false },
      { text: "Filtres avancés", included: false },
      { text: "Badge Premium vérifié", included: false },
    ],
    buttonText: "Commencer",
    popular: false,
    variant: "secondary",
  },
  {
    name: "Premium",
    price: "10",
    originalPrice: "15",
    period: "/ mois",
    description: "Maximise tes chances de trouver ta moitié",
    badge: "✨ OFFRE DE LANCEMENT",
    note: "* Tarif de lancement limité. Prix normal : 15 $ / mois",
    features: [
      { text: "Demandes de contact illimitées", included: true },
      { text: "Conversations illimitées en parallèle", included: true },
      { text: "Coach Cheikh Moussa : questions illimitées", included: true },
      { text: "Voir qui t'a ajouté en favoris ⭐", included: true },
      { text: "Voir qui a visité ton profil 🔴", included: true },
      { text: "Jusqu'à 10 photos HD sur ton profil", included: true },
      { text: "Messagerie 100 % illimitée", included: true },
      { text: "Messages vocaux 🎤", included: true, tag: "NOUVEAU" },
      { text: "Vois qui est connecté 🟢", included: true },
      { text: "Ice Breaker : idées de messages personnalisées", included: true },
      { text: "Message Flash : fais bonne impression", included: true },
      { text: "Score de compatibilité IA détaillé", included: true },
      { text: "Mieux classé dans les résultats", included: true },
      { text: "Filtres avancés (madhab, hijra…)", included: true },
      { text: "Boosts de profil inclus", included: true },
      { text: "Badge Premium vérifié ✓", included: true },
      { text: "Support prioritaire 7 j/7", included: true },
    ],
    buttonText: "Commencer",
    popular: true,
    variant: "primary",
  },
];
