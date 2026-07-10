"use client";

import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { Mail, type LucideIcon } from "lucide-react";
import Container from "@/components/ui/Container";
import AnimatedSection from "@/components/ui/AnimatedSection";

export interface LegalSection {
  /** Numéro affiché (ex. "01", "Article 01"). Optionnel. */
  number?: string;
  icon: LucideIcon;
  title: string;
  /** Intro courte affichée sous le titre. */
  intro?: string;
  /** Liste à puces (coche verte). */
  bullets?: React.ReactNode[];
  /** Paragraphes libres. */
  paragraphs?: React.ReactNode[];
}

interface LegalPageProps {
  hero: {
    icon: LucideIcon;
    /** Titre : la 2e partie est colorée en primary (comme les maquettes). */
    titleStart: string;
    titleAccent: string;
    subtitle: string;
    /** Bandeau d'engagement optionnel (ex. RGPD). */
    banner?: { title: string; text: string };
  };
  sections: LegalSection[];
  /** Bloc CTA vert en bas de page. */
  cta?: { title: string; text: string; buttonLabel: string };
  updatedLabel: string;
}

function CheckDot() {
  return (
    <span className="mt-1 w-5 h-5 rounded-full bg-primary-light flex items-center justify-center shrink-0">
      <svg viewBox="0 0 24 24" className="w-3 h-3 text-primary" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    </span>
  );
}

export default function LegalPage({ hero, sections, cta, updatedLabel }: LegalPageProps) {
  const tContact = useTranslations("contact");
  const HeroIcon = hero.icon;

  return (
    <>
      {/* Hero */}
      <section className="relative bg-gradient-to-b from-primary-light/60 to-jommba-bg pt-14 pb-10 sm:pt-20 sm:pb-14 overflow-hidden">
        <div className="absolute -top-20 right-1/4 w-[30vw] h-[30vw] rounded-full bg-primary/10 blur-3xl pointer-events-none" />
        <Container size="md" className="relative z-10">
          <AnimatedSection className="flex flex-col items-center text-center space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-primary text-white flex items-center justify-center shadow-green-btn">
              <HeroIcon className="w-8 h-8" />
            </div>
            <h1 className="text-3xl sm:text-5xl font-serif font-bold text-text-primary tracking-tight">
              {hero.titleStart} <span className="text-primary">{hero.titleAccent}</span>
            </h1>
            <p className="text-sm sm:text-base text-text-muted max-w-2xl leading-relaxed">
              {hero.subtitle}
            </p>
          </AnimatedSection>
        </Container>
      </section>

      {/* Corps */}
      <section className="py-10 sm:py-14 bg-jommba-bg">
        <Container size="md">
          <div className="max-w-3xl mx-auto space-y-5">
            {/* Bandeau d'engagement optionnel */}
            {hero.banner && (
              <AnimatedSection>
                <div className="rounded-2xl bg-primary-light/50 border border-primary/20 p-5">
                  <h3 className="text-sm font-bold text-primary mb-1.5">{hero.banner.title}</h3>
                  <p className="text-sm text-text-secondary leading-relaxed">{hero.banner.text}</p>
                </div>
              </AnimatedSection>
            )}

            {sections.map((section, i) => {
              const Icon = section.icon;
              return (
                <AnimatedSection key={i} delay={i * 0.05}>
                  <div className="rounded-2xl bg-white border border-primary-light/40 shadow-sm p-6 sm:p-8">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-11 h-11 rounded-xl bg-primary-light text-primary flex items-center justify-center shrink-0">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        {section.number && (
                          <div className="text-xs font-bold text-primary/70 tracking-wider">{section.number}</div>
                        )}
                        <h2 className="text-lg sm:text-xl font-serif font-bold text-text-primary">{section.title}</h2>
                      </div>
                    </div>

                    {section.intro && (
                      <p className="text-sm text-text-muted leading-relaxed mb-4">{section.intro}</p>
                    )}

                    {section.paragraphs && (
                      <div className="space-y-3">
                        {section.paragraphs.map((p, pi) => (
                          <p key={pi} className="text-sm text-text-secondary leading-relaxed">{p}</p>
                        ))}
                      </div>
                    )}

                    {section.bullets && (
                      <ul className="space-y-3 mt-1">
                        {section.bullets.map((b, bi) => (
                          <li key={bi} className="flex items-start gap-3 text-sm text-text-secondary leading-relaxed">
                            <CheckDot />
                            <span>{b}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </AnimatedSection>
              );
            })}

            {/* CTA vert */}
            {cta && (
              <AnimatedSection delay={0.1}>
                <div className="rounded-3xl bg-gradient-to-br from-primary to-primary-dark text-white p-8 sm:p-10 text-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-white/5 blur-2xl pointer-events-none" />
                  <h3 className="text-xl sm:text-2xl font-serif font-bold mb-3 relative z-10">{cta.title}</h3>
                  <p className="text-sm text-white/90 max-w-md mx-auto mb-6 relative z-10">{cta.text}</p>
                  <Link
                    href="/contact"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white text-primary font-bold text-sm shadow-lg hover:bg-jommba-bg transition-all duration-200 relative z-10"
                  >
                    <Mail className="w-4 h-4" />
                    {cta.buttonLabel}
                  </Link>
                </div>
              </AnimatedSection>
            )}

            <p className="text-center text-xs text-text-subtle pt-2">
              {updatedLabel}
            </p>

            {/* Contact rapide sous la mise à jour, discret */}
            <p className="sr-only">{tContact("title")}</p>
          </div>
        </Container>
      </section>
    </>
  );
}
