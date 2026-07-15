'use client'

import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Heart, Eye, User } from 'lucide-react'
import { useCurrentUser } from '@/lib/use-current-user'

// Teaser Premium alimenté par les VRAIES stats du membre (favoris, demandes,
// visiteurs — chargées depuis Supabase par le layout). Masqué si aucune
// activité réelle : on n'invente jamais d'intérêt fictif.
export default function ProfileAppreciation() {
  const router = useRouter()
  const t = useTranslations('dashboard.appreciation')
  const { isPremium, gender, stats } = useCurrentUser()

  const interested = stats.favorites + stats.requests
  if (isPremium || interested === 0) return null

  const label = gender === 'homme' ? t('sisters') : gender === 'femme' ? t('brothers') : t('members')
  const avatarCount = Math.min(interested, 4)
  const extra = interested - avatarCount

  return (
    <div className="bg-white rounded-xl p-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center shrink-0">
          <Heart className="w-4 h-4 text-pink-500" />
        </div>
        <div>
          <h2 className="font-semibold text-gray-900 text-sm">{t('title')}</h2>
          <p className="text-xs text-gray-400">
            {t('summary', {
              count: interested,
              label,
              requests: stats.requests,
              favorites: stats.favorites,
            })}
          </p>
        </div>
      </div>

      {/* Silhouettes floutées — placeholders neutres, pas de fausses photos */}
      <div className="flex items-center gap-2 mb-4">
        <div className="flex -space-x-2">
          {Array.from({ length: avatarCount }).map((_, i) => (
            <div
              key={i}
              className="w-10 h-10 rounded-full overflow-hidden border-2 border-white bg-[#E1F5EE] flex items-center justify-center"
              style={{ filter: 'blur(3px)' }}
            >
              <User className="w-5 h-5 text-[#10B981]" />
            </div>
          ))}
          {extra > 0 && (
            <div className="w-10 h-10 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center">
              <span className="text-xs font-bold text-gray-500">+{extra}</span>
            </div>
          )}
        </div>
        {stats.visitors > 0 && (
          <div className="flex items-center gap-1 text-xs text-gray-500 ml-1">
            <Eye className="w-3.5 h-3.5 text-violet-400" />
            <span>{t('visits', { count: stats.visitors })}</span>
          </div>
        )}
      </div>

      {/* CTA */}
      <button
        onClick={() => router.push('/dashboard/premium')}
        className="w-full py-2.5 rounded-xl bg-amber-500 text-white text-sm font-semibold hover:bg-amber-600 transition-colors"
      >
        {t('cta')}
      </button>
    </div>
  )
}
