'use client'

import { Eye, Users, Heart, MessageCircle, BarChart2, MapPin } from 'lucide-react'
import { useCurrentUser } from '@/lib/use-current-user'

const days = ['dim', 'lun', 'mar', 'mer', 'jeu', 'ven', 'sam']

export default function StatsPanel() {
  const { stats } = useCurrentUser()

  const metrics = [
    { icon: Eye,           label: 'Vues',      value: stats.views,     color: 'bg-blue-100 text-blue-500'     },
    { icon: Users,         label: 'Visiteurs', value: stats.visitors,  color: 'bg-purple-100 text-purple-500' },
    { icon: Heart,         label: 'Favoris',   value: stats.favorites, color: 'bg-pink-100 text-pink-500'     },
    { icon: MessageCircle, label: 'Demandes',  value: stats.requests,  color: 'bg-green-100 text-green-500'   },
  ]

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
          {days.map(day => (
            <div key={day} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full bg-gray-100 rounded-sm" style={{ height: '32px' }} />
              <span className="text-[8px] text-gray-300">{day}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Performance score */}
      <div>
        <div className="flex items-center justify-between mb-1.5 text-xs">
          <span className="text-gray-500">Score de performance</span>
          <span className="font-semibold text-gray-700">0/100</span>
        </div>
        <div className="h-1.5 bg-gray-100 rounded-full">
          <div className="h-full bg-emerald-500 rounded-full" style={{ width: '0%' }} />
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
