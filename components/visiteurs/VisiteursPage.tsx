'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Eye, Loader2 } from 'lucide-react'
import { useAuth } from '@/components/providers/AuthProvider'
import { useCurrentUser } from '@/lib/use-current-user'
import { createClient } from '@/lib/supabase/client'
import type { Visitor } from '@/lib/mock-visitors'
import PremiumBanner from './PremiumBanner'
import VisitorCardLocked from './VisitorCardLocked'
import VisitorCardUnlocked from './VisitorCardUnlocked'

function hoursAgo(dateStr: string): number {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 3_600_000)
}

export default function VisiteursPage() {
  const router = useRouter()
  const t = useTranslations('dashboard.visiteurs')
  const { user } = useAuth()
  const { isPremium } = useCurrentUser()
  const [visitors, setVisitors] = useState<Visitor[]>([])
  const [loading, setLoading]   = useState(true)
  // Nombre de visiteurs visibles en clair pour un membre Free (Paramètres →
  // Limites). null tant que la valeur n'est pas chargée : on floute alors tout,
  // pour ne jamais dévoiler plus que la limite en cas de lenteur réseau.
  const [visibleLimit, setVisibleLimit] = useState<number | null>(null)

  const fetchVisitors = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const supabase = createClient()

      const { data: visits } = await supabase
        .from('profile_visitors')
        .select('visitor_id, visited_at')
        .eq('profile_id', user.id)
        .order('visited_at', { ascending: false })

      const visitorIds = [...new Set((visits ?? []).map((v: { visitor_id: string }) => v.visitor_id))]

      type ProfileRow = { user_id: string; first_name: string; last_name: string | null; age: number | null; avatar_url: string | null; city: string | null; country: string | null }
      const profileMap = new Map<string, ProfileRow>()

      if (visitorIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, first_name, last_name, age, avatar_url, city, country')
          .in('user_id', visitorIds)
        for (const p of (profiles ?? []) as ProfileRow[]) profileMap.set(p.user_id, p)
      }

      const visitTimeMap = new Map<string, string>()
      for (const v of (visits ?? []) as { visitor_id: string; visited_at: string }[]) {
        if (!visitTimeMap.has(v.visitor_id)) visitTimeMap.set(v.visitor_id, v.visited_at)
      }

      setVisitors(
        visitorIds.map(id => {
          const p   = profileMap.get(id)
          const hrs = hoursAgo(visitTimeMap.get(id) ?? new Date().toISOString())
          return {
            id,
            photo:       p?.avatar_url ?? '/avatar-placeholder.svg',
            firstName:   p?.first_name ?? '…',
            lastInitial: (p?.last_name ?? '').charAt(0),
            age:         p?.age ?? 0,
            city:        p?.city ?? t('unknown'),
            country:     p?.country ?? '',
            hoursAgo:    hrs,
            isNew:       hrs < 24,
          }
        })
      )
    } catch (err) {
      console.error('[VisiteursPage] fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [user, t])

  useEffect(() => { fetchVisitors() }, [fetchVisitors])

  // Limite de visiteurs visibles, pilotée par la console admin.
  useEffect(() => {
    if (isPremium) return
    const supabase = createClient()
    supabase
      .from('platform_settings')
      .select('limits')
      .eq('id', 1)
      .maybeSingle()
      .then(({ data }) => {
        const value = Number((data?.limits as { visitors?: number } | null)?.visitors)
        setVisibleLimit(Number.isFinite(value) && value >= 0 ? value : 0)
      })
  }, [isPremium])

  const hiddenCount = isPremium ? 0 : Math.max(0, visitors.length - (visibleLimit ?? 0))

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-emerald-900 flex items-center gap-2">
          {t('title')}
          <Eye className="w-6 h-6 text-emerald-500" />
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          {loading ? '…' : t('subtitle', { count: visitors.length })}
        </p>
      </div>

      {loading && (
        <div className="flex justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
        </div>
      )}

      {/* Le bandeau ne compte que les visiteurs encore masqués : inutile de
          proposer de « voir qui » si tout est déjà visible. */}
      {!loading && !isPremium && hiddenCount > 0 && (
        <PremiumBanner
          visitorsCount={hiddenCount}
          onCTA={() => router.push('/dashboard/premium')}
        />
      )}

      {!loading && visitors.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {visitors.map((visitor, index) =>
            // Premium : tout est visible. Free : seuls les `visibleLimit`
            // visiteurs les plus récents le sont, les autres restent floutés.
            isPremium || index < (visibleLimit ?? 0) ? (
              <VisitorCardUnlocked key={visitor.id} visitor={visitor} />
            ) : (
              <VisitorCardLocked
                key={visitor.id}
                visitor={visitor}
                onUnlock={() => router.push('/dashboard/premium')}
              />
            )
          )}
        </div>
      )}

      {!loading && visitors.length === 0 && isPremium && (
        <div className="text-center py-20">
          <Eye className="w-12 h-12 text-gray-200 mx-auto mb-4" />
          <p className="text-gray-400 font-medium">{t('emptyTitle')}</p>
          <p className="text-gray-300 text-sm mt-2">
            {t('emptyDesc')}
          </p>
        </div>
      )}

    </div>
  )
}
