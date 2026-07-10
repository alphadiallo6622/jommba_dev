"use client";

import { useTranslations } from "next-intl";
import { Heart, Quote } from "lucide-react";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import Card from "@/components/ui/Card";
import AnimatedSection from "@/components/ui/AnimatedSection";
import { TESTIMONIALS, Testimonial } from "@/data/testimonials";

export default function TestimonialsSection() {
  const t = useTranslations("home.testimonials");

  return (
    <section id="testimonials" className="py-16 sm:py-20 bg-jommba-bg">
      <Container>
        {/* Section Header */}
        <AnimatedSection>
          <SectionHeading
            badge={t("badge")}
            title={t("title")}
            subtitle={t("subtitle")}
            className="mb-10 sm:mb-16"
          />
        </AnimatedSection>

        {/* Mobile: scroll horizontal / Desktop: grille */}
        <div className="flex md:grid md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-8 overflow-x-auto md:overflow-visible pb-4 md:pb-0 -mx-4 px-4 md:mx-0 md:px-0 snap-x snap-mandatory md:snap-none scroll-smooth">
          {TESTIMONIALS.map((testimonial: Testimonial, index: number) => (
            <AnimatedSection
              key={testimonial.id}
              delay={index * 0.15}
              className="h-full shrink-0 w-[80vw] sm:w-[60vw] md:w-auto snap-start"
            >
              <Card hover className="h-full flex flex-col justify-between relative pt-10">
                {/* Decorative Quote Icon */}
                <div className="absolute top-6 left-6 text-primary-light/50">
                  <Quote className="w-10 h-10 fill-primary-light" />
                </div>
                
                {/* Testimonial Text */}
                <div className="relative z-10 text-sm text-text-secondary leading-relaxed italic mb-6">
                  "{testimonial.text}"
                </div>

                {/* Footer of Card */}
                <div className="border-t border-primary-light/30 pt-4 flex items-center justify-between gap-4 mt-auto">
                  <div>
                    <h4 className="text-base font-bold text-text-primary font-serif">
                      {testimonial.name}
                    </h4>
                    <p className="text-xs text-text-muted">
                      {testimonial.location}
                    </p>
                  </div>

                  {/* Couple Badge */}
                  {testimonial.marriageDate && (
                    <div className="flex flex-col items-end text-right">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-primary-light text-primary uppercase select-none">
                        <Heart className="w-3 h-3 fill-primary" />
                        {t("marriedBadge")}
                      </span>
                      <span className="text-[10px] text-text-subtle mt-0.5 font-medium">
                        {testimonial.marriageDate}
                      </span>
                    </div>
                  )}
                </div>
              </Card>
            </AnimatedSection>
          ))}
        </div>
      </Container>
    </section>
  );
}

