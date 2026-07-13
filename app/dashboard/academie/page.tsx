// app/dashboard/academie/page.tsx
// Académie du Mariage — liste des articles publiés depuis la console admin
// (table academy_articles), présentés sous forme de blog pédagogique.
import type { Metadata } from 'next'
import DashboardNavbar from '@/components/dashboard/Navbar'
import { createClient } from '@/lib/supabase/server'
import AcademieListClient, { type AcademyArticleCard } from './academie-list-client'

export const metadata: Metadata = { title: 'Académie du Mariage | Jommba' }
export const dynamic = 'force-dynamic'

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}

export default async function AcademiePage() {
  let articles: AcademyArticleCard[] = []
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('academy_articles')
      .select('id,title,category,excerpt,content,featured,published_at')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(200)

    articles = (data ?? []).map((p) => {
      const words = stripHtml(p.content ?? '').split(/\s+/).filter(Boolean).length
      return {
        id: p.id,
        title: p.title,
        category: p.category,
        excerpt: p.excerpt ?? '',
        featured: p.featured,
        readMinutes: Math.max(1, Math.round(words / 200)),
      }
    })
  } catch {
    articles = []
  }

  return (
    <>
      <DashboardNavbar />
      <main className="pt-16 pb-20 md:pb-8">
        <AcademieListClient articles={articles} />
      </main>
    </>
  )
}
