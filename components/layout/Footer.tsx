import { useTranslations } from "next-intl";
import { Heart, Mail, MapPin } from "lucide-react";
import { Link } from "@/i18n/navigation";

const IconFacebook = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);
const IconInstagram = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);
const IconTwitter = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);
const IconYoutube = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" /><polygon fill="white" points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" />
  </svg>
);
const IconTiktok = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.68v13.67a2.4 2.4 0 0 1-2.4 2.4 2.4 2.4 0 0 1-2.4-2.4 2.4 2.4 0 0 1 2.4-2.4c.34 0 .67.03 1 .1V9.41a5.8 5.8 0 0 0-1-.08A5.8 5.8 0 0 0 5 15a5.8 5.8 0 0 0 5.8 5.8 5.8 5.8 0 0 0 5.81-5.87c0-.01 0-.015.015-.025V8.93a7.6 7.6 0 0 0 4.58 1.51v-3.6a4.8 4.8 0 0 1-1.001-.066z" />
  </svg>
);
import { SOCIAL_LINKS, NAV_LINKS, CONTACT_INFO } from "@/lib/constants";

export default function Footer() {
  const t = useTranslations("footer");
  const tNav = useTranslations("nav");

  return (
    <footer className="bg-jommba-dark text-white border-t border-white/5 relative overflow-hidden">
      {/* Decorative accent gradient */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/50 via-primary to-primary-dark/50" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 lg:gap-12">
          {/* Brand Info */}
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-2 group w-fit">
              <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center shadow-green-btn">
                <Heart className="w-5 h-5 text-white fill-white" />
              </div>
              <span className="text-xl font-serif font-bold text-white tracking-tight">
                Jommba
              </span>
            </Link>
            <p className="text-sm text-text-subtle leading-relaxed">
              {t("description")}
            </p>
            {/* Social Icons */}
            <div className="flex items-center gap-4">
              <a
                href={SOCIAL_LINKS.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-text-subtle hover:bg-primary hover:text-white transition-all duration-200"
                aria-label="Facebook"
              >
                <IconFacebook />
              </a>
              <a
                href={SOCIAL_LINKS.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-text-subtle hover:bg-primary hover:text-white transition-all duration-200"
                aria-label="Instagram"
              >
                <IconInstagram />
              </a>
              <a
                href={SOCIAL_LINKS.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-text-subtle hover:bg-primary hover:text-white transition-all duration-200"
                aria-label="Twitter"
              >
                <IconTwitter />
              </a>
              <a
                href={SOCIAL_LINKS.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-text-subtle hover:bg-primary hover:text-white transition-all duration-200"
                aria-label="Youtube"
              >
                <IconYoutube />
              </a>
              <a
                href={SOCIAL_LINKS.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-text-subtle hover:bg-primary hover:text-white transition-all duration-200"
                aria-label="TikTok"
              >
                <IconTiktok />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h3 className="text-base font-semibold text-white tracking-wider uppercase">
              {t("navigationTitle")}
            </h3>
            <ul className="space-y-3">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-text-subtle hover:text-primary transition-colors duration-200 flex items-center gap-2"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                    {tNav(link.labelKey)}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/connexion"
                  className="text-sm text-text-subtle hover:text-primary transition-colors duration-200 flex items-center gap-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                  {tNav("login")}
                </Link>
              </li>
              <li>
                <Link
                  href="/inscription"
                  className="text-sm text-text-subtle hover:text-primary transition-colors duration-200 flex items-center gap-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                  {tNav("signup")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal / Contact */}
          <div className="space-y-6">
            <h3 className="text-base font-semibold text-white tracking-wider uppercase">
              {t("helpTitle")}
            </h3>
            <ul className="space-y-3 text-sm text-text-subtle">
              <li>
                <Link href="/faq" className="hover:text-primary transition-colors duration-200">
                  {t("helpCenter")}
                </Link>
              </li>
              <li>
                <Link href="/reglement" className="hover:text-primary transition-colors duration-200">
                  {t("reglement")}
                </Link>
              </li>
              <li>
                <Link href="/cgv" className="hover:text-primary transition-colors duration-200">
                  {t("terms")}
                </Link>
              </li>
              <li>
                <Link href="/confidentialite" className="hover:text-primary transition-colors duration-200">
                  {t("privacy")}
                </Link>
              </li>
              <li>
                <Link href="/mentions-legales" className="hover:text-primary transition-colors duration-200">
                  {t("legal")}
                </Link>
              </li>
              <li>
                <Link href="/dpa" className="hover:text-primary transition-colors duration-200">
                  {t("dpa")}
                </Link>
              </li>
              <li className="flex items-center gap-2 pt-2 text-white font-medium">
                <Mail className="w-4 h-4 text-primary" />
                <a href={`mailto:${CONTACT_INFO.email}`} className="hover:text-primary transition-colors duration-200">
                  {CONTACT_INFO.email}
                </a>
              </li>
              <li className="flex items-center gap-2 text-text-subtle">
                <MapPin className="w-4 h-4 text-primary" />
                <span>{CONTACT_INFO.address}</span>
              </li>
            </ul>
          </div>

          {/* Quran Quote Card & CTA */}
          <div className="space-y-6 lg:col-span-1">
            <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 relative overflow-hidden">
              {/* Decorative arabesque border hint */}
              <div className="absolute inset-0 border border-primary/10 rounded-2xl pointer-events-none m-1" />

              <div className="text-xs text-text-subtle leading-relaxed italic text-center relative z-10">
                {t("quote")}
              </div>
              <div className="text-right text-[10px] text-primary font-semibold mt-3 relative z-10">
                {t("quoteSource")}
              </div>
            </div>

            {/* RGPD Badge */}
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 text-center">
              <div className="text-xs font-semibold text-primary mb-2">RGPD</div>
              <div className="text-[10px] text-text-subtle leading-relaxed">
                100% Conforme
              </div>
            </div>

            {/* Join CTA Button */}
            <Link href="/inscription" className="inline-flex items-center justify-center w-full px-4 py-3 rounded-lg bg-primary hover:bg-primary-dark text-white font-semibold text-sm transition-colors duration-200">
              Rejoindre Jommba
            </Link>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-text-subtle text-center sm:text-left">
            {t("copyright", { year: new Date().getFullYear() })}
          </p>
          <div className="text-xs text-text-subtle flex gap-4">
            <span className="flex items-center gap-1">
              {t("madeWithPrefix")}
              <Heart className="w-3.5 h-3.5 text-primary fill-primary inline" />
              {t("madeWithSuffix")}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
