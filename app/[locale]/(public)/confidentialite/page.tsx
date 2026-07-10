"use client";

import { useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  Lock,
  Database,
  Target,
  Share2,
  Shield,
  UserCheck,
  Cookie,
  Clock,
} from "lucide-react";
import LegalPage, { type LegalSection } from "@/components/legal/LegalPage";
import { CONTACT_INFO } from "@/lib/constants";

const SECTIONS_FR: LegalSection[] = [
  {
    number: "01",
    icon: Database,
    title: "Données que nous collectons",
    intro: "Pour te proposer notre service de mise en relation, nous collectons :",
    bullets: [
      <><strong className="text-text-primary">Données d'inscription :</strong> Nom ou pseudonyme, email, mot de passe (chiffré).</>,
      <><strong className="text-text-primary">Données de profil :</strong> Âge, sexe, situation, localisation, description, photos.</>,
      <><strong className="text-text-primary">Données d'usage :</strong> Messages, favoris, demandes de contact, historique de navigation.</>,
      <><strong className="text-text-primary">Données techniques :</strong> Adresse IP, type d'appareil, logs de connexion.</>,
    ],
  },
  {
    number: "02",
    icon: Target,
    title: "Utilisation de tes données",
    intro: "Nous utilisons tes données uniquement pour :",
    bullets: [
      "Créer et gérer ton compte et ton profil",
      "Te proposer des profils compatibles",
      "Permettre les échanges entre membres",
      "Assurer la modération et la sécurité de la plateforme",
      "T'envoyer des notifications liées à ton activité",
      "Améliorer nos services",
    ],
  },
  {
    number: "03",
    icon: Share2,
    title: "Partage des données",
    paragraphs: [
      "Nous ne vendons jamais tes données personnelles à des tiers.",
      "Tes données de profil (hors email et informations sensibles) sont visibles par les autres membres selon tes réglages de confidentialité.",
      <>Nous faisons appel à des sous-traitants techniques (hébergement, paiement, emails) encadrés par notre <Link href="/dpa" className="text-primary font-semibold hover:underline">Accord de Traitement des Données</Link>.</>,
    ],
  },
  {
    number: "04",
    icon: Shield,
    title: "Sécurité",
    intro: "Nous protégeons tes données par des mesures rigoureuses :",
    bullets: [
      "Chiffrement en transit (TLS) et au repos",
      "Mots de passe hachés (jamais stockés en clair)",
      "Contrôle d'accès strict et surveillance continue",
      "Sauvegardes régulières chiffrées",
    ],
  },
  {
    number: "05",
    icon: UserCheck,
    title: "Tes droits",
    intro: "Conformément au RGPD, tu disposes des droits suivants :",
    bullets: [
      "Droit d'accès à tes données",
      "Droit de rectification",
      "Droit à l'effacement (« droit à l'oubli »)",
      "Droit à la portabilité de tes données",
      "Droit d'opposition et de limitation du traitement",
    ],
  },
  {
    number: "06",
    icon: Cookie,
    title: "Cookies",
    paragraphs: [
      "Nous utilisons des cookies strictement nécessaires au fonctionnement du site (session, authentification, préférence de langue).",
      "Aucun cookie publicitaire ou de suivi tiers non essentiel n'est utilisé sans ton consentement.",
    ],
  },
  {
    number: "07",
    icon: Clock,
    title: "Conservation",
    paragraphs: [
      "Tes données sont conservées tant que ton compte est actif.",
      "En cas de suppression de compte, tes données personnelles sont effacées dans un délai de 30 jours, sauf obligations légales de conservation.",
    ],
  },
  {
    number: "08",
    icon: Lock,
    title: "Contact",
    paragraphs: [
      <>Pour toute question relative à tes données personnelles ou pour exercer tes droits, contacte-nous à <a href={`mailto:${CONTACT_INFO.email}`} className="text-primary hover:underline">{CONTACT_INFO.email}</a>.</>,
    ],
  },
];

const SECTIONS_EN: LegalSection[] = [
  {
    number: "01",
    icon: Database,
    title: "Data we collect",
    intro: "To provide our matchmaking service, we collect:",
    bullets: [
      <><strong className="text-text-primary">Registration data:</strong> Name or pseudonym, email, password (encrypted).</>,
      <><strong className="text-text-primary">Profile data:</strong> Age, gender, situation, location, description, photos.</>,
      <><strong className="text-text-primary">Usage data:</strong> Messages, favorites, contact requests, browsing history.</>,
      <><strong className="text-text-primary">Technical data:</strong> IP address, device type, connection logs.</>,
    ],
  },
  {
    number: "02",
    icon: Target,
    title: "Use of your data",
    intro: "We use your data only to:",
    bullets: [
      "Create and manage your account and profile",
      "Suggest compatible profiles to you",
      "Enable exchanges between members",
      "Ensure moderation and security of the platform",
      "Send you notifications related to your activity",
      "Improve our services",
    ],
  },
  {
    number: "03",
    icon: Share2,
    title: "Data sharing",
    paragraphs: [
      "We never sell your personal data to third parties.",
      "Your profile data (excluding email and sensitive information) is visible to other members according to your privacy settings.",
      <>We use technical processors (hosting, payment, emails) governed by our <Link href="/dpa" className="text-primary font-semibold hover:underline">Data Processing Agreement</Link>.</>,
    ],
  },
  {
    number: "04",
    icon: Shield,
    title: "Security",
    intro: "We protect your data with rigorous measures:",
    bullets: [
      "Encryption in transit (TLS) and at rest",
      "Hashed passwords (never stored in plain text)",
      "Strict access control and continuous monitoring",
      "Regular encrypted backups",
    ],
  },
  {
    number: "05",
    icon: UserCheck,
    title: "Your rights",
    intro: "In accordance with the GDPR, you have the following rights:",
    bullets: [
      "Right of access to your data",
      "Right to rectification",
      "Right to erasure (“right to be forgotten”)",
      "Right to portability of your data",
      "Right to object and to restriction of processing",
    ],
  },
  {
    number: "06",
    icon: Cookie,
    title: "Cookies",
    paragraphs: [
      "We use cookies strictly necessary for the operation of the site (session, authentication, language preference).",
      "No advertising or non-essential third-party tracking cookies are used without your consent.",
    ],
  },
  {
    number: "07",
    icon: Clock,
    title: "Retention",
    paragraphs: [
      "Your data is retained as long as your account is active.",
      "In case of account deletion, your personal data is erased within 30 days, except for legal retention obligations.",
    ],
  },
  {
    number: "08",
    icon: Lock,
    title: "Contact",
    paragraphs: [
      <>For any question about your personal data or to exercise your rights, contact us at <a href={`mailto:${CONTACT_INFO.email}`} className="text-primary hover:underline">{CONTACT_INFO.email}</a>.</>,
    ],
  },
];

export default function ConfidentialitePage() {
  const locale = useLocale();
  const isEn = locale === "en";

  return (
    <LegalPage
      hero={{
        icon: Lock,
        titleStart: isEn ? "Privacy" : "Politique de",
        titleAccent: isEn ? "Policy" : "Confidentialité",
        subtitle: isEn
          ? "How we collect, use and protect your personal data with respect for your privacy."
          : "Comment nous collectons, utilisons et protégeons tes données personnelles dans le respect de ta vie privée.",
      }}
      sections={isEn ? SECTIONS_EN : SECTIONS_FR}
      cta={{
        title: isEn ? "A question about your data?" : "Une question sur tes données ?",
        text: isEn
          ? "Our team is available for any question about the protection of your data."
          : "Notre équipe est à ta disposition pour toute question concernant la protection de tes données.",
        buttonLabel: isEn ? "Contact us" : "Nous contacter",
      }}
      updatedLabel={isEn ? "Last updated: July 2026" : "Dernière mise à jour : Juillet 2026"}
    />
  );
}
