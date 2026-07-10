"use client";

import { useEffect, useState, useRef } from "react";
import { useTranslations } from "next-intl";
import { Users, Heart, ShieldCheck, Globe } from "lucide-react";
import Container from "@/components/ui/Container";
import AnimatedSection from "@/components/ui/AnimatedSection";

interface StatItemProps {
  icon: React.ReactNode;
  value: number;
  suffix: string;
  label: string;
}

function StatCounter({ icon, value, suffix, label }: StatItemProps) {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const elementRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
        }
      },
      { threshold: 0.1 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, [hasAnimated]);

  useEffect(() => {
    if (!hasAnimated) return;

    let start = 0;
    const duration = 2000; // 2 seconds
    const steps = 50;
    const stepTime = duration / steps;
    const increment = value / steps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [hasAnimated, value]);

  return (
    <div
      ref={elementRef}
      className="flex flex-col items-center justify-center p-4 sm:p-6 text-center bg-white border border-primary-light/35 rounded-2xl shadow-sm hover:shadow-green transition-all duration-300 group"
    >
      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary-light text-primary flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <div className="text-2xl sm:text-4xl font-bold text-text-primary tracking-tight font-serif mb-1">
        {count.toLocaleString()}
        <span className="text-primary">{suffix}</span>
      </div>
      <div className="text-[11px] sm:text-sm font-semibold text-text-muted leading-tight">{label}</div>
    </div>
  );
}

export default function StatsSection() {
  const t = useTranslations("home.stats");

  return (
    <section className="bg-jommba-bg/50 py-16 border-y border-primary-light/20 relative">
      <Container>
        <AnimatedSection>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            <StatCounter
              icon={<Users className="w-6 h-6" />}
              value={50000}
              suffix="+"
              label={t("singles")}
            />
            <StatCounter
              icon={<Heart className="w-6 h-6 fill-primary/10" />}
              value={1200}
              suffix="+"
              label={t("marriages")}
            />
            <StatCounter
              icon={<ShieldCheck className="w-6 h-6" />}
              value={100}
              suffix="%"
              label={t("verified")}
            />
            <StatCounter
              icon={<Globe className="w-6 h-6" />}
              value={15}
              suffix="+"
              label={t("countries")}
            />
          </div>
        </AnimatedSection>
      </Container>
    </section>
  );
}

