"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { SearchSlash } from "lucide-react";
import FAQHero from "@/components/faq/FAQHero";
import FAQCategories from "@/components/faq/FAQCategories";
import FAQAccordion from "@/components/faq/FAQAccordion";
import FAQContactCTA from "@/components/faq/FAQContactCTA";
import Container from "@/components/ui/Container";
import AnimatedSection from "@/components/ui/AnimatedSection";
import { FAQ_DATA } from "@/data/faqData";
import type { FAQItem } from "@/data/faqData";

export default function FAQPage() {
  const t = useTranslations("faq");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategoryId, setActiveCategoryId] = useState("account");

  // Résout tous les items traduits, groupés par catégorie, une seule fois.
  const itemsByCategory = useMemo(() => {
    const map = new Map<string, FAQItem[]>();
    for (const category of FAQ_DATA) {
      const items: FAQItem[] = Array.from({ length: category.itemCount }, (_, i) => {
        const key = String(i + 1);
        return {
          question: t(`items.${category.id}.${key}.question`),
          answer: t(`items.${category.id}.${key}.answer`),
        };
      });
      map.set(category.id, items);
    }
    return map;
  }, [t]);

  // Filtering questions
  let displayedItems: FAQItem[] = [];
  const isSearching = searchQuery.trim().length > 0;

  if (isSearching) {
    // Search across all categories
    const q = searchQuery.toLowerCase();
    displayedItems = FAQ_DATA.flatMap((category) =>
      (itemsByCategory.get(category.id) ?? []).filter(
        (item) =>
          item.question.toLowerCase().includes(q) ||
          item.answer.toLowerCase().includes(q)
      )
    );
  } else {
    // Show items from active category
    displayedItems = itemsByCategory.get(activeCategoryId) ?? [];
  }

  return (
    <>
      <FAQHero searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      <section className="py-12 bg-jommba-bg">
        <Container>
          {/* Categories selection - Hide when searching */}
          {!isSearching && (
            <AnimatedSection className="mb-12">
              <FAQCategories
                categories={FAQ_DATA}
                activeCategoryId={activeCategoryId}
                onSelectCategory={setActiveCategoryId}
              />
            </AnimatedSection>
          )}

          {/* Search Result Information */}
          {isSearching && (
            <AnimatedSection className="mb-8 max-w-3xl mx-auto text-left">
              <p className="text-sm font-semibold text-text-muted">
                {t("searchResults", { query: searchQuery, count: displayedItems.length })}
              </p>
            </AnimatedSection>
          )}

          {/* Empty State */}
          {displayedItems.length === 0 && (
            <AnimatedSection className="py-16 text-center max-w-sm mx-auto flex flex-col items-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-primary-light/50 text-primary flex items-center justify-center">
                <SearchSlash className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold font-serif text-text-primary">
                {t("empty.title")}
              </h3>
              <p className="text-xs text-text-muted leading-relaxed">
                {t("empty.subtitle")}
              </p>
            </AnimatedSection>
          )}

          {/* FAQ list */}
          {displayedItems.length > 0 && (
            <AnimatedSection>
              <FAQAccordion items={displayedItems} />
            </AnimatedSection>
          )}
        </Container>
      </section>

      <FAQContactCTA />
    </>
  );
}
