import { BookOpen } from 'lucide-react'

const articles = [
  { dot: 'bg-green-500', label: 'Les critères essentiels du choix' },
  { dot: 'bg-red-500',   label: 'Réussir la période de connaissance' },
  { dot: 'bg-amber-500', label: "L'Istikhara : guide pratique" },
]

const tags = ['Préparation', 'Communication', 'Spiritualité']

export default function MarriageAcademy() {
  return (
    <div className="bg-white rounded-xl p-4">
      <div className="flex items-center gap-2 mb-0.5">
        <BookOpen className="w-4 h-4 text-amber-500" />
        <span className="font-bold text-gray-900 text-sm">Académie du Mariage</span>
      </div>
      <p className="text-xs text-gray-400 mb-3">Apprends et prépare-toi</p>

      <ul className="space-y-2 mb-3">
        {articles.map(({ dot, label }) => (
          <li key={label} className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full shrink-0 ${dot}`} />
            <span className="text-xs text-gray-700">{label}</span>
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

      <button className="text-xs font-semibold text-emerald-500 hover:text-emerald-600 transition-colors">
        Explorer l&rsquo;académie →
      </button>
    </div>
  )
}
