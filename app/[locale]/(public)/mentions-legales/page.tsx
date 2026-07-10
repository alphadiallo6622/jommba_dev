"use client";

import { useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  Scale,
  Building2,
  Server,
  Shield,
  FileText,
  Globe,
} from "lucide-react";
import LegalPage, { type LegalSection } from "@/components/legal/LegalPage";
import { CONTACT_INFO } from "@/lib/constants";

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 py-2.5 border-b border-primary-light/40 last:border-0">
      <span className="text-xs text-text-muted font-medium sm:w-52 shrink-0">{label}</span>
      <span className="text-sm text-text-primary">{value}</span>
    </div>
  );
}

const SECTIONS_FR: LegalSection[] = [
  {
    icon: Building2,
    title: "Éditeur du site",
    paragraphs: [
      <div className="-mt-1">
        <InfoRow label="Nom du site" value="Jommba" />
        <InfoRow label="Statut" value="Entreprise individuelle" />
        <InfoRow label="Siège social" value={CONTACT_INFO.address} />
        <InfoRow label="Email de contact" value={<a href={`mailto:${CONTACT_INFO.email}`} className="text-primary hover:underline">{CONTACT_INFO.email}</a>} />
        <InfoRow label="Directeur de la publication" value="Le gérant de Jommba" />
      </div>,
    ],
  },
  {
    icon: Server,
    title: "Hébergement",
    paragraphs: [
      <div className="-mt-1">
        <InfoRow label="Hébergeur" value="Vercel Inc." />
        <InfoRow label="Adresse" value="340 S Lemon Ave #4133, Walnut, CA 91789, USA" />
        <InfoRow label="Site web" value={<a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">https://vercel.com</a>} />
      </div>,
    ],
  },
  {
    icon: Shield,
    title: "Propriété intellectuelle",
    paragraphs: [
      "L'ensemble du contenu de ce site (textes, images, logos, graphismes, vidéos, etc.) est protégé par le droit d'auteur et le droit des marques.",
      "Toute reproduction, représentation, modification, publication ou adaptation de tout ou partie des éléments du site, quel que soit le moyen ou le procédé utilisé, est interdite sans l'autorisation écrite préalable de Jommba.",
      "Le nom « Jommba », le logo et les éléments graphiques associés sont des marques déposées. Leur utilisation sans autorisation est strictement prohibée.",
    ],
  },
  {
    icon: FileText,
    title: "Protection des données",
    paragraphs: [
      "Conformément à la loi sur la protection des données personnelles, tu disposes d'un droit d'accès, de rectification, de suppression et de portabilité de tes données.",
      <>Pour plus de détails sur la collecte et le traitement de tes données personnelles, consulte notre <Link href="/confidentialite" className="text-primary font-semibold hover:underline">Politique de Confidentialité</Link>.</>,
    ],
  },
  {
    icon: Globe,
    title: "Conditions d'utilisation",
    paragraphs: [
      <>En utilisant Jommba, tu acceptes nos Conditions Générales de Vente et notre <Link href="/reglement" className="text-primary font-semibold hover:underline">Règlement</Link>.</>,
    ],
    bullets: [
      "Le site est réservé aux personnes de 18 ans et plus cherchant le mariage",
      "Chaque membre s'engage à respecter les valeurs islamiques",
      "Tout comportement irrespectueux ou frauduleux est passible de bannissement",
      "Les photos doivent être pudiques et te représenter fidèlement",
    ],
  },
  {
    icon: Scale,
    title: "Droit applicable et litiges",
    paragraphs: [
      "Les présentes mentions légales sont régies par le droit applicable au lieu du siège de l'éditeur.",
      "En cas de litige, et après tentative de résolution amiable, les tribunaux compétents seront seuls habilités à connaître du différend.",
      <>Pour toute réclamation, contacte-nous à : <a href={`mailto:${CONTACT_INFO.email}`} className="text-primary hover:underline">{CONTACT_INFO.email}</a></>,
    ],
  },
];

const SECTIONS_EN: LegalSection[] = [
  {
    icon: Building2,
    title: "Site publisher",
    paragraphs: [
      <div className="-mt-1">
        <InfoRow label="Site name" value="Jommba" />
        <InfoRow label="Status" value="Sole proprietorship" />
        <InfoRow label="Registered office" value={CONTACT_INFO.address} />
        <InfoRow label="Contact email" value={<a href={`mailto:${CONTACT_INFO.email}`} className="text-primary hover:underline">{CONTACT_INFO.email}</a>} />
        <InfoRow label="Publication director" value="The manager of Jommba" />
      </div>,
    ],
  },
  {
    icon: Server,
    title: "Hosting",
    paragraphs: [
      <div className="-mt-1">
        <InfoRow label="Host" value="Vercel Inc." />
        <InfoRow label="Address" value="340 S Lemon Ave #4133, Walnut, CA 91789, USA" />
        <InfoRow label="Website" value={<a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">https://vercel.com</a>} />
      </div>,
    ],
  },
  {
    icon: Shield,
    title: "Intellectual property",
    paragraphs: [
      "All content on this site (text, images, logos, graphics, videos, etc.) is protected by copyright and trademark law.",
      "Any reproduction, representation, modification, publication or adaptation of all or part of the site's elements, by any means or process, is prohibited without the prior written authorization of Jommba.",
      "The name “Jommba”, the logo and associated graphic elements are registered trademarks. Their use without authorization is strictly prohibited.",
    ],
  },
  {
    icon: FileText,
    title: "Data protection",
    paragraphs: [
      "In accordance with personal data protection law, you have the right to access, rectify, delete and port your data.",
      <>For more details on the collection and processing of your personal data, see our <Link href="/confidentialite" className="text-primary font-semibold hover:underline">Privacy Policy</Link>.</>,
    ],
  },
  {
    icon: Globe,
    title: "Terms of use",
    paragraphs: [
      <>By using Jommba, you accept our Terms of Sale and our <Link href="/reglement" className="text-primary font-semibold hover:underline">Rules</Link>.</>,
    ],
    bullets: [
      "The site is reserved for people aged 18 and over seeking marriage",
      "Each member undertakes to respect Islamic values",
      "Any disrespectful or fraudulent behavior is subject to a ban",
      "Photos must be modest and represent you faithfully",
    ],
  },
  {
    icon: Scale,
    title: "Applicable law and disputes",
    paragraphs: [
      "These legal notices are governed by the law applicable at the location of the publisher's registered office.",
      "In the event of a dispute, and after an attempt at amicable resolution, the competent courts shall have sole jurisdiction to hear the dispute.",
      <>For any complaint, contact us at: <a href={`mailto:${CONTACT_INFO.email}`} className="text-primary hover:underline">{CONTACT_INFO.email}</a></>,
    ],
  },
];

export default function MentionsLegalesPage() {
  const locale = useLocale();
  const isEn = locale === "en";

  return (
    <LegalPage
      hero={{
        icon: Scale,
        titleStart: isEn ? "Legal" : "Mentions",
        titleAccent: isEn ? "notice" : "légales",
        subtitle: isEn
          ? "Legal information about the Jommba site, in accordance with regulatory obligations."
          : "Informations légales concernant le site Jommba, conformément aux obligations réglementaires.",
      }}
      sections={isEn ? SECTIONS_EN : SECTIONS_FR}
      cta={{
        title: isEn ? "A legal question?" : "Une question juridique ?",
        text: isEn
          ? "For any question about these legal notices, feel free to contact us."
          : "Pour toute question concernant ces mentions légales, n'hésite pas à nous contacter.",
        buttonLabel: isEn ? "Contact" : "Contacter",
      }}
      updatedLabel={isEn ? "Last updated: July 2026" : "Dernière mise à jour : Juillet 2026"}
    />
  );
}
