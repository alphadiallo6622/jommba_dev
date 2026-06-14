export type FaqItem = { question: string; answer: string }
export type FaqCategory = { id: string; label: string; icon: string; items: FaqItem[] }

export const faqCategories: FaqCategory[] = [
  {
    id: 'inscription',
    label: 'Inscription',
    icon: 'UserPlus',
    items: [
      { question: 'Comment créer mon profil ?', answer: 'Télécharge l\'app Jommba, clique sur "S\'inscrire" et suis les étapes. Remplis tes informations personnelles, religieuses et tes attentes. Plus ton profil est complet, plus tu as de chances d\'être contacté(e).' },
      { question: 'Quelles informations sont obligatoires ?', answer: 'Le prénom, l\'âge, la ville, la situation matrimoniale et ta vision du mariage sont obligatoires. Les autres informations enrichissent ton profil et améliorent tes chances.' },
      { question: 'Puis-je modifier mon profil après inscription ?', answer: 'Oui, tu peux modifier toutes tes informations à tout moment depuis l\'onglet Paramètres > Mes informations.' },
    ],
  },
  {
    id: 'demandes',
    label: 'Demandes',
    icon: 'Heart',
    items: [
      { question: 'Combien de demandes puis-je envoyer par jour ?', answer: 'Avec le compte gratuit, tu peux envoyer 3 demandes par jour. Avec Premium, ce nombre passe à 10 demandes par jour, avec de meilleures chances de visibilité.' },
      { question: 'Que se passe-t-il quand ma demande est acceptée ?', answer: 'Quand une personne accepte ta demande, vous pouvez commencer à échanger des messages directement. Tu reçois une notification immédiate.' },
      { question: 'Puis-je retirer une demande envoyée ?', answer: 'Non, une demande envoyée ne peut pas être retirée. Sois certain(e) de ton choix avant d\'envoyer une demande.' },
    ],
  },
  {
    id: 'messages',
    label: 'Messages',
    icon: 'MessageCircle',
    items: [
      { question: 'Comment envoyer un message ?', answer: 'Tu ne peux envoyer un message qu\'après qu\'une demande de contact ait été acceptée des deux côtés. Va dans l\'onglet Messages pour accéder à tes conversations.' },
      { question: 'Les messages sont-ils privés ?', answer: 'Oui, tous les messages sont privés et chiffrés. Seuls toi et la personne avec qui tu échanges pouvez les lire. L\'équipe Jommba n\'y a pas accès.' },
      { question: 'Puis-je supprimer une conversation ?', answer: 'Oui, tu peux supprimer une conversation depuis l\'écran de messagerie. Cela supprime les messages de ton côté uniquement.' },
    ],
  },
  {
    id: 'photos',
    label: 'Photos',
    icon: 'Camera',
    items: [
      { question: 'Pourquoi flouter mes photos ?', answer: 'Flouter tes photos te permet de protéger ta vie privée. Seules les personnes que tu acceptes pourront voir tes photos en clair. Cette option est disponible dans Paramètres > Confidentialité.' },
      { question: 'Combien de photos puis-je ajouter ?', answer: 'Avec le compte gratuit, tu peux ajouter 1 photo principale. Avec Premium, tu peux ajouter jusqu\'à 6 photos pour enrichir ton profil.' },
      { question: 'Quels types de photos sont acceptés ?', answer: 'Les photos doivent respecter les valeurs islamiques : tenues décentes, visage visible. Les photos inappropriées seront supprimées et peuvent entraîner la suspension du compte.' },
    ],
  },
  {
    id: 'premium',
    label: 'Premium',
    icon: 'Crown',
    items: [
      { question: 'Quels sont les avantages Premium ?', answer: 'Premium offre : jusqu\'à 6 photos, 10 demandes/jour, voir qui a visité ton profil, flouter tes photos, priorité dans les résultats, badge Premium visible, et accès aux fonctionnalités IA.' },
      { question: 'Quel est le prix de Premium ?', answer: 'Jommba Premium est à 10 $/mois (prix normal 15 $/mois). Tu peux résilier à tout moment depuis Paramètres > Compte.' },
      { question: 'Comment payer l\'abonnement Premium ?', answer: 'Le paiement se fait par carte bancaire, Mobile Money (Wave, Orange Money) ou PayPal. Tous les paiements sont sécurisés.' },
    ],
  },
  {
    id: 'securite',
    label: 'Sécurité',
    icon: 'Shield',
    items: [
      { question: 'Comment signaler un profil suspect ?', answer: 'Sur chaque profil, clique sur le menu (...) puis "Signaler". Notre équipe examine chaque signalement dans les 24 heures.' },
      { question: 'Comment bloquer quelqu\'un ?', answer: 'Depuis le profil de la personne, clique sur le menu (...) puis "Bloquer". Cette personne ne pourra plus te voir ni te contacter.' },
      { question: 'Mon profil est-il visible par tout le monde ?', answer: 'Ton profil est visible par les membres inscrits sur Jommba. Tu peux choisir de flouter tes photos (Premium) pour plus de confidentialité.' },
    ],
  },
  {
    id: 'compte',
    label: 'Mon compte',
    icon: 'Settings',
    items: [
      { question: 'Comment suspendre mon compte ?', answer: 'Va dans Paramètres > Compte > Suspendre le compte. Ton profil sera masqué temporairement. Tu pourras le réactiver à tout moment en te reconnectant.' },
      { question: 'Comment supprimer mon compte ?', answer: 'Va dans Paramètres > Compte > Supprimer le compte. Cette action est irréversible : toutes tes données et conversations seront définitivement supprimées.' },
      { question: 'J\'ai oublié mon mot de passe, que faire ?', answer: 'Sur la page de connexion, clique sur "Mot de passe oublié" et entre ton email. Tu recevras un lien de réinitialisation.' },
    ],
  },
  {
    id: 'valeurs',
    label: 'Nos valeurs',
    icon: 'BookOpen',
    items: [
      { question: 'Jommba respecte-t-il les valeurs islamiques ?', answer: 'Oui, Jommba est conçu pour respecter les valeurs islamiques du mariage. Toutes les fonctionnalités visent à faciliter une rencontre sérieuse dans le respect de la pudeur et de la religion.' },
      { question: 'Y a-t-il un accompagnement pour le mariage ?', answer: 'Jommba propose un coach IA pour t\'aider à rédiger ton profil et tes messages. Nous travaillons également sur un accompagnement humain avec des médiateurs certifiés.' },
      { question: 'Comment Jommba vérifie-t-il les profils ?', answer: 'Les profils peuvent obtenir un badge de vérification en soumettant une pièce d\'identité. Cette vérification renforce la confiance dans les échanges.' },
    ],
  },
]

export const tutorialSteps = [
  { step: 1, title: 'Complète ton profil', description: 'Remplis toutes les sections pour maximiser ta visibilité.' },
  { step: 2, title: 'Ajoute une belle photo', description: 'Une photo de profil augmente les chances de contact de 3x.' },
  { step: 3, title: 'Envoie des demandes', description: 'Explore les profils et envoie jusqu\'à 3 demandes par jour.' },
  { step: 4, title: 'Échange des messages', description: 'Quand une demande est acceptée, commence la conversation.' },
]

export const platformStats = {
  members: '50 000+',
  couples: '2 000+',
  countries: '15',
  satisfaction: '94%',
}
