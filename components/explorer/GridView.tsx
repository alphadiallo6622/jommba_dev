'use client'

import { Compass } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useCurrentUser } from '@/lib/use-current-user'
import { useExplorerStore } from '@/store/explorer.store'
import ProfileGridCard from './ProfileGridCard'

const FREE_CARD_COUNT = 8

export default function GridView() {
  const t = useTranslations('dashboard.explorer')
  const { isPremium } = useCurrentUser()
  const profiles = useExplorerStore(s => s.profiles)

  if (profiles.length === 0) {
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
        {t('grid.profilesCount', { count: profiles.length })} ·{' '}
        {isPremium
          ? <span className="text-[#10B981] font-medium">{t('grid.allVisible')}</span>
          : t('grid.freeVisible', { count: FREE_CARD_COUNT })
        }
      </p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {profiles.map((profile, i) => (
          <ProfileGridCard
            key={profile.id}
            profile={profile}
            blurred={(!isPremium && i >= FREE_CARD_COUNT) || profile.photosBlurred}
            viewerIsPremium={isPremium}
          />
        ))}
      </div>
    </div>
  )
}
