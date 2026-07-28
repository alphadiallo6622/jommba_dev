// app/(public)/blog/[slug]/page.tsx
// Page détail d'un article — sert les articles publiés depuis la console
// admin (slug = id BDD) et les articles fondateurs statiques (slug texte).
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { ArrowLeft, BookOpen, Calendar, Clock } from "lucide-react";
import Container from "@/components/ui/Container";
import Badge from "@/components/ui/Badge";
import { createClient } from "@/lib/supabase/server";
import { BLOG_POSTS } from "@/data/blogPosts";
import { Link } from "@/i18n/navigation";
import ShareArticle from "@/components/blog/ShareArticle";

export const dynamic = "force-dynamic";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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

interface ArticleView {
  title: string;
  category: string;
  excerpt: string;
  /** HTML prêt à rendre (échappé pour les articles statiques en texte brut). */
  html: string;
  authorName: string;
  authorAvatar: string;
  date: string;
  readTime: string;
  coverGradient: string;
  coverImage: string | null;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

async function loadArticle(slug: string): Promise<ArticleView | null> {
  // Article publié depuis la console admin (slug = id)
  if (UUID_RE.test(slug)) {
    try {
      const supabase = await createClient();
      const { data: p } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("id", slug)
        .eq("status", "published")
        .maybeSingle();

      if (!p) return null;
      const text = stripHtml(p.content ?? "");
      const minutes = Math.max(1, Math.round(text.split(/\s+/).filter(Boolean).length / 200));
      return {
        title: p.title,
        category: p.category,
        excerpt: p.excerpt ?? "",
        // Contenu rédigé par les admins via l'éditeur riche : HTML de confiance.
        html: p.content ?? "",
        authorName: p.author,
        authorAvatar: initials(p.author),
        date: p.published_at ? frDate(p.published_at) : "",
        readTime: `${minutes} min de lecture`,
        coverGradient: CATEGORY_GRADIENT[p.category] ?? "from-emerald-500 to-teal-700",
        coverImage: p.cover_image_url,
      };
    } catch {
      return null;
    }
  }

  // Article fondateur statique (contenu en texte brut → paragraphes)
  const post = BLOG_POSTS.find((b) => b.slug === slug);
  if (!post) return null;
  const html = post.content
    .split(/\n{2,}/)
    .map((para) => `<p>${escapeHtml(para.trim())}</p>`)
    .join("");
  return {
    title: post.title,
    category: post.category,
    excerpt: post.excerpt,
    html,
    authorName: post.author.name,
    authorAvatar: post.author.avatar,
    date: post.date,
    readTime: post.readTime,
    coverGradient: post.coverGradient,
    coverImage: post.coverImage ?? null,
  };
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
): Promise<Metadata> {
  const { slug } = await params;
  const article = await loadArticle(decodeURIComponent(slug));
  if (!article) return { title: "Article introuvable | Jommba" };
  const title = `${article.title} | Blog Jommba`;
  const description = article.excerpt || undefined;
  // L'image de couverture de l'article remplace le logo par défaut sur les
  // aperçus de partage (Facebook, WhatsApp, LinkedIn…) quand elle existe.
  const images = article.coverImage ? [{ url: article.coverImage }] : undefined;
  return {
    title,
    description,
    openGraph: { title, description, images, type: "article" },
    twitter: { card: "summary_large_image", title, description, images: article.coverImage ? [article.coverImage] : undefined },
  };
}

export default async function BlogArticlePage(
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const article = await loadArticle(decodeURIComponent(slug));
  if (!article) notFound();
  const t = await getTranslations("blog");

  return (
    <article className="bg-jommba-bg pb-20">
      {/* Bandeau de couverture */}
      <div className={`relative bg-gradient-to-br ${article.coverGradient} text-white`}>
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-white/5 blur-2xl" />
        <div className="absolute bottom-0 left-10 w-28 h-28 rounded-full bg-white/5 blur-xl" />
        <Container>
          <div className="py-16 sm:py-20 max-w-3xl mx-auto space-y-6">
            <Link
              href="/blog"
              className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-white/75 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              {t("backToBlog")}
            </Link>

            <div className="flex items-center gap-3">
              <Badge variant="gold">{article.category}</Badge>
            </div>

            <h1 className="text-2xl sm:text-4xl font-serif font-bold leading-tight">
              {article.title}
            </h1>

            {article.excerpt && (
              <p className="text-sm sm:text-base text-white/80 leading-relaxed">
                {article.excerpt}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-x-5 gap-y-3 pt-2">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-white/15 text-white font-bold text-xs flex items-center justify-center">
                  {article.authorAvatar}
                </div>
                <span className="text-sm font-semibold">{article.authorName}</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-white/70 font-medium">
                {article.date && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {article.date}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {article.readTime}
                </span>
              </div>
            </div>

            <div className="pt-2">
              <ShareArticle title={article.title} excerpt={article.excerpt} tone="onDark" />
            </div>
          </div>
        </Container>
      </div>

      {/* Image de couverture */}
      {article.coverImage && (
        <Container>
          <div className="max-w-3xl mx-auto -mt-10 relative z-10">
            <div className="rounded-2xl overflow-hidden shadow-lg border-4 border-white aspect-[16/9]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={article.coverImage} alt={article.title} className="w-full h-full object-cover" />
            </div>
          </div>
        </Container>
      )}

      {/* Corps de l'article */}
      <Container>
        <div className="max-w-3xl mx-auto">
          <div className={`bg-white rounded-2xl border border-primary-light/40 shadow-sm relative p-6 sm:p-10 ${article.coverImage ? "mt-6" : "-mt-8"}`}>
            <div
              className="text-sm sm:text-[15px] leading-relaxed text-text-secondary space-y-4
                [&_h2]:text-xl [&_h2]:font-serif [&_h2]:font-bold [&_h2]:text-text-primary [&_h2]:mt-8 [&_h2]:mb-3
                [&_h3]:text-lg [&_h3]:font-serif [&_h3]:font-bold [&_h3]:text-text-primary [&_h3]:mt-6 [&_h3]:mb-2
                [&_p]:my-4 [&_strong]:text-text-primary [&_a]:text-primary [&_a]:underline
                [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-4
                [&_li]:my-1 [&_blockquote]:border-l-4 [&_blockquote]:border-primary/40 [&_blockquote]:pl-4 [&_blockquote]:italic"
              dangerouslySetInnerHTML={{ __html: article.html }}
            />

            <div className="mt-10 pt-6 border-t border-primary-light/35">
              <ShareArticle title={article.title} excerpt={article.excerpt} />
            </div>

            <div className="mt-6 pt-6 border-t border-primary-light/35 flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-primary-light text-primary font-bold text-xs flex items-center justify-center">
                  {article.authorAvatar}
                </div>
                <div>
                  <p className="text-xs font-bold text-text-primary">{article.authorName}</p>
                  <p className="text-[11px] text-text-muted">{t("editorialTeam")}</p>
                </div>
              </div>
              <Link
                href="/blog"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
              >
                <BookOpen className="w-3.5 h-3.5" />
                {t("viewAllArticles")}
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </article>
  );
}
