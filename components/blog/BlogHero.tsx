"use client";

import { useTranslations } from "next-intl";
import { Search, X } from "lucide-react";
import Container from "@/components/ui/Container";

interface BlogHeroProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export default function BlogHero({ searchQuery, setSearchQuery }: BlogHeroProps) {
  const t = useTranslations("blog.hero");

  return (
    <section className="relative overflow-hidden py-16 bg-jommba-bg border-b border-primary-light/10">
      {/* Background glow decorators */}
      <div className="absolute top-0 left-1/4 w-[300px] h-[300px] rounded-full bg-primary/3 blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] rounded-full bg-primary/3 blur-3xl pointer-events-none -z-10" />

      <Container size="sm" className="relative z-10 text-center flex flex-col items-center space-y-6">
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase bg-primary-light text-primary select-none">
          {t("badge")}
        </span>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-text-primary leading-tight">
          {t("title")}
        </h1>

        <p className="text-sm sm:text-base text-text-muted leading-relaxed max-w-xl mx-auto">
          {t("subtitle")}
        </p>

        {/* Search Input Bar */}
        <div className="w-full max-w-md relative mt-4">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-text-subtle">
            <Search className="w-5 h-5" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="w-full pl-12 pr-12 py-3.5 rounded-2xl border border-primary-light/45 bg-white text-sm text-text-primary font-medium shadow-sm focus:outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all duration-200"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute inset-y-0 right-4 flex items-center text-text-subtle hover:text-primary transition-colors duration-200"
              aria-label={t("clearSearch")}
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </Container>
    </section>
  );
}
