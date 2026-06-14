export interface FAQItem {
  question: string;
  answer: string;
}

export interface FAQCategory {
  id: string;
  label: string;
  iconName: "User" | "ShieldAlert" | "MessageSquare" | "Star" | "Lock";
  items: FAQItem[];
}

export const FAQ_DATA: FAQCategory[] = [
  {
    id: "account",
    label: "Inscription & Compte",
    iconName: "User",
    items: [
      {
        question: "Comment créer un compte sur Jommba ?",
        answer: "Pour créer un compte, cliquez sur le bouton 'S'inscrire' en haut à droite. Remplissez ensuite notre formulaire détaillé en fournissant des informations sincères sur votre profil, vos critères de recherche et vos attentes religieuses. L'inscription prend moins de 3 minutes.",
      },
      {
        question: "L'inscription est-elle vraiment gratuite ?",
        answer: "Oui, la création de profil, la recherche de partenaires et la réception de visites/likes sont totalement gratuites. Vous pouvez utiliser les fonctionnalités de base sans limite de temps. Un pass Premium payant est disponible pour débloquer les échanges illimités.",
      },
      {
        question: "Puis-je supprimer mon compte à tout moment ?",
        answer: "Tout à fait. Si vous avez trouvé votre moitié ou si vous désirez simplement quitter la plateforme, vous pouvez supprimer définitivement votre compte depuis les paramètres de votre espace utilisateur. Toutes vos données personnelles seront immédiatement effacées.",
      },
    ],
  },
  {
    id: "verification",
    label: "Profils & Vérification",
    iconName: "ShieldAlert",
    items: [
      {
        question: "Pourquoi mon profil est-il en attente de validation ?",
        answer: "Afin de garantir un environnement de confiance et d'éviter les faux profils, chaque inscription et chaque photo sont validées manuellement par nos équipes de modération. Ce processus prend généralement entre 1 et 12 heures.",
      },
      {
        question: "Quelles sont les règles concernant les photos ?",
        answer: "Les photos doivent être décentes et conformes à l'éthique islamique (visage visible, tenue correcte). Jommba propose une option unique de floutage : vous pouvez choisir de rendre vos photos floues pour tous les membres et de ne les dévoiler qu'aux personnes avec lesquelles vous avez un échange sérieux.",
      },
    ],
  },
  {
    id: "messaging",
    label: "Messagerie",
    iconName: "MessageSquare",
    items: [
      {
        question: "Comment contacter un prétendant ?",
        answer: "Lorsque vous visitez un profil qui vous intéresse, vous pouvez lui envoyer un 'Like' ou engager la discussion par message s'il vous a également aimé en retour. Les membres Premium peuvent envoyer des messages directement sans attendre un match.",
      },
      {
        question: "Puis-je impliquer mon tuteur (Wali) dans la discussion ?",
        answer: "Oui, Jommba encourage l'implication de la famille. Vous pouvez ajouter l'adresse e-mail de votre tuteur (Wali) pour qu'il reçoive des notifications et puisse participer ou superviser les échanges dans le cadre d'un dialogue serein et respectueux.",
      },
    ],
  },
  {
    id: "premium",
    label: "Premium Pass",
    iconName: "Star",
    items: [
      {
        question: "Quels sont les avantages du Premium Pass ?",
        answer: "Le Pass Premium vous permet d'envoyer des messages illimités, de voir précisément qui a aimé ou visité votre profil, de masquer vos photos aux utilisateurs non enregistrés, d'obtenir le badge de profil vérifié en priorité et de bénéficier d'un boost de visibilité hebdomadaire.",
      },
      {
        question: "Les abonnements sont-ils sans engagement ?",
        answer: "Oui, nos abonnements sont mensuels et sans engagement. Vous pouvez annuler le renouvellement automatique à tout moment en un clic depuis vos paramètres de facturation, sans frais supplémentaires.",
      },
    ],
  },
  {
    id: "security",
    label: "Sécurité & Confidentialité",
    iconName: "Lock",
    items: [
      {
        question: "Comment Jommba protège-t-il mes données ?",
        answer: "Toutes vos données de connexion et vos messages sont chiffrés de bout en bout (SSL). Nous ne partageons jamais vos données avec des tiers et nous n'affichons aucune publicité sur notre plateforme. Votre vie privée reste privée.",
      },
      {
        question: "Comment signaler un comportement inapproprié ?",
        answer: "Si vous constatez un comportement irrespectueux ou suspect, cliquez immédiatement sur le bouton 'Signaler' présent sur le profil de l'utilisateur ou dans la fenêtre de discussion. Nos modérateurs interviendront en priorité pour suspendre les profils malveillants.",
      },
    ],
  },
];

