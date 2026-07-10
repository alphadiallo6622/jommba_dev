"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { CheckCircle2, Shield, Heart, Sparkles } from "lucide-react";
import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";
import AnimatedSection from "@/components/ui/AnimatedSection";

export default function HeroSection() {
  const t = useTranslations("home.hero");

  return (
    <section className="relative overflow-hidden bg-jommba-bg py-8 sm:py-12 lg:py-14 flex items-center">
      {/* Background: soft radial glows + subtle dot grid */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-24 -right-24 w-[45vw] h-[45vw] rounded-full bg-primary/8 blur-3xl" />
        <div className="absolute -bottom-32 -left-24 w-[35vw] h-[35vw] rounded-full bg-primary/5 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              "radial-gradient(rgba(0,166,118,0.12) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
            maskImage:
              "radial-gradient(ellipse 80% 60% at 50% 40%, black, transparent)",
            WebkitMaskImage:
              "radial-gradient(ellipse 80% 60% at 50% 40%, black, transparent)",
          }}
        />
      </div>

      <Container className="relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">

          {/* Left Content */}
          <div className="lg:col-span-7 flex flex-col space-y-5 sm:space-y-7 text-center lg:text-left items-center lg:items-start">
            <AnimatedSection delay={0.1}>
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide uppercase bg-white text-primary border border-primary/15 shadow-sm w-fit select-none">
                <Shield className="w-3.5 h-3.5" />
                {t("badge")}
                <Sparkles className="w-3 h-3 text-primary/60" />
              </span>
            </AnimatedSection>

            <AnimatedSection delay={0.2} className="space-y-4 sm:space-y-5">
              <h1 className="text-[2.1rem] sm:text-5xl lg:text-6xl xl:text-[4.2rem] font-serif font-bold text-text-primary leading-[1.08] tracking-tight">
                {t("titleLine1")}{" "}
                <span className="relative block mt-1.5 sm:mt-2 font-display italic text-primary font-normal tracking-wide leading-none py-1.5">
                  {t("titleLine2")}
                  <svg
                    className="absolute -bottom-1 left-1/2 lg:left-0 -translate-x-1/2 lg:translate-x-0 w-40 sm:w-56 h-3 text-primary/30"
                    viewBox="0 0 200 12"
                    fill="none"
                    preserveAspectRatio="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M2 9C50 3 150 3 198 9"
                      stroke="currentColor"
                      strokeWidth="4"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
              </h1>
              <p className="text-base sm:text-lg text-text-secondary leading-relaxed max-w-xl mx-auto lg:mx-0">
                {t("subtitle")}
              </p>
            </AnimatedSection>

            <AnimatedSection delay={0.3} className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto pt-1">
              <Button href="/inscription" variant="primary" size="lg" className="w-full sm:w-auto shadow-green-btn hover:-translate-y-0.5 transition-transform">
                {t("ctaSignup")}
              </Button>
              <Button href="#how-it-works" variant="secondary" size="lg" className="w-full sm:w-auto">
                {t("ctaDiscover")}
              </Button>
            </AnimatedSection>

            {/* Quick Badges */}
            <AnimatedSection delay={0.4} className="flex flex-col sm:flex-row items-center gap-3 sm:gap-8 pt-5 border-t border-primary/10 w-full justify-center lg:justify-start">
              <div className="flex items-center gap-2.5 text-sm font-semibold text-text-primary">
                <span className="w-7 h-7 rounded-full bg-primary-light flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                </span>
                <span>{t("badge1")}</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm font-semibold text-text-primary">
                <span className="w-7 h-7 rounded-full bg-primary-light flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                </span>
                <span>{t("badge2")}</span>
              </div>
            </AnimatedSection>
          </div>

          {/* Right Visual Image */}
          <div className="lg:col-span-5 relative flex justify-center">
            <AnimatedSection delay={0.3} className="relative w-full max-w-[320px] sm:max-w-[400px] lg:max-w-[440px]">
              {/* Decorative rotated frame behind */}
              <div className="absolute inset-x-0 top-8 bottom-10 rounded-t-[10rem] rounded-b-[2rem] border-2 border-primary/15 rotate-[4deg] pointer-events-none" />
              {/* Soft glow */}
              <div className="absolute inset-x-4 top-12 bottom-12 rounded-t-[10rem] rounded-b-[2rem] bg-primary/15 blur-2xl -z-10" />

              {/* Main image — arch shape */}
              <div className="pt-8 pb-10">
                <div className="relative rounded-t-[9rem] sm:rounded-t-[11rem] rounded-b-[1.75rem] sm:rounded-b-[2rem] overflow-hidden aspect-[4/5] ring-4 ring-white shadow-2xl">
                  <Image
                    src="/assets/images/hero-couple-new.jpg"
                    alt={t("imageAlt")}
                    fill
                    priority
                    className="object-cover object-top transition-transform duration-700 hover:scale-[1.03]"
                    sizes="(max-width: 640px) 320px, (max-width: 1024px) 400px, 440px"
                  />
                  {/* Subtle bottom gradient for badge legibility */}
                  <div className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-black/25 to-transparent pointer-events-none" />
                </div>
              </div>

              {/* Success Badge */}
              <div className="absolute bottom-2 -left-1 sm:-left-6 bg-white/95 backdrop-blur-md border border-primary-light shadow-lg rounded-2xl p-2.5 sm:p-4 flex items-center gap-2 sm:gap-3 animate-bounce-slow">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-primary-light flex items-center justify-center text-primary shrink-0">
                  <Heart className="w-4 h-4 sm:w-5 sm:h-5 fill-primary" />
                </div>
                <div>
                  <div className="text-[10px] sm:text-xs text-text-muted font-medium">{t("marriagesLabel")}</div>
                  <div className="text-sm sm:text-lg font-bold text-text-primary font-serif leading-tight">{t("marriagesValue")}</div>
                </div>
              </div>

              {/* Security Shield Badge */}
              <div className="absolute top-14 -right-1 sm:-right-6 bg-jommba-dark/95 backdrop-blur-md border border-white/10 shadow-xl rounded-2xl p-2.5 sm:p-4 flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-primary flex items-center justify-center text-white shrink-0 shadow-green-btn">
                  <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <div className="text-[10px] sm:text-xs text-white/70 font-medium">{t("securityLabel")}</div>
                  <div className="text-xs sm:text-sm font-bold text-white">{t("securityValue")}</div>
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
