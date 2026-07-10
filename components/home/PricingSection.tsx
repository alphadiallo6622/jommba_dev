"use client";

import { useTranslations } from "next-intl";
import { Check, X } from "lucide-react";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import Button from "@/components/ui/Button";
import AnimatedSection from "@/components/ui/AnimatedSection";
import { PRICING_PLANS, PricingPlan } from "@/data/pricing";

export default function PricingSection() {
  const t = useTranslations("home.pricing");

  return (
    <section id="pricing" className="py-20 bg-jommba-bg/50 border-t border-primary-light/10">
      <Container>
        <AnimatedSection>
          <SectionHeading
            badge={t("badge")}
            title={t("title")}
            subtitle={t("subtitle")}
            className="mb-16"
          />
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto items-start">
          {PRICING_PLANS.map((plan: PricingPlan, index: number) => (
            <AnimatedSection key={plan.planKey} delay={index * 0.15} className="h-full flex">
              <div
                className={`h-full flex flex-col w-full rounded-2xl border bg-white relative overflow-hidden ${
                  plan.popular
                    ? "border-primary/40 ring-2 ring-primary/20 shadow-elevation"
                    : "border-gray-200 shadow-sm"
                }`}
              >
                {/* Launch badge */}
                {plan.hasBadge && (
                  <div className="flex justify-center pt-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                      {t(`${plan.planKey}.badge`)}
                    </span>
                  </div>
                )}

                <div className="p-6 flex flex-col flex-1">
                  {/* Header */}
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-text-primary font-serif mb-1">
                      {t(`${plan.planKey}.name`)}
                    </h3>
                    <p className="text-sm text-text-muted">{t(`${plan.planKey}.description`)}</p>
                  </div>

                  {/* Price */}
                  <div className="mb-1">
                    {plan.originalPrice && (
                      <span className="text-sm text-text-subtle line-through mr-2">
                        {plan.originalPrice} $
                      </span>
                    )}
                    <span className="text-4xl font-extrabold text-primary font-serif">
                      {plan.price}
                    </span>
                    <span className="text-lg font-bold text-text-primary ml-1">$</span>
                  </div>
                  <p className="text-xs text-text-muted mb-6">{t(`${plan.planKey}.period`)}</p>

                  {/* Divider */}
                  <div className="w-full h-px bg-gray-100 mb-5" />

                  {/* Features */}
                  <ul className="space-y-3 mb-8 flex-1">
                    {plan.features.map((feature) => (
                      <li key={feature.key} className="flex items-start gap-2.5">
                        {feature.included ? (
                          <div className="w-4 h-4 rounded-full bg-primary-light flex items-center justify-center text-primary shrink-0 mt-0.5">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </div>
                        ) : (
                          <div className="w-4 h-4 rounded-full bg-red-50 flex items-center justify-center text-red-400 shrink-0 mt-0.5">
                            <X className="w-2.5 h-2.5 stroke-[3]" />
                          </div>
                        )}
                        <span
                          className={`text-sm leading-snug ${
                            feature.included
                              ? "text-text-secondary"
                              : "text-text-subtle/60 line-through"
                          }`}
                        >
                          {t(`${plan.planKey}.features.${feature.key}`)}
                          {feature.tagged && (
                            <span className="ml-1.5 inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-primary text-white uppercase tracking-wide">
                              {t(`${plan.planKey}.newTag`)}
                            </span>
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <div className="mt-auto space-y-3">
                    <Button href="/inscription" variant={plan.variant} className="w-full">
                      {t(`${plan.planKey}.buttonText`)} →
                    </Button>
                    {plan.hasNote && (
                      <p className="text-[11px] text-text-subtle text-center leading-relaxed">
                        {t(`${plan.planKey}.note`)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </Container>
    </section>
  );
}
