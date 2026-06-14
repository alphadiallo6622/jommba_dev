"use client";

import { ArrowRight, Heart } from "lucide-react";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import AnimatedSection from "@/components/ui/AnimatedSection";

export default function CTASection() {
  return (
    <section className="py-16 sm:py-20 bg-jommba-bg overflow-hidden relative">
      <Container>
        <AnimatedSection>
          {/* Main Card with Gradient */}
          <div className="relative rounded-2xl sm:rounded-3xl bg-gradient-to-br from-primary to-primary-dark text-white px-6 py-10 sm:p-16 text-center shadow-xl overflow-hidden">
            {/* Absolute decorative backgrounds */}
            <div className="absolute top-0 right-0 w-[300px] h-[300px] rounded-full bg-white/5 blur-2xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[200px] h-[200px] rounded-full bg-white/5 blur-xl pointer-events-none" />

            {/* Glowing Heart Icon background */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
              <Heart className="w-[400px] h-[400px] fill-white" />
            </div>

            <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center space-y-6 sm:space-y-8">
              <h2 className="text-2xl sm:text-4xl lg:text-5xl font-serif font-bold leading-tight">
                Prêt à rencontrer votre destin ?
              </h2>
              <p className="text-sm sm:text-base text-white/90 leading-relaxed max-w-xl">
                Rejoignez gratuitement Jommba aujourd'hui. L'inscription prend moins de 3 minutes et vous met en relation directe avec des profils sérieux qui partagent votre vision de la famille.
              </p>
              
              <Button
                href="/inscription"
                variant="ghost"
                size="lg"
                className="bg-white text-primary hover:bg-jommba-bg hover:text-primary-dark hover:scale-102 hover:shadow-lg focus:ring-white/20 transition-all duration-200"
                icon={<ArrowRight className="w-4 h-4" />}
                iconPosition="right"
              >
                Commencer gratuitement
              </Button>

              <div className="text-xs text-white/70 font-semibold uppercase tracking-wider">
                Inscription gratuite &bull; Profils 100% vérifiés &bull; Respect de la vie privée
              </div>
            </div>
          </div>
        </AnimatedSection>
      </Container>
    </section>
  );
}

