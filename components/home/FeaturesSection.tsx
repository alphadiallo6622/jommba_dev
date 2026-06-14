"use client";

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
  return (
    <section id="features" className="py-20 bg-jommba-bg">
      <Container>
        {/* Section Header */}
        <AnimatedSection>
          <SectionHeading
            badge="Pourquoi Nous Choisir"
            title="Une plateforme respectueuse de vos convictions"
            subtitle="Nous mettons tout en œuvre pour vous offrir un espace d'échange sécurisé, conforme aux valeurs de l'Islam, pour aborder le mariage en toute sérénité."
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
                      {feature.title}
                    </h3>
                    <p className="text-sm text-text-muted leading-relaxed">
                      {feature.description}
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

