"use client";

import Image from "next/image";
import { CheckCircle2, Shield, Heart } from "lucide-react";
import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";
import AnimatedSection from "@/components/ui/AnimatedSection";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-jommba-bg py-12 sm:py-20 lg:py-24 flex items-center min-h-[calc(100vh-76px)]">
      {/* Background glow effects */}
      <div className="absolute top-0 right-0 w-[40vw] h-[40vw] rounded-full bg-primary/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[30vw] h-[30vw] rounded-full bg-primary/3 blur-3xl pointer-events-none" />

      <Container className="relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-center">

          {/* Left Content */}
          <div className="lg:col-span-7 flex flex-col space-y-5 sm:space-y-7 text-left">
            <AnimatedSection delay={0.1}>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase bg-primary-light text-primary w-fit select-none">
                <Shield className="w-3.5 h-3.5" />
                Rencontre Halal & Sérieuse
              </span>
            </AnimatedSection>

            <AnimatedSection delay={0.2} className="space-y-4">
              <h1 className="text-[2rem] sm:text-5xl lg:text-6xl font-serif font-bold text-text-primary leading-[1.1] tracking-tight">
                Trouvez votre moitié dans le respect de vos{" "}
                <span className="block mt-2 font-display italic text-primary font-normal tracking-wide leading-none py-1">
                  valeurs islamiques
                </span>
              </h1>
              <p className="text-base sm:text-lg text-text-secondary leading-relaxed max-w-xl">
                Jommba est la plateforme de référence conçue pour les célibataires musulmans sérieux qui recherchent le mariage (Nikah) avec pudeur, sincérité et sécurité.
              </p>
            </AnimatedSection>

            <AnimatedSection delay={0.3} className="flex flex-col sm:flex-row gap-4">
              <Button href="/inscription" variant="primary" size="lg" className="w-full sm:w-auto shadow-green-btn">
                S'inscrire gratuitement
              </Button>
              <Button href="#how-it-works" variant="secondary" size="lg" className="w-full sm:w-auto">
                Découvrir le concept
              </Button>
            </AnimatedSection>

            {/* Quick Badges */}
            <AnimatedSection delay={0.4} className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-primary-light/30">
              <div className="flex items-center gap-2.5 text-sm font-semibold text-text-primary">
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                <span>100% de profils vérifiés manuellement</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm font-semibold text-text-primary">
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                <span>Option d'accompagnement Tuteur (Wali)</span>
              </div>
            </AnimatedSection>
          </div>

          {/* Right Visual Image */}
          <div className="lg:col-span-5 relative mt-4 lg:mt-0 flex justify-center">
            <AnimatedSection delay={0.3} className="relative w-full max-w-[340px] sm:max-w-[420px] lg:max-w-[450px]">
              {/* Outer decorative ring */}
              <div className="absolute inset-0 rounded-[2.5rem] border border-primary/10 rotate-3 scale-102 pointer-events-none" />

              {/* Glow backdrop behind image */}
              <div className="absolute inset-0 rounded-[2.5rem] bg-primary/10 blur-xl scale-95 -z-10" />

              {/* Main Image Container — padding top/bottom pour laisser place aux badges */}
              <div className="pt-8 pb-10 sm:pt-6 sm:pb-10">
                <div className="relative rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden aspect-[4/5] border border-white/20 shadow-2xl transition-transform duration-500 hover:scale-[1.01]">
                  <Image
                    src="/assets/images/hero-couple.png"
                    alt="Couple musulman élégant et souriant"
                    fill
                    priority
                    className="object-cover"
                    sizes="(max-width: 640px) 340px, (max-width: 1024px) 420px, 450px"
                  />
                </div>
              </div>

              {/* Success Badge */}
              <div className="absolute bottom-0 left-0 sm:-left-4 bg-white/95 backdrop-blur-md border border-primary-light/50 shadow-lg rounded-xl sm:rounded-2xl p-2.5 sm:p-4 flex items-center gap-2 sm:gap-3 animate-bounce-slow">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-primary-light flex items-center justify-center text-primary shrink-0">
                  <Heart className="w-4 h-4 sm:w-5 sm:h-5 fill-primary" />
                </div>
                <div>
                  <div className="text-[10px] sm:text-xs text-text-muted font-medium">Mariages célébrés</div>
                  <div className="text-sm sm:text-lg font-bold text-text-primary font-serif">1 240+ Couples</div>
                </div>
              </div>

              {/* Security Shield Badge */}
              <div className="absolute top-0 right-0 sm:-right-4 bg-jommba-dark/95 backdrop-blur-md border border-white/10 shadow-xl rounded-xl sm:rounded-2xl p-2.5 sm:p-4 flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-primary flex items-center justify-center text-white shrink-0 shadow-green-btn">
                  <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <div className="text-[10px] sm:text-xs text-white/70 font-medium">Sécurité & Pudeur</div>
                  <div className="text-xs sm:text-sm font-bold text-white">Photos Floutables</div>
                </div>
              </div>
            </AnimatedSection>
          </div>

        </div>
      </Container>

      {/* Animation custom CSS styling */}
      <style jsx global>{`
        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-8px);
          }
        }
        .animate-bounce-slow {
          animation: bounce-slow 4s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
}

