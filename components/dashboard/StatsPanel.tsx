'use client'

import { useEffect, useState } from 'react'
import { Eye, Users, Heart, MessageCircle, BarChart2, MapPin } from 'lucide-react'
import { useCurrentUser } from '@/lib/use-current-user'
import { useAuth } from '@/components/providers/AuthProvider'
import { createClient } from '@/lib/supabase/client'

const DAY_LABELS = ['dim', 'lun', 'mar', 'mer', 'jeu', 'ven', 'sam']
const MS_PER_DAY = 86400000

type DayBucket = { label: string; count: number }

function emptyWeek(): DayBucket[] {
  return Array.from({ length: 7 }, (_, i) => ({ label: DAY_LABELS[i], count: 0 }))
}

// Score de performance = 50% complétude du profil + 50% engagement reçu.
// Chaque métrique d'engagement est plafonnée à un seuil "bon niveau" puis
// moyennée, pour éviter qu'un seul gros chiffre écrase les autres.
const ENGAGEMENT_TARGETS = { views: 50, visitors: 20, favorites: 10, requests: 5 }

function computePerformanceScore(
  profileCompletion: number,
  stats: { views: number; visitors: number; favorites: number; requests: number },
): number {
  const engagementScore = (
    Math.min(stats.views     / ENGAGEMENT_TARGETS.views,     1) +
    Math.min(stats.visitors  / ENGAGEMENT_TARGETS.visitors,  1) +
    Math.min(stats.favorites / ENGAGEMENT_TARGETS.favorites, 1) +
    Math.min(stats.requests  / ENGAGEMENT_TARGETS.requests,  1)
  ) / 4 * 100

  return Math.round(profileCompletion * 0.5 + engagementScore * 0.5)
}

export default function StatsPanel() {
  const { stats, profileCompletion } = useCurrentUser()
  const { user }  = useAuth()
  const [dailyViews, setDailyViews] = useState<DayBucket[]>(emptyWeek())

  // Vues des 7 derniers jours (aujourd'hui inclus), groupées par jour, pour
  // le graphique "Évolution des vues" — basé sur la table profile_views.
  useEffect(() => {
    if (!user) return
    const supabase = createClient()

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const start = new Date(today)
    start.setDate(start.getDate() - 6)

    supabase
      .from('profile_views')
      .select('viewed_at')
      .eq('profile_id', user.id)
      .gte('viewed_at', start.toISOString())
      .then(({ data, error }) => {
        if (error) { console.error('[StatsPanel] daily views error:', error); return }

        const buckets = Array.from({ length: 7 }, (_, i) => {
          const d = new Date(start)
          d.setDate(d.getDate() + i)
          return { label: DAY_LABELS[d.getDay()], count: 0 }
        })

        for (const row of (data ?? []) as { viewed_at: string }[]) {
          const d = new Date(row.viewed_at)
          d.setHours(0, 0, 0, 0)
          const dayIndex = Math.round((d.getTime() - start.getTime()) / MS_PER_DAY)
          if (buckets[dayIndex]) buckets[dayIndex].count++
        }

        setDailyViews(buckets)
      })
  }, [user])

  const metrics = [
    { icon: Eye,           label: 'Vues',      value: stats.views,     color: 'bg-blue-100 text-blue-500'     },
    { icon: Users,         label: 'Visiteurs', value: stats.visitors,  color: 'bg-purple-100 text-purple-500' },
    { icon: Heart,         label: 'Favoris',   value: stats.favorites, color: 'bg-pink-100 text-pink-500'     },
    { icon: MessageCircle, label: 'Demandes',  value: stats.requests,  color: 'bg-green-100 text-green-500'   },
  ]

  const maxDailyCount = Math.max(1, ...dailyViews.map(d => d.count))
  const performanceScore = computePerformanceScore(profileCompletion, stats)

  return (
    <div className="bg-white rounded-xl p-4 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-amber-500" />
            <span className="font-bold text-gray-900 text-sm">Statistiques de ton profil</span>
          </div>
          <p className="text-xs text-gray-400 mt-0.5 ml-6 cursor-pointer hover:text-gray-600 transition-colors">
            Les 7 derniers jours ▸
          </p>
        </div>
        <span className="text-[10px] font-bold bg-emerald-500 text-white px-2 py-0.5 rounded-full">UPGRADE</span>
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-4 gap-2">
        {metrics.map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="flex flex-col items-center gap-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${color}`}>
              <Icon className="w-4 h-4" />
            </div>
            <span className="text-xl font-bold text-gray-900">{value}</span>
            <span className="text-xs text-gray-400">{label}</span>
          </div>
        ))}
      </div>

      {/* Bar chart */}
      <div>
        <p className="text-xs text-gray-400 mb-2">Évolution des vues</p>
        <div className="flex items-end gap-1 h-12">
          {dailyViews.map(({ label, count }, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div
                className={count > 0 ? 'w-full bg-emerald-400 rounded-sm' : 'w-full bg-gray-100 rounded-sm'}
                style={{ height: `${Math.max(4, (count / maxDailyCount) * 32)}px` }}
                title={`${count} vue${count > 1 ? 's' : ''}`}
              />
              <span className="text-[8px] text-gray-300">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Performance score */}
      <div>
        <div className="flex items-center justify-between mb-1.5 text-xs">
          <span className="text-gray-500">Score de performance</span>
          <span className="font-semibold text-gray-700">{performanceScore}/100</span>
        </div>
        <div className="h-1.5 bg-gray-100 rounded-full">
          <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${performanceScore}%` }} />
        </div>
      </div>

      {/* Tips */}
      <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-3">
        <div className="flex items-center gap-1.5 mb-2">
          <MapPin className="w-3.5 h-3.5 text-emerald-600" />
          <span className="text-xs font-semibold text-emerald-700">Conseils</span>
        </div>
        <ul className="space-y-1">
          <li className="text-[11px] text-gray-600 flex items-start gap-1.5">
            <span className="mt-0.5 shrink-0 text-emerald-500">•</span>
            Ajoute plus de détails à ton profil pour attirer plus de visiteurs
          </li>
          <li className="text-[11px] text-gray-600 flex items-start gap-1.5">
            <span className="mt-0.5 shrink-0 text-emerald-500">•</span>
            Complète la section &lsquo;Vision du mariage&rsquo; pour montrer ton sérieux
          </li>
        </ul>
      </div>
    </div>
  )
}
