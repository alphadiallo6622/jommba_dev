'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
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
  const { user } = useAuth()
  const { isPremium } = useCurrentUser()
  const [visitors, setVisitors] = useState<Visitor[]>([])
  const [loading, setLoading]   = useState(true)

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
      let profileMap = new Map<string, ProfileRow>()

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
            city:        p?.city ?? 'Inconnu',
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
  }, [user])

  useEffect(() => { fetchVisitors() }, [fetchVisitors])

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-emerald-900 flex items-center gap-2">
          Mes visiteurs
          <Eye className="w-6 h-6 text-emerald-500" />
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          {loading ? '…' : `${visitors.length} personne${visitors.length > 1 ? 's ont' : ' a'} consulté ton profil`}
        </p>
      </div>

      {loading && (
        <div className="flex justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
        </div>
      )}

      {!loading && !isPremium && visitors.length > 0 && (
        <PremiumBanner
          visitorsCount={visitors.length}
          onCTA={() => router.push('/dashboard/premium')}
        />
      )}

      {!loading && visitors.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {visitors.map((visitor) =>
            isPremium ? (
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
          <p className="text-gray-400 font-medium">Aucun visiteur pour l&apos;instant</p>
          <p className="text-gray-300 text-sm mt-2">
            Complète ton profil pour attirer plus de visites
          </p>
        </div>
      )}

    </div>
  )
}
