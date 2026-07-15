'use client'
// app/dashboard/academie/academie-list-client.tsx
// Grille d'articles de l'Académie du Mariage : filtre par catégorie + pagination.
import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import {
  BookOpen, Lightbulb, BookMarked, Users, Compass, Sparkles, Scale,
  Clock, ChevronRight, ChevronLeft, GraduationCap,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface AcademyArticleCard {
  id: string
  title: string
  category: string
  excerpt: string
  featured: boolean
  readMinutes: number
}

const PER_PAGE = 9

const CATEGORY_STYLE: Record<string, { icon: LucideIcon; iconBg: string; iconColor: string; chip: string }> = {
  'Conseils pratiques':    { icon: Lightbulb,  iconBg: 'bg-amber-50',   iconColor: 'text-amber-500',   chip: 'bg-amber-50 text-amber-600' },
  'Hadiths & Sagesse':     { icon: BookOpen,   iconBg: 'bg-emerald-50', iconColor: 'text-emerald-500', chip: 'bg-emerald-50 text-emerald-600' },
  'Histoires inspirantes': { icon: BookMarked, iconBg: 'bg-teal-50',    iconColor: 'text-teal-500',    chip: 'bg-teal-50 text-teal-600' },
  'Droits & Devoirs':      { icon: Scale,      iconBg: 'bg-yellow-50',  iconColor: 'text-yellow-600',  chip: 'bg-yellow-50 text-yellow-700' },
  'Préparation':           { icon: Compass,    iconBg: 'bg-blue-50',    iconColor: 'text-blue-500',    chip: 'bg-blue-50 text-blue-600' },
  'Spiritualité':          { icon: Sparkles,   iconBg: 'bg-purple-50',  iconColor: 'text-purple-500',  chip: 'bg-purple-50 text-purple-600' },
}

const DEFAULT_STYLE = { icon: Users, iconBg: 'bg-gray-50', iconColor: 'text-gray-500', chip: 'bg-gray-100 text-gray-600' }

export default function AcademieListClient({ articles }: { articles: AcademyArticleCard[] }) {
  const t = useTranslations('dashboard.academie')
  const [category, setCategory] = useState<string>('Tous')
  const [page, setPage] = useState(1)

  const categories = useMemo(
    () => ['Tous', ...Array.from(new Set(articles.map((a) => a.category)))],
    [articles],
  )

  const filtered = category === 'Tous' ? articles : articles.filter((a) => a.category === category)
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE))
  const visible = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* En-tête */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-semibold">
          <GraduationCap className="w-3.5 h-3.5" />
          {t('badge')}
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{t('heading')}</h1>
        <p className="text-sm text-gray-500 max-w-xl mx-auto">
          {t('intro')}
        </p>
      </div>

      {/* Filtres par catégorie */}
      {articles.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => { setCategory(c); setPage(1) }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                c === category
                  ? 'bg-emerald-500 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {c === 'Tous' ? t('all') : c}
            </button>
          ))}
        </div>
      )}

      {/* Grille */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400 bg-white rounded-2xl border border-gray-100">
          <BookOpen className="w-10 h-10 mb-3 opacity-40" />
          <p className="text-sm">{t('empty')}</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {visible.map((article) => {
            const style = CATEGORY_STYLE[article.category] ?? DEFAULT_STYLE
            const Icon = style.icon
            return (
              <Link
                key={article.id}
                href={`/dashboard/academie/${article.id}`}
                className="group bg-white rounded-2xl border border-gray-100 p-5 flex flex-col gap-3 hover:shadow-md hover:border-emerald-100 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className={`w-10 h-10 rounded-xl ${style.iconBg} flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${style.iconColor}`} />
                  </div>
                  <span className="flex items-center gap-1 text-[11px] text-gray-400 font-medium">
                    <Clock className="w-3 h-3" />
                    {t('readMin', { n: article.readMinutes })}
                  </span>
                </div>

                <div className="flex-1">
                  <h2 className="text-sm font-bold text-gray-900 leading-snug line-clamp-2 group-hover:text-emerald-600 transition-colors">
                    {article.title}
                  </h2>
                  {article.excerpt && (
                    <p className="text-xs text-gray-500 mt-1.5 leading-relaxed line-clamp-3">
                      {article.excerpt}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${style.chip}`}>
                    {article.category}
                  </span>
                  <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-emerald-500 group-hover:translate-x-0.5 transition-all" />
                </div>
              </Link>
            )
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1.5 pt-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="w-9 h-9 rounded-full border border-gray-200 bg-white flex items-center justify-center text-gray-500 disabled:opacity-40 hover:bg-gray-50 transition-colors"
            aria-label={t('prevPage')}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-9 h-9 rounded-full text-xs font-semibold transition-colors ${
                p === page
                  ? 'bg-emerald-500 text-white'
                  : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="w-9 h-9 rounded-full border border-gray-200 bg-white flex items-center justify-center text-gray-500 disabled:opacity-40 hover:bg-gray-50 transition-colors"
            aria-label={t('nextPage')}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}
