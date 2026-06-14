"use client";

import { useState } from "react";
import { SearchSlash } from "lucide-react";
import FAQHero from "@/components/faq/FAQHero";
import FAQCategories from "@/components/faq/FAQCategories";
import FAQAccordion from "@/components/faq/FAQAccordion";
import FAQContactCTA from "@/components/faq/FAQContactCTA";
import Container from "@/components/ui/Container";
import AnimatedSection from "@/components/ui/AnimatedSection";
import { FAQ_DATA, FAQItem } from "@/data/faqData";

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategoryId, setActiveCategoryId] = useState("account");

  // Filtering questions
  let displayedItems: FAQItem[] = [];
  const isSearching = searchQuery.trim().length > 0;

  if (isSearching) {
    // Search across all categories
    displayedItems = FAQ_DATA.flatMap((category) =>
      category.items.filter(
        (item) =>
          item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.answer.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  } else {
    // Show items from active category
    const activeCategory = FAQ_DATA.find((cat) => cat.id === activeCategoryId);
    displayedItems = activeCategory ? activeCategory.items : [];
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
                Résultats de recherche pour : <span className="text-primary">"{searchQuery}"</span> ({displayedItems.length} questions trouvées)
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
                Aucun résultat trouvé
              </h3>
              <p className="text-xs text-text-muted leading-relaxed">
                Nous n'avons trouvé aucune question correspondant à votre recherche. Essayez d'autres mots-clés ou parcourez nos catégories.
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

