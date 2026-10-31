'use client'

import { useCallback, useEffect, useRef } from 'react'
import { Compass, Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useCurrentUser } from '@/lib/use-current-user'
import { useExplorerStore } from '@/store/explorer.store'
import { applyExplorerFilters } from '@/lib/explorer-filters'
import ProfileGridCard from './ProfileGridCard'

const FREE_CARD_COUNT = 8

/** En dessous de ce nombre de résultats, on va chercher la page suivante sans
 *  attendre le scroll : avec un filtre actif, une page entière peut ne rien
 *  laisser passer et la grille paraîtrait vide à tort. */
const MIN_VISIBLE_RESULTS = 12

type Props = {
  hasMore: boolean
  loadingMore: boolean
  onLoadMore: () => void
}

export default function GridView({ hasMore, loadingMore, onLoadMore }: Props) {
  const t = useTranslations('dashboard.explorer')
  const { isPremium } = useCurrentUser()
  const allProfiles = useExplorerStore(s => s.profiles)
  const appliedFilters = useExplorerStore(s => s.appliedFilters)
  const total = useExplorerStore(s => s.totalProfiles)
  const profiles = applyExplorerFilters(allProfiles, appliedFilters)
  const sentinelRef = useRef<HTMLDivElement>(null)

  const canLoadMore = hasMore && !loadingMore
  const loadMore = useCallback(() => { if (canLoadMore) onLoadMore() }, [canLoadMore, onLoadMore])

  // Mobile : le scroll suffit. L'observateur reste inoffensif sur desktop,
  // où la sentinelle est masquée et donc jamais intersectée.
  useEffect(() => {
    const el = sentinelRef.current
    if (!el || !canLoadMore) return
    const observer = new IntersectionObserver(
      entries => { if (entries[0].isIntersecting) loadMore() },
      { rootMargin: '400px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [canLoadMore, loadMore])

  // Un filtre peut ne rien retenir d'une page : on continue alors de charger.
  useEffect(() => {
    if (canLoadMore && profiles.length < MIN_VISIBLE_RESULTS) loadMore()
  }, [canLoadMore, loadMore, profiles.length])

  if (profiles.length === 0 && !hasMore && !loadingMore) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 text-center py-20 px-8">
        <Compass className="w-12 h-12 text-gray-200 mx-auto mb-4" />
        <p className="font-semibold text-gray-700 mb-1">{t('empty.title')}</p>
        <p className="text-gray-400 text-sm">
          {t('empty.desc')}
        </p>
      </div>
    )
  }

  return (
    <div className="pb-8">
      <p className="text-xs text-gray-400 text-center mb-4">
        {t('grid.profilesCount', {
          count: appliedFilters.length > 0 ? profiles.length : total,
        })} ·{' '}
        {isPremium
          ? <span className="text-[#10B981] font-medium">{t('grid.allVisible')}</span>
          : t('grid.freeVisible', { count: FREE_CARD_COUNT })
        }
      </p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 stagger-children">
        {profiles.map((profile, i) => (
          <ProfileGridCard
            key={profile.id}
            profile={profile}
            locked={!isPremium && i >= FREE_CARD_COUNT}
            viewerIsPremium={isPremium}
          />
        ))}
      </div>

      {hasMore && (
        <>
          {/* Mobile : scroll infini */}
          <div ref={sentinelRef} className="md:hidden h-12 flex items-center justify-center">
            {loadingMore && <Loader2 className="w-5 h-5 animate-spin text-gray-300" />}
          </div>

          {/* Desktop : chargement à la demande */}
          <div className="hidden md:flex justify-center mt-6">
            <button
              type="button"
              onClick={loadMore}
              disabled={loadingMore}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-700 hover:border-emerald-300 hover:text-emerald-600 transition-colors disabled:opacity-60"
            >
              {loadingMore && <Loader2 className="w-4 h-4 animate-spin" />}
              {t('grid.loadMore')}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
