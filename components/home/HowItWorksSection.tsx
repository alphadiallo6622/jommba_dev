"use client";

import { useTranslations } from "next-intl";
import { UserPlus, Search, Milestone } from "lucide-react";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import AnimatedSection from "@/components/ui/AnimatedSection";

const STEPS = [
  { number: "01", key: "1" as const, icon: <UserPlus className="w-6 h-6" /> },
  { number: "02", key: "2" as const, icon: <Search className="w-6 h-6" /> },
  { number: "03", key: "3" as const, icon: <Milestone className="w-6 h-6" /> },
];

export default function HowItWorksSection() {
  const t = useTranslations("home.howItWorks");

  return (
    <section id="how-it-works" className="py-12 sm:py-16 scroll-mt-[76px] bg-jommba-bg/50 border-t border-primary-light/10 relative overflow-hidden">
      <Container className="relative z-10">
        {/* Section Header */}
        <AnimatedSection>
          <SectionHeading
            badge={t("badge")}
            title={t("title")}
            subtitle={t("subtitle")}
            className="mb-10 sm:mb-12"
          />
        </AnimatedSection>

        {/* Steps Grid */}
        <div className="relative grid grid-cols-1 lg:grid-cols-3 gap-0 lg:gap-8">
          {/* Connecteur horizontal desktop, aligné sur le centre des cercles */}
          <div className="hidden lg:block absolute top-10 left-[16%] right-[16%] border-t-2 border-dashed border-primary/20 z-0" />
          {STEPS.map((step, index) => (
            <AnimatedSection
              key={step.number}
              delay={index * 0.15}
              className="flex flex-col items-center text-center relative"
            >
              {/* Connecteur vertical mobile entre étapes */}
              {index > 0 && (
                <div className="lg:hidden w-0.5 h-10 bg-primary/20 mb-0 -mt-0" />
              )}

              <div className={index > 0 ? "mt-6 lg:mt-0 flex flex-col items-center" : "flex flex-col items-center"}>
                {/* Outer Ring with Step Icon */}
                <div className="w-20 h-20 rounded-full bg-white border-2 border-primary/20 flex items-center justify-center shadow-md relative z-10 hover:border-primary transition-colors duration-300">
                  <div className="w-14 h-14 rounded-full bg-primary text-white flex items-center justify-center shadow-green-btn">
                    {step.icon}
                  </div>
                  {/* Step Number Badge */}
                  <div className="absolute -top-1.5 -right-1.5 bg-jommba-dark text-white text-xs font-bold w-7 h-7 rounded-full flex items-center justify-center border-2 border-white">
                    {step.number}
                  </div>
                </div>

                {/* Title & Description */}
                <h3 className="text-xl font-bold text-text-primary font-serif mt-5 mb-3">
                  {t(`steps.${step.key}.title`)}
                </h3>
                <p className="text-sm text-text-muted leading-relaxed max-w-sm px-4 lg:px-0">
                  {t(`steps.${step.key}.description`)}
                </p>
              </div>

              {/* Connecteur vertical mobile après l'étape (sauf dernière) */}
              {index < STEPS.length - 1 && (
                <div className="lg:hidden w-0.5 h-10 bg-primary/20 mt-6" />
              )}
            </AnimatedSection>
          ))}
        </div>
      </Container>
    </section>
  );
}
