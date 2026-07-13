import Link from 'next/link'
import { BookOpen } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

// Repli statique si aucun article n'est encore publié dans l'académie
const FALLBACK_ARTICLES = [
  'Les critères essentiels du choix',
  'Réussir la période de connaissance',
  "L'Istikhara : guide pratique",
]

const DOTS = ['bg-green-500', 'bg-red-500', 'bg-amber-500']

const tags = ['Préparation', 'Communication', 'Spiritualité']

export default async function MarriageAcademy() {
  let titles: string[] = []
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('academy_articles')
      .select('title')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(3)
    titles = (data ?? []).map((a) => a.title)
  } catch {
    titles = []
  }
  if (titles.length === 0) titles = FALLBACK_ARTICLES

  return (
    <div className="bg-white rounded-xl p-4">
      <div className="flex items-center gap-2 mb-0.5">
        <BookOpen className="w-4 h-4 text-amber-500" />
        <span className="font-bold text-gray-900 text-sm">Académie du Mariage</span>
      </div>
      <p className="text-xs text-gray-400 mb-3">Apprends et prépare-toi</p>

      <ul className="space-y-2 mb-3">
        {titles.map((label, i) => (
          <li key={label} className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full shrink-0 ${DOTS[i % DOTS.length]}`} />
            <span className="text-xs text-gray-700 line-clamp-1">{label}</span>
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap gap-2 mb-3">
        {tags.map(tag => (
          <span
            key={tag}
            className="text-xs font-medium bg-gray-100 text-gray-600 px-3 py-1 rounded-full"
          >
            {tag}
          </span>
        ))}
      </div>

      <Link
        href="/dashboard/academie"
        className="inline-block text-xs font-semibold text-emerald-500 hover:text-emerald-600 transition-colors"
      >
        Explorer l&rsquo;académie →
      </Link>
    </div>
  )
}
