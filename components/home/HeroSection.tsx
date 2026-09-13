"use client";

import { useTranslations } from "next-intl";
import { CheckCircle2, Shield, Heart, Sparkles } from "lucide-react";
import HeroVideo from "./HeroVideo";
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
        {/* ── Mobile layout : titre centré, CTA pleine largeur, vidéo en bandeau ── */}
        <div className="flex flex-col items-center text-center space-y-5 lg:hidden">
          <AnimatedSection delay={0.1}>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide uppercase bg-white text-[#d4af37] border border-[#d4af37]/15 shadow-sm w-fit select-none">
              <Shield className="w-3.5 h-3.5" style={{ color: "#d4af37" }} />
              {t("badge")}
              <Sparkles className="w-3 h-3" style={{ color: "#d4af37" }} />
            </span>
          </AnimatedSection>

          <AnimatedSection delay={0.2} className="space-y-3">
            <h1 className="text-[2rem] font-serif font-bold text-text-primary leading-[1.1] tracking-tight">
              {t("titleLine1")}{" "}
              <span className="block mt-1 font-display italic text-[#d4af37] font-normal tracking-wide leading-tight">
                {t("titleLine2")}
              </span>
            </h1>
          </AnimatedSection>

          <AnimatedSection delay={0.3} className="w-full pt-1">
            <Button href="/inscription" variant="primary" size="lg" className="w-full shadow-green-btn">
              {t("ctaSignup")}
            </Button>
          </AnimatedSection>

          <AnimatedSection delay={0.35} className="relative w-full pt-2 space-y-3">
            <div className="relative overflow-hidden rounded-[1.5rem] shadow-xl">
              <HeroVideo title={t("videoTitle")} playLabel={t("videoPlay")} />
            </div>
            <div className="flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-white border border-primary-light shadow-sm w-fit mx-auto">
              <Heart className="w-4 h-4 text-primary fill-primary shrink-0" />
              <span className="text-sm font-semibold text-text-primary">
                {t("marriagesValue")} · {t("marriagesLabel")}
              </span>
            </div>
          </AnimatedSection>

          <AnimatedSection delay={0.4} className="flex items-center justify-center gap-6 pt-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-text-primary">
              <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
              <span>{t("badge1")}</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-text-primary">
              <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
              <span>{t("badge2")}</span>
            </div>
          </AnimatedSection>
        </div>

        {/* ── Desktop layout : deux colonnes, cadre en arche ── */}
        <div className="hidden lg:grid lg:grid-cols-12 gap-10 lg:gap-12 items-center">

          {/* Left Content */}
          <div className="lg:col-span-7 flex flex-col space-y-7 text-left items-start">
            <AnimatedSection delay={0.1}>
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide uppercase bg-white text-[#d4af37] border border-[#d4af37]/15 shadow-sm w-fit select-none">
                <Shield className="w-3.5 h-3.5" style={{ color: "#d4af37" }} />
                {t("badge")}
                <Sparkles className="w-3 h-3" style={{ color: "#d4af37" }} />
              </span>
            </AnimatedSection>

            <AnimatedSection delay={0.2} className="space-y-5">
              <h1 className="text-6xl xl:text-[4.2rem] font-serif font-bold text-text-primary leading-[1.08] tracking-tight">
                {t("titleLine1")}{" "}
                <span className="relative block mt-2 font-display italic text-[#d4af37] font-normal tracking-wide leading-none py-1.5">
                  {t("titleLine2")}
                  <svg
                    className="absolute -bottom-1 left-0 w-56 h-3 text-[#d4af37]/30"
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
              <p className="text-lg text-text-secondary leading-relaxed max-w-xl">
                {t("subtitle")}
              </p>
            </AnimatedSection>

            <AnimatedSection delay={0.3} className="flex gap-4 pt-1">
              <Button href="/inscription" variant="primary" size="lg" className="shadow-green-btn hover:-translate-y-0.5 transition-transform">
                {t("ctaSignup")}
              </Button>
            </AnimatedSection>

            {/* Quick Badges */}
            <AnimatedSection delay={0.4} className="flex items-center gap-8 pt-5 border-t border-primary/10 w-full justify-start">
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

          {/* Right Visual : video de presentation */}
          <div className="lg:col-span-5 relative flex justify-center">
            <AnimatedSection delay={0.3} className="relative w-full max-w-[480px]">
              {/* Decorative frame, offset behind the card, fading at the edges */}
              <svg
                className="absolute -inset-3 w-[calc(100%+1.5rem)] h-[calc(100%+1.5rem)] pointer-events-none"
                aria-hidden="true"
              >
                <defs>
                  <linearGradient id="hero-frame-fade" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0" />
                    <stop offset="25%" stopColor="var(--color-primary)" stopOpacity="0.45" />
                    <stop offset="50%" stopColor="var(--color-primary)" stopOpacity="0.15" />
                    <stop offset="75%" stopColor="var(--color-primary)" stopOpacity="0.45" />
                    <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <rect
                  x="2"
                  y="2"
                  width="calc(100% - 4px)"
                  height="calc(100% - 4px)"
                  rx="36"
                  fill="none"
                  stroke="url(#hero-frame-fade)"
                  strokeWidth="2"
                />
              </svg>
              {/* Soft glow */}
              <div className="absolute inset-4 rounded-[2rem] bg-primary/15 blur-2xl -z-10" />

              {/* Lecteur video */}
              <div className="relative rounded-[2rem] overflow-hidden shadow-2xl">
                <HeroVideo title={t("videoTitle")} playLabel={t("videoPlay")} />
              </div>

              {/* Badges sous la video, pour ne pas masquer le lecteur */}
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="bg-white/95 backdrop-blur-md border border-primary-light shadow-lg rounded-2xl p-3.5 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center text-primary shrink-0">
                    <Heart className="w-5 h-5 fill-primary" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs text-text-muted font-medium truncate">{t("marriagesLabel")}</div>
                    <div className="text-base font-bold text-text-primary font-serif leading-tight truncate">{t("marriagesValue")}</div>
                  </div>
                </div>

                <div className="bg-jommba-dark/95 backdrop-blur-md border border-white/10 shadow-xl rounded-2xl p-3.5 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shrink-0 shadow-green-btn">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs text-white/70 font-medium truncate">{t("securityLabel")}</div>
                    <div className="text-sm font-bold text-white truncate">{t("securityValue")}</div>
                  </div>
                </div>
              </div>
            </AnimatedSection>
          </div>

        </div>
      </Container>
    </section>
  );
}
