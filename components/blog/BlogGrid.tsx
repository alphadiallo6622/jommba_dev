"use client";

import { useState } from "react";
import { SearchSlash } from "lucide-react";
import Container from "@/components/ui/Container";
import BlogCard from "./BlogCard";
import AnimatedSection from "@/components/ui/AnimatedSection";
import { BLOG_POSTS, BlogPost } from "@/data/blogPosts";
import { cn } from "@/lib/utils";

interface BlogGridProps {
  searchQuery: string;
  posts?: BlogPost[];
}

const CATEGORIES = ["Tous", "Spiritualité", "Conseils", "Famille", "Événements", "Actualités"];

export default function BlogGrid({ searchQuery, posts = BLOG_POSTS }: BlogGridProps) {
  const [selectedCategory, setSelectedCategory] = useState("Tous");

  // Filter logic
  const filteredPosts = posts.filter((post) => {
    const matchesCategory =
      selectedCategory === "Tous" || post.category === selectedCategory;
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Split featured and regular posts
  const featuredPost = filteredPosts.find((post) => post.featured);
  const regularPosts = filteredPosts.filter(
    (post) => !featuredPost || post.slug !== featuredPost.slug
  );

  return (
    <section className="py-12 bg-jommba-bg">
      <Container>
        {/* Category Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-12 border-b border-primary-light/20 pb-6">
          {CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-200 select-none",
                selectedCategory === category
                  ? "bg-primary text-white shadow-green-btn"
                  : "bg-white text-text-secondary border border-primary-light/45 hover:bg-primary-light/30 hover:text-primary"
              )}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Empty State */}
        {filteredPosts.length === 0 && (
          <AnimatedSection className="py-16 text-center max-w-sm mx-auto flex flex-col items-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-primary-light/50 text-primary flex items-center justify-center">
              <SearchSlash className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold font-serif text-text-primary">
              Aucun article trouvé
            </h3>
            <p className="text-xs text-text-muted leading-relaxed">
              Nous n'avons trouvé aucun résultat correspondant à votre recherche. Essayez d'autres mots-clés ou réinitialisez les filtres.
            </p>
          </AnimatedSection>
        )}

        {/* Blog Content */}
        {filteredPosts.length > 0 && (
          <div className="space-y-12">
            {/* Featured Post */}
            {featuredPost && (
              <AnimatedSection>
                <BlogCard post={featuredPost} featured />
              </AnimatedSection>
            )}

            {/* Regular Posts Grid */}
            {regularPosts.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {regularPosts.map((post: BlogPost, index: number) => (
                  <AnimatedSection key={post.slug} delay={index * 0.05}>
                    <BlogCard post={post} />
                  </AnimatedSection>
                ))}
              </div>
            )}
          </div>
        )}
      </Container>
    </section>
  );
}

