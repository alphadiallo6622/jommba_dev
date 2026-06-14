"use client";

import { UserPlus, Search, Milestone } from "lucide-react";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import AnimatedSection from "@/components/ui/AnimatedSection";

const STEPS = [
  {
    number: "01",
    title: "Créez votre profil",
    description: "Remplissez notre questionnaire détaillé sur votre pratique, vos valeurs, vos critères de recherche et votre vision du couple.",
    icon: <UserPlus className="w-6 h-6" />,
  },
  {
    number: "02",
    title: "Trouvez des profils compatibles",
    description: "Parcourez les profils qui correspondent à vos aspirations. Filtrez selon la localisation, la pratique religieuse, l'âge, etc.",
    icon: <Search className="w-6 h-6" />,
  },
  {
    number: "03",
    title: "Échangez & Concrétisez",
    description: "Engagez la discussion dans notre messagerie privée et sécurisée. Invitez votre Wali à participer aux échanges si vous le souhaitez.",
    icon: <Milestone className="w-6 h-6" />,
  },
];

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-20 bg-jommba-bg/50 border-t border-primary-light/10 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-primary-light/40 -translate-y-1/2 hidden lg:block max-w-6xl mx-auto z-0" />
      
      <Container className="relative z-10">
        {/* Section Header */}
        <AnimatedSection>
          <SectionHeading
            badge="Étape par Étape"
            title="Comment fonctionne Jommba ?"
            subtitle="Nous vous accompagnons pas à pas vers la rencontre de votre futur époux ou épouse dans les meilleures conditions."
            className="mb-16"
          />
        </AnimatedSection>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 lg:gap-8">
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
                  {step.title}
                </h3>
                <p className="text-sm text-text-muted leading-relaxed max-w-sm px-4 lg:px-0">
                  {step.description}
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

