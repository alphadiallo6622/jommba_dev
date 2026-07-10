"use client";

import { useLocale } from "next-intl";
import {
  ScrollText,
  Heart,
  Camera,
  MessageSquare,
  Users,
  Flag,
  Lock,
  ShieldAlert,
} from "lucide-react";
import LegalPage, { type LegalSection } from "@/components/legal/LegalPage";

const SECTIONS_FR: LegalSection[] = [
  {
    number: "01",
    icon: Heart,
    title: "Intention sincère",
    intro: "En t'inscrivant sur Jommba, tu t'engages à :",
    bullets: [
      "Rechercher sincèrement le mariage et non des relations haram",
      "Être honnête dans les informations que tu fournis",
      "Respecter la démarche des autres membres",
      "Agir avec pudeur et décence dans tous tes échanges",
    ],
  },
  {
    number: "02",
    icon: Camera,
    title: "Profil et photos",
    bullets: [
      <><strong className="text-text-primary">Photos pudiques :</strong> Les photos doivent être décentes et respectueuses. Pour les sœurs, nous recommandons des photos avec le hijab.</>,
      <><strong className="text-text-primary">Authenticité :</strong> Utilise des photos récentes et qui te représentent réellement. Les photos trompeuses sont interdites.</>,
      <><strong className="text-text-primary">Pas de photos de tiers :</strong> N'utilise pas de photos de célébrités, de personnages fictifs ou d'autres personnes.</>,
      <><strong className="text-text-primary">Informations véridiques :</strong> Toutes les informations de ton profil doivent être exactes et sincères.</>,
    ],
  },
  {
    number: "03",
    icon: MessageSquare,
    title: "Communication respectueuse",
    bullets: [
      <><strong className="text-text-primary">Langage approprié :</strong> Utilise un langage respectueux et évite les propos vulgaires, insultants ou à caractère sexuel.</>,
      <><strong className="text-text-primary">Respect du refus :</strong> Si une personne refuse ta demande de contact ou met fin à la conversation, respecte sa décision.</>,
      <><strong className="text-text-primary">Pas de harcèlement :</strong> Le harcèlement, les messages répétitifs non désirés et l'insistance sont strictement interdits.</>,
      <><strong className="text-text-primary">Pudeur dans les échanges :</strong> Garde en tête que tu communiques avec un(e) étranger(ère) avec qui tu n'es pas marié(e).</>,
    ],
  },
  {
    number: "04",
    icon: Users,
    title: "Implication de la famille",
    intro: "Conformément aux enseignements islamiques, nous encourageons :",
    bullets: [
      "L'implication de la famille dans le processus de recherche",
      "La transparence avec les proches concernant la démarche",
      "L'organisation de rencontres familiales lorsque les échanges deviennent sérieux",
    ],
  },
  {
    number: "05",
    icon: Flag,
    title: "Signalement et modération",
    bullets: [
      "Signale tout comportement inapproprié via le bouton dédié",
      "Notre équipe examine chaque signalement et prend les mesures nécessaires",
      "Les faux signalements peuvent entraîner des sanctions",
    ],
  },
  {
    number: "06",
    icon: Lock,
    title: "Confidentialité",
    bullets: [
      "Ne partage pas les informations ou photos d'autres membres sans leur consentement",
      "Protège tes propres informations personnelles jusqu'à ce que tu sois en confiance",
    ],
  },
  {
    number: "07",
    icon: ShieldAlert,
    title: "Comportements strictement interdits",
    bullets: [
      "Demander ou envoyer des photos indécentes",
      "Tenir des propos à caractère sexuel",
      "Usurper l'identité d'une autre personne",
      "Créer plusieurs comptes",
      "Harceler d'autres membres",
      "Demander de l'argent ou arnaquer",
      "Promouvoir des activités illégales ou contraires à l'Islam",
      "Diffuser des contenus haineux ou discriminatoires",
      "Utiliser la plateforme à des fins autres que le mariage",
    ],
  },
];

const SECTIONS_EN: LegalSection[] = [
  {
    number: "01",
    icon: Heart,
    title: "Sincere intention",
    intro: "By signing up on Jommba, you agree to:",
    bullets: [
      "Sincerely seek marriage and not haram relationships",
      "Be honest in the information you provide",
      "Respect the process of other members",
      "Act with modesty and decency in all your exchanges",
    ],
  },
  {
    number: "02",
    icon: Camera,
    title: "Profile and photos",
    bullets: [
      <><strong className="text-text-primary">Modest photos:</strong> Photos must be decent and respectful. For sisters, we recommend photos with hijab.</>,
      <><strong className="text-text-primary">Authenticity:</strong> Use recent photos that genuinely represent you. Misleading photos are prohibited.</>,
      <><strong className="text-text-primary">No third-party photos:</strong> Do not use photos of celebrities, fictional characters or other people.</>,
      <><strong className="text-text-primary">Truthful information:</strong> All information on your profile must be accurate and sincere.</>,
    ],
  },
  {
    number: "03",
    icon: MessageSquare,
    title: "Respectful communication",
    bullets: [
      <><strong className="text-text-primary">Appropriate language:</strong> Use respectful language and avoid vulgar, insulting or sexual remarks.</>,
      <><strong className="text-text-primary">Respecting refusal:</strong> If someone declines your contact request or ends the conversation, respect their decision.</>,
      <><strong className="text-text-primary">No harassment:</strong> Harassment, unwanted repeated messages and insistence are strictly prohibited.</>,
      <><strong className="text-text-primary">Modesty in exchanges:</strong> Keep in mind that you are communicating with someone you are not married to.</>,
    ],
  },
  {
    number: "04",
    icon: Users,
    title: "Family involvement",
    intro: "In accordance with Islamic teachings, we encourage:",
    bullets: [
      "Involving the family in the search process",
      "Transparency with relatives about the process",
      "Organizing family meetings when exchanges become serious",
    ],
  },
  {
    number: "05",
    icon: Flag,
    title: "Reporting and moderation",
    bullets: [
      "Report any inappropriate behavior via the dedicated button",
      "Our team reviews every report and takes the necessary measures",
      "False reports may result in sanctions",
    ],
  },
  {
    number: "06",
    icon: Lock,
    title: "Confidentiality",
    bullets: [
      "Do not share other members' information or photos without their consent",
      "Protect your own personal information until you are confident",
    ],
  },
  {
    number: "07",
    icon: ShieldAlert,
    title: "Strictly prohibited behavior",
    bullets: [
      "Requesting or sending indecent photos",
      "Making remarks of a sexual nature",
      "Impersonating another person",
      "Creating multiple accounts",
      "Harassing other members",
      "Asking for money or scamming",
      "Promoting illegal activities or activities contrary to Islam",
      "Spreading hateful or discriminatory content",
      "Using the platform for purposes other than marriage",
    ],
  },
];

export default function ReglementPage() {
  const locale = useLocale();
  const isEn = locale === "en";

  return (
    <LegalPage
      hero={{
        icon: ScrollText,
        titleStart: isEn ? "Site" : "Règlement du",
        titleAccent: isEn ? "rules" : "site",
        subtitle: isEn
          ? "To ensure a healthy and respectful environment, all members must follow these rules inspired by our Islamic values."
          : "Pour garantir un environnement sain et respectueux, tous les membres doivent respecter ces règles inspirées de nos valeurs islamiques.",
      }}
      sections={isEn ? SECTIONS_EN : SECTIONS_FR}
      cta={{
        title: isEn ? "By using Jommba" : "En utilisant Jommba",
        text: isEn
          ? "You confirm that you have read and accepted these rules. Failure to comply may result in the suspension or deletion of your account without notice."
          : "Tu confirmes avoir lu et accepté ce règlement. Le non-respect de ces règles peut entraîner la suspension ou la suppression de ton compte sans préavis.",
        buttonLabel: isEn ? "Contact us" : "Nous contacter",
      }}
      updatedLabel={isEn ? "Last updated: July 2026" : "Dernière mise à jour : Juillet 2026"}
    />
  );
}
