"use client";

import { useLocale } from "next-intl";
import {
  FileText,
  CreditCard,
  Clock,
  Wallet,
  RefreshCw,
  AlertTriangle,
  ShieldCheck,
  Scale,
  FilePen,
  Gavel,
} from "lucide-react";
import LegalPage, { type LegalSection } from "@/components/legal/LegalPage";
import { CONTACT_INFO } from "@/lib/constants";

const SECTIONS_FR: LegalSection[] = [
  {
    number: "01",
    icon: FileText,
    title: "Objet",
    paragraphs: [
      "Les présentes Conditions Générales de Vente (CGV) régissent les ventes de services Premium proposés sur la plateforme Jommba.",
      "Jommba est une plateforme de mise en relation pour musulmans recherchant le mariage.",
      "En souscrivant à un abonnement Premium, tu acceptes sans réserve les présentes CGV.",
    ],
  },
  {
    number: "02",
    icon: CreditCard,
    title: "Services Premium",
    intro: "L'abonnement Premium donne accès aux fonctionnalités suivantes :",
    bullets: [
      <><strong className="text-text-primary">Photos illimitées :</strong> Possibilité d'ajouter jusqu'à 6 photos sur ton profil (contre 1 pour les comptes gratuits).</>,
      <><strong className="text-text-primary">Contacts illimités :</strong> Envoi illimité de demandes de contact par jour (contre 3 pour les comptes gratuits).</>,
      <><strong className="text-text-primary">Visibilité prioritaire :</strong> Ton profil apparaît en priorité dans les suggestions des autres membres.</>,
      <><strong className="text-text-primary">Badge Premium :</strong> Un badge distinctif indiquant ton statut Premium aux autres membres.</>,
      <><strong className="text-text-primary">Coach illimité :</strong> Accès illimité aux questions du Coach Cheikh Abdallah.</>,
      <><strong className="text-text-primary">Statistiques avancées :</strong> Accès aux statistiques détaillées de ton profil (vues, favoris, etc.).</>,
    ],
  },
  {
    number: "03",
    icon: Clock,
    title: "Durée et tarifs",
    paragraphs: [
      "Les abonnements Premium sont proposés pour des durées de 1 mois, 3 mois ou 6 mois.",
      "Les tarifs en vigueur sont affichés sur la page Tarifs de notre site. Tous les prix incluent les taxes applicables.",
      "Les tarifs peuvent être modifiés à tout moment. Les modifications n'affectent pas les abonnements en cours.",
    ],
  },
  {
    number: "04",
    icon: Wallet,
    title: "Modalités de paiement",
    intro: "Les paiements peuvent être effectués via :",
    bullets: [
      <><strong className="text-text-primary">Carte bancaire :</strong> Paiement par carte Visa ou Mastercard (via Stripe).</>,
      <><strong className="text-text-primary">Mobile Money :</strong> Paiement via les principaux services de paiement mobile.</>,
      <span className="italic text-text-muted">Le paiement est exigible immédiatement à la commande. L'abonnement Premium est activé dès la confirmation du paiement.</span>,
    ],
  },
  {
    number: "05",
    icon: RefreshCw,
    title: "Renouvellement",
    paragraphs: [
      "Les abonnements Premium ne sont PAS automatiquement renouvelés. À l'expiration de ton abonnement, tu conserves ton compte mais perds l'accès aux fonctionnalités Premium.",
      "Tu peux renouveler ton abonnement à tout moment depuis ton espace Premium.",
      "Aucun prélèvement automatique n'est effectué sans consentement explicite.",
    ],
  },
  {
    number: "06",
    icon: AlertTriangle,
    title: "Droit de rétractation",
    paragraphs: [
      "Conformément à la réglementation en vigueur, tu disposes d'un délai de 14 jours à compter de la souscription pour exercer ton droit de rétractation, sans avoir à justifier de motifs.",
      "Toutefois, en acceptant que l'exécution du service commence immédiatement lors de la souscription, tu renonces expressément à ce droit de rétractation.",
      <>Pour exercer ce droit dans les cas éligibles, contacte-nous à <a href={`mailto:${CONTACT_INFO.email}`} className="text-primary hover:underline">{CONTACT_INFO.email}</a> avec ta demande et les informations de ton compte.</>,
    ],
  },
  {
    number: "07",
    icon: ShieldCheck,
    title: "Remboursements",
    intro: "Les remboursements peuvent être accordés dans les cas suivants :",
    bullets: [
      <><strong className="text-text-primary">Problème technique majeur :</strong> Si un dysfonctionnement de notre plateforme t'empêche d'utiliser les services Premium pendant plus de 7 jours consécutifs.</>,
      <><strong className="text-text-primary">Double facturation :</strong> En cas de facturation en double par erreur technique.</>,
      <><strong className="text-text-primary">Fermeture de compte injustifiée :</strong> Si ton compte est fermé par erreur alors que tu n'as pas enfreint nos règles.</>,
      <span className="italic text-text-muted">Les demandes de remboursement doivent être adressées à {CONTACT_INFO.email} dans un délai de 30 jours suivant l'incident. Chaque demande est examinée au cas par cas.</span>,
    ],
  },
  {
    number: "08",
    icon: Scale,
    title: "Responsabilités",
    paragraphs: [
      "Jommba s'engage à fournir les services Premium décrits avec diligence. Cependant, nous ne garantissons pas de résultats spécifiques (rencontres, mariage, etc.).",
      "En cas de violation de nos règlements, nous nous réservons le droit de suspendre ou résilier ton abonnement Premium sans remboursement.",
      "Jommba ne saurait être tenu responsable des dommages indirects résultant de l'utilisation de ses services.",
    ],
  },
  {
    number: "09",
    icon: FilePen,
    title: "Modification des CGV",
    paragraphs: [
      "Jommba se réserve le droit de modifier les présentes CGV à tout moment. Les modifications entrent en vigueur dès leur publication sur le site.",
      "Les utilisateurs seront informés des modifications substantielles par email ou notification sur la plateforme.",
      "La poursuite de l'utilisation des services après modification vaut acceptation des nouvelles CGV.",
    ],
  },
  {
    number: "10",
    icon: Gavel,
    title: "Litiges et droit applicable",
    paragraphs: [
      "Les présentes CGV sont soumises au droit applicable au lieu du siège de l'éditeur.",
      "En cas de litige, une solution amiable sera recherchée avant toute action judiciaire.",
      "À défaut d'accord amiable, les tribunaux compétents seront seuls compétents.",
    ],
  },
];

const SECTIONS_EN: LegalSection[] = [
  {
    number: "01",
    icon: FileText,
    title: "Purpose",
    paragraphs: [
      "These Terms of Sale govern the sale of Premium services offered on the Jommba platform.",
      "Jommba is a matchmaking platform for Muslims seeking marriage.",
      "By subscribing to a Premium plan, you fully accept these Terms of Sale.",
    ],
  },
  {
    number: "02",
    icon: CreditCard,
    title: "Premium services",
    intro: "The Premium subscription gives access to the following features:",
    bullets: [
      <><strong className="text-text-primary">Unlimited photos:</strong> Ability to add up to 6 photos to your profile (versus 1 for free accounts).</>,
      <><strong className="text-text-primary">Unlimited contacts:</strong> Unlimited contact requests per day (versus 3 for free accounts).</>,
      <><strong className="text-text-primary">Priority visibility:</strong> Your profile appears first in other members' suggestions.</>,
      <><strong className="text-text-primary">Premium badge:</strong> A distinctive badge indicating your Premium status to other members.</>,
      <><strong className="text-text-primary">Unlimited coach:</strong> Unlimited access to questions for Coach Cheikh Abdallah.</>,
      <><strong className="text-text-primary">Advanced statistics:</strong> Access to detailed statistics on your profile (views, favorites, etc.).</>,
    ],
  },
  {
    number: "03",
    icon: Clock,
    title: "Duration and pricing",
    paragraphs: [
      "Premium subscriptions are offered for durations of 1 month, 3 months or 6 months.",
      "Current prices are displayed on the Pricing page of our site. All prices include applicable taxes.",
      "Prices may be changed at any time. Changes do not affect ongoing subscriptions.",
    ],
  },
  {
    number: "04",
    icon: Wallet,
    title: "Payment methods",
    intro: "Payments can be made via:",
    bullets: [
      <><strong className="text-text-primary">Bank card:</strong> Payment by Visa or Mastercard (via Stripe).</>,
      <><strong className="text-text-primary">Mobile Money:</strong> Payment via major mobile payment services.</>,
      <span className="italic text-text-muted">Payment is due immediately upon order. The Premium subscription is activated as soon as payment is confirmed.</span>,
    ],
  },
  {
    number: "05",
    icon: RefreshCw,
    title: "Renewal",
    paragraphs: [
      "Premium subscriptions are NOT automatically renewed. When your subscription expires, you keep your account but lose access to Premium features.",
      "You can renew your subscription at any time from your Premium area.",
      "No automatic debit is made without explicit consent.",
    ],
  },
  {
    number: "06",
    icon: AlertTriangle,
    title: "Right of withdrawal",
    paragraphs: [
      "In accordance with current regulations, you have a period of 14 days from subscription to exercise your right of withdrawal, without having to justify any reasons.",
      "However, by agreeing that the service begins immediately upon subscription, you expressly waive this right of withdrawal.",
      <>To exercise this right in eligible cases, contact us at <a href={`mailto:${CONTACT_INFO.email}`} className="text-primary hover:underline">{CONTACT_INFO.email}</a> with your request and account information.</>,
    ],
  },
  {
    number: "07",
    icon: ShieldCheck,
    title: "Refunds",
    intro: "Refunds may be granted in the following cases:",
    bullets: [
      <><strong className="text-text-primary">Major technical issue:</strong> If a malfunction of our platform prevents you from using Premium services for more than 7 consecutive days.</>,
      <><strong className="text-text-primary">Double billing:</strong> In case of double billing due to a technical error.</>,
      <><strong className="text-text-primary">Unjustified account closure:</strong> If your account is closed by mistake when you have not broken our rules.</>,
      <span className="italic text-text-muted">Refund requests must be sent to {CONTACT_INFO.email} within 30 days of the incident. Each request is reviewed on a case-by-case basis.</span>,
    ],
  },
  {
    number: "08",
    icon: Scale,
    title: "Responsibilities",
    paragraphs: [
      "Jommba undertakes to provide the described Premium services diligently. However, we do not guarantee specific results (matches, marriage, etc.).",
      "In case of violation of our rules, we reserve the right to suspend or terminate your Premium subscription without refund.",
      "Jommba cannot be held liable for indirect damages resulting from the use of its services.",
    ],
  },
  {
    number: "09",
    icon: FilePen,
    title: "Modification of the Terms",
    paragraphs: [
      "Jommba reserves the right to modify these Terms at any time. Changes take effect as soon as they are published on the site.",
      "Users will be informed of substantial changes by email or notification on the platform.",
      "Continued use of the services after modification constitutes acceptance of the new Terms.",
    ],
  },
  {
    number: "10",
    icon: Gavel,
    title: "Disputes and applicable law",
    paragraphs: [
      "These Terms are subject to the law applicable at the location of the publisher's registered office.",
      "In the event of a dispute, an amicable solution will be sought before any legal action.",
      "Failing an amicable agreement, the competent courts shall have sole jurisdiction.",
    ],
  },
];

export default function CGVPage() {
  const locale = useLocale();
  const isEn = locale === "en";

  return (
    <LegalPage
      hero={{
        icon: CreditCard,
        titleStart: isEn ? "Terms of" : "Conditions Générales de",
        titleAccent: isEn ? "Sale" : "Vente",
        subtitle: isEn
          ? "Information about our Premium services, payments and terms of sale."
          : "Informations sur nos services Premium, paiements et conditions de vente.",
      }}
      sections={isEn ? SECTIONS_EN : SECTIONS_FR}
      cta={{
        title: isEn ? "A question about our Terms?" : "Une question sur nos CGV ?",
        text: isEn
          ? "Our team is available to answer all your questions."
          : "Notre équipe est disponible pour répondre à toutes tes questions.",
        buttonLabel: isEn ? "Contact" : "Contacter",
      }}
      updatedLabel={isEn ? "Last updated: July 2026" : "Dernière mise à jour : Juillet 2026"}
    />
  );
}
