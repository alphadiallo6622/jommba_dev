"use client";

import { useTranslations } from "next-intl";
import { Heart, Quote } from "lucide-react";
import Container from "@/components/ui/Container";
import AnimatedSection from "@/components/ui/AnimatedSection";

export default function IslamicQuoteSection() {
  const t = useTranslations("home.quote");

  return (
    <section className="py-12 sm:py-14 bg-jommba-bg overflow-hidden relative">
      {/* Subtle background decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary/3 blur-3xl pointer-events-none -z-10" />

      <Container size="sm">
        <AnimatedSection className="relative">
          {/* Main Card Frame */}
          <div className="rounded-3xl border-2 border-primary/20 bg-primary-light/20 p-8 sm:p-12 text-center relative shadow-sm overflow-hidden">
            {/* Inner Decorative Arabesque Border */}
            <div className="absolute inset-2 border border-primary/10 rounded-2xl pointer-events-none" />

            {/* Top Quote Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center shadow-green-btn relative z-10">
                <Quote className="w-6 h-6 fill-white" />
              </div>
            </div>

            {/* Arabic Verse — invariant, même texte quelle que soit la langue */}
            <div className="text-xl sm:text-2xl lg:text-3xl text-primary font-arabic leading-loose mb-6 tracking-wide dir-rtl select-none relative z-10 px-4">
              {t("arabic")}
            </div>

            {/* Translation */}
            <p className="text-sm sm:text-base text-text-secondary leading-relaxed font-serif font-medium max-w-xl mx-auto mb-4 relative z-10 px-2">
              {t("translation")}
            </p>

            {/* Source Reference */}
            <div className="flex items-center justify-center gap-2 text-xs font-bold text-primary relative z-10 uppercase tracking-wider">
              <Heart className="w-3.5 h-3.5 fill-primary" />
              <span>{t("source")}</span>
            </div>
          </div>
        </AnimatedSection>
      </Container>
    </section>
  );
}
