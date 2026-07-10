"use client";

import { useLocale } from "next-intl";
import {
  FileText,
  Database,
  Shield,
  Server,
  Globe,
  Users,
  Clock,
  FileCheck,
  AlertTriangle,
  UserCheck,
} from "lucide-react";
import LegalPage, { type LegalSection } from "@/components/legal/LegalPage";

const SECTIONS_FR: LegalSection[] = [
  {
    number: "Article 01",
    icon: FileText,
    title: "Objet de l'accord",
    intro: "Le présent Accord de Traitement des Données (« DPA ») régit le traitement des données personnelles effectué par Jommba pour le compte de ses utilisateurs (« Responsables de traitement ») dans le cadre de l'utilisation de la plateforme.",
    bullets: [
      <><strong className="text-text-primary">Périmètre :</strong> Cet accord s'applique à toutes les données personnelles traitées via la plateforme Jommba.</>,
      <><strong className="text-text-primary">Base légale :</strong> Règlement (UE) 2016/679 (RGPD) et lois locales applicables en matière de protection des données personnelles.</>,
      <><strong className="text-text-primary">Durée :</strong> Cet accord est valable pendant toute la durée d'utilisation de nos services.</>,
    ],
  },
  {
    number: "Article 02",
    icon: Database,
    title: "Nature des données traitées",
    intro: "Catégories de données :",
    bullets: [
      "Données d'identification (nom, prénom, pseudonyme)",
      "Coordonnées (email, localisation)",
      "Données de profil (âge, situation, description)",
      "Photos de profil",
      "Messages échangés entre utilisateurs",
      "Données de connexion et logs",
    ],
  },
  {
    number: "Article 03",
    icon: Shield,
    title: "Obligations du sous-traitant",
    intro: "Jommba, en tant que sous-traitant, s'engage à :",
    bullets: [
      <><strong className="text-text-primary">Traitement licite :</strong> Ne traiter les données que sur instructions documentées du responsable de traitement.</>,
      <><strong className="text-text-primary">Confidentialité :</strong> Garantir que les personnes autorisées à traiter les données sont soumises à une obligation de confidentialité.</>,
      <><strong className="text-text-primary">Sécurité :</strong> Mettre en œuvre les mesures techniques et organisationnelles appropriées.</>,
      <><strong className="text-text-primary">Sous-traitance :</strong> Ne pas faire appel à un autre sous-traitant sans autorisation préalable écrite.</>,
      <><strong className="text-text-primary">Notification :</strong> Notifier toute violation de données dans les 72 heures suivant sa découverte.</>,
    ],
  },
  {
    number: "Article 04",
    icon: Server,
    title: "Mesures de sécurité",
    intro: "Nous appliquons les mesures de sécurité suivantes conformément à l'article 32 du RGPD :",
    bullets: [
      <><strong className="text-text-primary">Chiffrement :</strong> Toutes les données sont chiffrées en transit (TLS 1.3) et au repos (AES-256).</>,
      <><strong className="text-text-primary">Pseudonymisation :</strong> Les données sensibles sont pseudonymisées lorsque possible.</>,
      <><strong className="text-text-primary">Contrôle d'accès :</strong> Accès restreint aux données selon le principe du moindre privilège.</>,
      <><strong className="text-text-primary">Sauvegardes :</strong> Sauvegardes quotidiennes chiffrées avec rétention de 30 jours.</>,
      <><strong className="text-text-primary">Surveillance :</strong> Surveillance continue des systèmes et détection des intrusions.</>,
    ],
  },
  {
    number: "Article 05",
    icon: Globe,
    title: "Transferts internationaux",
    intro: "Les données peuvent être transférées vers des pays tiers dans les conditions suivantes :",
    bullets: [
      <><strong className="text-text-primary">Hébergement :</strong> Vercel (USA) — Clauses contractuelles types (CCT) de la Commission européenne.</>,
      <><strong className="text-text-primary">Base de données :</strong> Supabase — Certifié SOC 2 Type II, CCT en place.</>,
      <><strong className="text-text-primary">Paiements :</strong> Stripe (USA) — Certifié PCI-DSS niveau 1.</>,
      <><strong className="text-text-primary">Emails :</strong> Fournisseur SMTP — CCT en place.</>,
    ],
  },
  {
    number: "Article 06",
    icon: Users,
    title: "Sous-traitants ultérieurs",
    intro: "Liste des sous-traitants autorisés :",
    bullets: [
      <><strong className="text-text-primary">Vercel Inc. :</strong> Hébergement et CDN — USA.</>,
      <><strong className="text-text-primary">Supabase :</strong> Base de données PostgreSQL.</>,
      <><strong className="text-text-primary">Stripe Inc. :</strong> Traitement des paiements — USA.</>,
      <><strong className="text-text-primary">Anthropic :</strong> Coach IA (Cheikh Abdallah) — USA.</>,
    ],
  },
  {
    number: "Article 07",
    icon: Clock,
    title: "Durée de conservation",
    bullets: [
      <><strong className="text-text-primary">Données de compte :</strong> Conservées pendant la durée d'inscription, puis supprimées sous 30 jours après suppression du compte.</>,
      <><strong className="text-text-primary">Compte banni :</strong> Jommba se réserve le droit de supprimer tout compte ne respectant pas les conditions d'utilisation, sans préavis ni remboursement.</>,
      <><strong className="text-text-primary">Messages :</strong> Conservés pendant 2 ans après le dernier échange, puis anonymisés.</>,
      <><strong className="text-text-primary">Logs de sécurité :</strong> Conservés 12 mois pour des raisons de sécurité et de conformité.</>,
    ],
  },
  {
    number: "Article 08",
    icon: FileCheck,
    title: "Fin du traitement",
    intro: "À la fin de la relation contractuelle, Jommba s'engage à :",
    bullets: [
      <><strong className="text-text-primary">Restitution :</strong> Fournir une copie des données au format structuré sur demande.</>,
      <><strong className="text-text-primary">Suppression :</strong> Supprimer définitivement toutes les données dans un délai de 30 jours.</>,
      <><strong className="text-text-primary">Attestation :</strong> Fournir une attestation de suppression sur demande.</>,
    ],
  },
  {
    number: "Article 09",
    icon: AlertTriangle,
    title: "Notification de violation",
    intro: "En cas de violation de données personnelles :",
    bullets: [
      <><strong className="text-text-primary">Délai :</strong> Notification au responsable de traitement dans les 72 heures.</>,
      <><strong className="text-text-primary">Contenu :</strong> Description de la nature de la violation, catégories de données concernées, mesures prises.</>,
      <><strong className="text-text-primary">Documentation :</strong> Tenue d'un registre de toutes les violations.</>,
    ],
  },
  {
    number: "Article 10",
    icon: UserCheck,
    title: "Droits des personnes concernées",
    intro: "Nous facilitons l'exercice des droits suivants :",
    bullets: [
      <><strong className="text-text-primary">Droit d'accès :</strong> Obtenir une copie de ses données personnelles.</>,
      <><strong className="text-text-primary">Droit de rectification :</strong> Corriger des données inexactes ou incomplètes.</>,
      <><strong className="text-text-primary">Droit à l'effacement :</strong> Demander la suppression de ses données.</>,
      <><strong className="text-text-primary">Droit à la portabilité :</strong> Recevoir ses données dans un format structuré.</>,
      <><strong className="text-text-primary">Droit d'opposition :</strong> S'opposer à certains traitements.</>,
    ],
  },
];

const SECTIONS_EN: LegalSection[] = [
  {
    number: "Article 01",
    icon: FileText,
    title: "Purpose of the agreement",
    intro: "This Data Processing Agreement (“DPA”) governs the processing of personal data carried out by Jommba on behalf of its users (“Data Controllers”) in the context of using the platform.",
    bullets: [
      <><strong className="text-text-primary">Scope:</strong> This agreement applies to all personal data processed through the Jommba platform.</>,
      <><strong className="text-text-primary">Legal basis:</strong> Regulation (EU) 2016/679 (GDPR) and applicable local personal data protection laws.</>,
      <><strong className="text-text-primary">Duration:</strong> This agreement is valid for the entire duration of use of our services.</>,
    ],
  },
  {
    number: "Article 02",
    icon: Database,
    title: "Nature of the data processed",
    intro: "Categories of data:",
    bullets: [
      "Identification data (last name, first name, pseudonym)",
      "Contact details (email, location)",
      "Profile data (age, situation, description)",
      "Profile photos",
      "Messages exchanged between users",
      "Connection data and logs",
    ],
  },
  {
    number: "Article 03",
    icon: Shield,
    title: "Processor obligations",
    intro: "Jommba, as a processor, undertakes to:",
    bullets: [
      <><strong className="text-text-primary">Lawful processing:</strong> Process data only on documented instructions from the data controller.</>,
      <><strong className="text-text-primary">Confidentiality:</strong> Ensure that persons authorized to process the data are bound by a confidentiality obligation.</>,
      <><strong className="text-text-primary">Security:</strong> Implement appropriate technical and organizational measures.</>,
      <><strong className="text-text-primary">Sub-processing:</strong> Not engage another processor without prior written authorization.</>,
      <><strong className="text-text-primary">Notification:</strong> Notify any data breach within 72 hours of its discovery.</>,
    ],
  },
  {
    number: "Article 04",
    icon: Server,
    title: "Security measures",
    intro: "We apply the following security measures in accordance with Article 32 of the GDPR:",
    bullets: [
      <><strong className="text-text-primary">Encryption:</strong> All data is encrypted in transit (TLS 1.3) and at rest (AES-256).</>,
      <><strong className="text-text-primary">Pseudonymization:</strong> Sensitive data is pseudonymized where possible.</>,
      <><strong className="text-text-primary">Access control:</strong> Access restricted to data based on the principle of least privilege.</>,
      <><strong className="text-text-primary">Backups:</strong> Daily encrypted backups with 30-day retention.</>,
      <><strong className="text-text-primary">Monitoring:</strong> Continuous system monitoring and intrusion detection.</>,
    ],
  },
  {
    number: "Article 05",
    icon: Globe,
    title: "International transfers",
    intro: "Data may be transferred to third countries under the following conditions:",
    bullets: [
      <><strong className="text-text-primary">Hosting:</strong> Vercel (USA) — Standard Contractual Clauses (SCC) of the European Commission.</>,
      <><strong className="text-text-primary">Database:</strong> Supabase — SOC 2 Type II certified, SCC in place.</>,
      <><strong className="text-text-primary">Payments:</strong> Stripe (USA) — PCI-DSS Level 1 certified.</>,
      <><strong className="text-text-primary">Emails:</strong> SMTP provider — SCC in place.</>,
    ],
  },
  {
    number: "Article 06",
    icon: Users,
    title: "Sub-processors",
    intro: "List of authorized sub-processors:",
    bullets: [
      <><strong className="text-text-primary">Vercel Inc.:</strong> Hosting and CDN — USA.</>,
      <><strong className="text-text-primary">Supabase:</strong> PostgreSQL database.</>,
      <><strong className="text-text-primary">Stripe Inc.:</strong> Payment processing — USA.</>,
      <><strong className="text-text-primary">Anthropic:</strong> AI Coach (Cheikh Abdallah) — USA.</>,
    ],
  },
  {
    number: "Article 07",
    icon: Clock,
    title: "Retention period",
    bullets: [
      <><strong className="text-text-primary">Account data:</strong> Retained for the duration of registration, then deleted within 30 days after account deletion.</>,
      <><strong className="text-text-primary">Banned account:</strong> Jommba reserves the right to delete any account not complying with the terms of use, without notice or refund.</>,
      <><strong className="text-text-primary">Messages:</strong> Retained for 2 years after the last exchange, then anonymized.</>,
      <><strong className="text-text-primary">Security logs:</strong> Retained for 12 months for security and compliance reasons.</>,
    ],
  },
  {
    number: "Article 08",
    icon: FileCheck,
    title: "End of processing",
    intro: "At the end of the contractual relationship, Jommba undertakes to:",
    bullets: [
      <><strong className="text-text-primary">Return:</strong> Provide a copy of the data in a structured format upon request.</>,
      <><strong className="text-text-primary">Deletion:</strong> Permanently delete all data within 30 days.</>,
      <><strong className="text-text-primary">Certification:</strong> Provide a certificate of deletion upon request.</>,
    ],
  },
  {
    number: "Article 09",
    icon: AlertTriangle,
    title: "Breach notification",
    intro: "In the event of a personal data breach:",
    bullets: [
      <><strong className="text-text-primary">Timeframe:</strong> Notification to the data controller within 72 hours.</>,
      <><strong className="text-text-primary">Content:</strong> Description of the nature of the breach, categories of data concerned, measures taken.</>,
      <><strong className="text-text-primary">Documentation:</strong> Keeping a register of all breaches.</>,
    ],
  },
  {
    number: "Article 10",
    icon: UserCheck,
    title: "Rights of data subjects",
    intro: "We facilitate the exercise of the following rights:",
    bullets: [
      <><strong className="text-text-primary">Right of access:</strong> Obtain a copy of one's personal data.</>,
      <><strong className="text-text-primary">Right to rectification:</strong> Correct inaccurate or incomplete data.</>,
      <><strong className="text-text-primary">Right to erasure:</strong> Request the deletion of one's data.</>,
      <><strong className="text-text-primary">Right to portability:</strong> Receive one's data in a structured format.</>,
      <><strong className="text-text-primary">Right to object:</strong> Object to certain processing.</>,
    ],
  },
];

export default function DPAPage() {
  const locale = useLocale();
  const isEn = locale === "en";

  return (
    <LegalPage
      hero={{
        icon: FileText,
        titleStart: isEn ? "Data Processing" : "Accord de Traitement des",
        titleAccent: isEn ? "Agreement" : "Données",
        subtitle: isEn
          ? "Data Processing Agreement (DPA) — Contractual document defining obligations regarding the protection of personal data."
          : "Data Processing Agreement (DPA) — Document contractuel définissant les obligations en matière de protection des données personnelles.",
        banner: {
          title: isEn ? "Compliance commitment" : "Engagement de conformité",
          text: isEn
            ? "Jommba is committed to complying with the General Data Protection Regulation (GDPR) and applicable local personal data protection laws. This DPA is an integral part of our Terms of Use."
            : "Jommba s'engage à respecter le Règlement Général sur la Protection des Données (RGPD) et les lois locales applicables en matière de protection des données personnelles. Ce DPA fait partie intégrante de nos Conditions Générales d'Utilisation.",
        },
      }}
      sections={isEn ? SECTIONS_EN : SECTIONS_FR}
      cta={{
        title: isEn ? "Data Protection Officer" : "Délégué à la Protection des Données",
        text: isEn
          ? "For any question about this DPA or the protection of your data, contact us."
          : "Pour toute question relative à ce DPA ou à la protection de vos données, contactez-nous.",
        buttonLabel: isEn ? "Contact" : "Contacter",
      }}
      updatedLabel={isEn ? "Version 1.0 — Last updated: July 2026" : "Version 1.0 — Dernière mise à jour : Juillet 2026"}
    />
  );
}
