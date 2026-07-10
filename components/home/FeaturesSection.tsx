"use client";

import { useTranslations } from "next-intl";
import { ShieldCheck, UserCheck, MessageSquare, Flame, Search, Bell, LucideIcon } from "lucide-react";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import Card from "@/components/ui/Card";
import AnimatedSection from "@/components/ui/AnimatedSection";
import { FEATURES, Feature } from "@/data/features";

const iconMap: Record<string, LucideIcon> = {
  ShieldCheck,
  UserCheck,
  MessageSquare,
  Search,
  Flame,
  Bell,
};

export default function FeaturesSection() {
  const t = useTranslations("home.features");

  return (
    <section id="features" className="py-20 bg-jommba-bg">
      <Container>
        {/* Section Header */}
        <AnimatedSection>
          <SectionHeading
            badge={t("badge")}
            title={t("title")}
            subtitle={t("subtitle")}
            className="mb-16"
          />
        </AnimatedSection>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {FEATURES.map((feature: Feature, index: number) => {
            const IconComponent = iconMap[feature.iconName] || ShieldCheck;
            return (
              <AnimatedSection
                key={feature.id}
                delay={index * 0.1}
                className="h-full"
              >
                <Card hover className="h-full flex flex-col items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary-light text-primary flex items-center justify-center shrink-0">
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-text-primary font-serif mb-2">
                      {t(`items.${feature.key}.title`)}
                    </h3>
                    <p className="text-sm text-text-muted leading-relaxed">
                      {t(`items.${feature.key}.description`)}
                    </p>
                  </div>
                </Card>
              </AnimatedSection>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
