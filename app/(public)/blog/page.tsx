// app/(public)/blog/page.tsx
// Blog public — articles publiés depuis la console admin (table blog_posts),
// fusionnés avec les articles fondateurs statiques.
import { createClient } from "@/lib/supabase/server";
import { BLOG_POSTS, type BlogPost } from "@/data/blogPosts";
import { BlogPageClient } from "./blog-page-client";

export const dynamic = "force-dynamic";

const CATEGORY_GRADIENT: Record<string, string> = {
  "Conseils":     "from-emerald-500 to-teal-700",
  "Famille":      "from-teal-600 to-cyan-800",
  "Spiritualité": "from-emerald-600 to-green-800",
  "Événements":   "from-cyan-600 to-teal-800",
  "Actualités":   "from-emerald-500 to-cyan-700",
};

const MONTHS = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];

function frDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function initials(name: string): string {
  return name.split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}

export default async function BlogPage() {
  let dbPosts: BlogPost[] = [];
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("blog_posts")
      .select("*")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(100);

    dbPosts = (data ?? []).map((p) => {
      const text = stripHtml(p.content ?? "");
      const minutes = Math.max(1, Math.round(text.split(/\s+/).filter(Boolean).length / 200));
      return {
        slug: p.id,
        title: p.title,
        excerpt: p.excerpt ?? "",
        content: text,
        category: p.category,
        author: { name: p.author, avatar: initials(p.author) },
        date: p.published_at ? frDate(p.published_at) : "",
        readTime: `${minutes} min de lecture`,
        featured: p.featured,
        coverGradient: CATEGORY_GRADIENT[p.category] ?? "from-emerald-500 to-teal-700",
        coverImage: p.cover_image_url ?? undefined,
      };
    });
  } catch {
    // En cas d'indisponibilité de la BDD, le blog statique reste servi.
    dbPosts = [];
  }

  return <BlogPageClient posts={[...dbPosts, ...BLOG_POSTS]} />;
}
