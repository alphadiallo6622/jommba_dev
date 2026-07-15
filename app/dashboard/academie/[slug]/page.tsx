// app/dashboard/academie/[slug]/page.tsx
// Détail d'un article de l'Académie du Mariage (slug = id BDD).
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getTranslations, getLocale } from 'next-intl/server'
import { ArrowLeft, BookOpen, Calendar, Clock } from 'lucide-react'
import DashboardNavbar from '@/components/dashboard/Navbar'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// Date localisée via Intl (fr/en) — pas de mois codés en dur.
function localizedDate(iso: string, locale: string): string {
  return new Date(iso).toLocaleDateString(locale === 'en' ? 'en-GB' : 'fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}

function initials(name: string): string {
  return name.split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase()
}

interface ArticleView {
  title: string
  category: string
  excerpt: string
  html: string
  authorName: string
  authorAvatar: string
  date: string
  readTime: string
  coverImage: string | null
}

async function loadArticle(slug: string): Promise<ArticleView | null> {
  if (!UUID_RE.test(slug)) return null
  try {
    const [locale, t] = await Promise.all([getLocale(), getTranslations('dashboard.academie')])
    const supabase = await createClient()
    const { data: p } = await supabase
      .from('academy_articles')
      .select('*')
      .eq('id', slug)
      .eq('status', 'published')
      .maybeSingle()

    if (!p) return null
    const text = stripHtml(p.content ?? '')
    const minutes = Math.max(1, Math.round(text.split(/\s+/).filter(Boolean).length / 200))
    return {
      title: p.title,
      category: p.category,
      excerpt: p.excerpt ?? '',
      // Contenu rédigé par les admins via l'éditeur riche : HTML de confiance.
      html: p.content ?? '',
      authorName: p.author,
      authorAvatar: initials(p.author),
      date: p.published_at ? localizedDate(p.published_at, locale) : '',
      readTime: t('readTime', { n: minutes }),
      coverImage: p.cover_image_url,
    }
  } catch {
    return null
  }
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
): Promise<Metadata> {
  const { slug } = await params
  const t = await getTranslations('dashboard.academie')
  const article = await loadArticle(decodeURIComponent(slug))
  if (!article) return { title: t('metaNotFound') }
  return {
    title: `${article.title} | ${t('metaSuffix')}`,
    description: article.excerpt || undefined,
  }
}

export default async function AcademieArticlePage(
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params
  const t = await getTranslations('dashboard.academie')
  const article = await loadArticle(decodeURIComponent(slug))
  if (!article) notFound()

  return (
    <>
      <DashboardNavbar />
      <main className="pt-16 pb-20 md:pb-8">
        <article className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
          {/* Bandeau de couverture */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white p-6 sm:p-10 space-y-5">
            <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-white/5 blur-2xl" />
            <div className="absolute bottom-0 left-10 w-28 h-28 rounded-full bg-white/5 blur-xl" />

            <Link
              href="/dashboard/academie"
              className="relative inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-white/75 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              {t('backToAcademy')}
            </Link>

            <div className="relative flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-white/15 text-white">
                {article.category}
              </span>
              <span className="flex items-center gap-1 text-[11px] text-white/75 font-medium">
                <Clock className="w-3 h-3" />
                {article.readTime}
              </span>
            </div>

            <h1 className="relative text-xl sm:text-3xl font-bold leading-tight">
              {article.title}
            </h1>

            {article.excerpt && (
              <p className="relative text-sm text-white/80 leading-relaxed">
                {article.excerpt}
              </p>
            )}

            <div className="relative flex flex-wrap items-center gap-x-5 gap-y-3 pt-1">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-white/15 text-white font-bold text-xs flex items-center justify-center">
                  {article.authorAvatar}
                </div>
                <span className="text-sm font-semibold">{article.authorName}</span>
              </div>
              {article.date && (
                <span className="flex items-center gap-1 text-xs text-white/70 font-medium">
                  <Calendar className="w-3.5 h-3.5" />
                  {article.date}
                </span>
              )}
            </div>
          </div>

          {/* Image de couverture */}
          {article.coverImage && (
            <div className="rounded-2xl overflow-hidden shadow-lg border-4 border-white aspect-[16/9] mt-6">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={article.coverImage} alt={article.title} className="w-full h-full object-cover" />
            </div>
          )}

          {/* Corps de l'article */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-10 mt-6">
            <div
              className="text-sm sm:text-[15px] leading-relaxed text-gray-600 space-y-4
                [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-gray-900 [&_h2]:mt-8 [&_h2]:mb-3
                [&_h3]:text-lg [&_h3]:font-bold [&_h3]:text-gray-900 [&_h3]:mt-6 [&_h3]:mb-2
                [&_p]:my-4 [&_strong]:text-gray-900 [&_a]:text-emerald-600 [&_a]:underline
                [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-4
                [&_li]:my-1 [&_blockquote]:border-l-4 [&_blockquote]:border-emerald-400/50 [&_blockquote]:pl-4 [&_blockquote]:italic"
              dangerouslySetInnerHTML={{ __html: article.html }}
            />

            <div className="mt-10 pt-6 border-t border-gray-100 flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-600 font-bold text-xs flex items-center justify-center">
                  {article.authorAvatar}
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900">{article.authorName}</p>
                  <p className="text-[11px] text-gray-400">{t('metaSuffix')}</p>
                </div>
              </div>
              <Link
                href="/dashboard/academie"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:underline"
              >
                <BookOpen className="w-3.5 h-3.5" />
                {t('seeAllArticles')}
              </Link>
            </div>
          </div>
        </article>
      </main>
    </>
  )
}
