'use client'

import { Trash2, MapPin, Briefcase } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useTranslations, useLocale } from 'next-intl'
import type { FavoriteEntry } from '@/store/favoris.store'

interface Props {
  entry: FavoriteEntry
  onRemove: (id: string) => void
}

function formatDate(iso: string, locale: string) {
  return new Date(iso).toLocaleDateString(locale === 'en' ? 'en-GB' : 'fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  })
}

function parseLocation(location: string): string {
  if (location.includes('•')) return location.split('•')[0].trim()
  const parts = location.split(' ')
  if (parts[0].length === 2 && parts[0] === parts[0].toUpperCase()) {
    const city = parts.slice(1).join(' ').split(',')[0]
    return `${city}, ${parts[0]}`
  }
  return location
}

export default function FavorisCard({ entry, onRemove }: Props) {
  const router = useRouter()
  const t = useTranslations('dashboard.favoris')
  const locale = useLocale()
  const { profile, addedAt } = entry
  const photo = profile.photos[0] ?? '/avatar-placeholder.svg'

  return (
    <div
      onClick={() => router.push(`/dashboard/profil/${profile.id}`)}
      className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
    >
      {/* Photo */}
      <div className="relative">
        <img
          src={photo}
          alt={profile.firstName}
          className="w-full aspect-square object-cover"
        />
        {/* Delete button */}
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(profile.id) }}
          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white shadow flex items-center justify-center hover:bg-red-50 transition-colors group"
          title={t('removeTitle')}
        >
          <Trash2 className="w-3.5 h-3.5 text-gray-400 group-hover:text-red-500 transition-colors" />
        </button>
      </div>

      {/* Info */}
      <div className="p-3">
        <div className="flex items-baseline gap-1.5 mb-1">
          <span className="font-semibold text-sm text-gray-900">
            {profile.firstName} {profile.lastInitial}.
          </span>
          <span className="text-gray-400 text-xs">{t('yearsOld', { age: profile.age })}</span>
        </div>

        <div className="flex items-center gap-1 text-gray-400 text-xs mb-0.5">
          <MapPin className="w-3 h-3 shrink-0" />
          <span className="truncate">{parseLocation(profile.location)}</span>
        </div>

        <div className="flex items-center gap-1 text-gray-400 text-xs mb-2">
          <Briefcase className="w-3 h-3 shrink-0" />
          <span className="truncate">{profile.job}</span>
        </div>

        <p className="text-gray-300 text-[10px]">{t('addedOn', { date: formatDate(addedAt, locale) })}</p>
      </div>
    </div>
  )
}
