'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import {
  MapPin, Zap, Camera,
  Heart, Users, BookOpen, Home, Globe,
  Star, XCircle, Languages,
} from 'lucide-react'
import { useCurrentUser } from '@/lib/use-current-user'
import { useBoostStore } from '@/store/boost.store'
import { translateProfileValue, translateProfileValueList } from '@/lib/profile-values'
import { localizeStoredCountry } from '@/lib/countries'
import ProfileSection from './ProfileSection'
import ProfileGridSection from './ProfileGridSection'
import PhotoGallery from './PhotoGallery'
import PhotoUpsellBanner from './PhotoUpsellBanner'
import PhotoEditModal from './PhotoEditModal'
import PhotoLightbox from './PhotoLightbox'

export default function MyProfileView() {
  const router    = useRouter()
  const t = useTranslations('dashboard.profil')
  const tv = useTranslations('dashboard.profileValues')
  const locale = useLocale()
  const mockUser  = useCurrentUser()
  const openBoost = useBoostStore(s => s.openBoost)

  const [photoEditOpen, setPhotoEditOpen] = useState(false)
  const [lightboxOpen,  setLightboxOpen]  = useState(false)

  return (
    <div className="max-w-lg mx-auto px-4 py-4 pb-24 relative">

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-[#064E3B]">{t('my.title')}</h1>
        <button
          onClick={() => router.push('/dashboard/parametres')}
          className="text-[#10B981] text-sm font-medium px-3 py-1.5 border border-[#10B981] rounded-lg hover:bg-green-50 transition-colors"
        >
          {t('my.edit')}
        </button>
      </div>

      {/* Photo zone — clickable lightbox */}
      <div
        className="relative mb-4 cursor-pointer"
        onClick={() => setLightboxOpen(true)}
      >
        <img
          src={mockUser.avatar}
          alt={mockUser.firstName}
          className="w-full h-72 object-cover rounded-xl"
        />
        <div className="absolute inset-0 bg-transparent hover:bg-black/10 rounded-xl transition-colors" />
      </div>

      <PhotoGallery
        photo={mockUser.avatar}
        isPremium={mockUser.isPremium}
        onMainPhotoClick={() => setLightboxOpen(true)}
        onAddPhoto={() => setPhotoEditOpen(true)}
      />
      <PhotoUpsellBanner />

      {/* Name + info */}
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-1">
          {t('my.nameLine', { name: mockUser.firstName, age: mockUser.age, height: mockUser.height })}
        </h2>
        <p className="text-gray-500 text-sm flex items-center gap-1 mb-3">
          <MapPin className="w-3.5 h-3.5" />
          {[mockUser.city, localizeStoredCountry(mockUser.country, locale)].filter(Boolean).join(', ')}
        </p>
        <div className="flex gap-2 flex-wrap">
          {/* tags = [situation, métier, études] — situation et études sont des valeurs canoniques. */}
          {mockUser.tags.map(tag => (
            <span key={tag} className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">
              {translateProfileValue(tag, tv)}
            </span>
          ))}
        </div>
      </div>

      {/* Action buttons */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <button
          onClick={() => setPhotoEditOpen(true)}
          className="flex items-center justify-center gap-2 py-3 bg-gray-100 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors"
        >
          <Camera className="w-4 h-4" /> {t('my.editImages')}
        </button>
        <button
          onClick={openBoost}
          className="flex items-center justify-center gap-2 py-3 bg-amber-500 text-white rounded-xl text-sm font-semibold hover:bg-amber-600 transition-colors"
        >
          <Zap className="w-4 h-4" /> {t('my.boost')}
        </button>
      </div>

      {/* Content sections */}
      <div className="space-y-3">
        <ProfileSection
          icon={Heart} iconColor="text-pink-500" iconBg="bg-pink-50"
          title={t('sections.marriageVision')}
          text={translateProfileValueList(mockUser.marriageVision, tv)}
        />
        <ProfileSection
          icon={Users} iconColor="text-green-600" iconBg="bg-green-50"
          title={t('sections.seeking')}
          text={translateProfileValueList(mockUser.seeking, tv)}
        />
        <ProfileGridSection
          icon={BookOpen} iconColor="text-blue-500" iconBg="bg-blue-50"
          title={t('sections.religion')}
          fields={[
            { label: t('fields.madhhab'), value: translateProfileValue(mockUser.religion.madhhab, tv) },
            { label: t('fields.mosque'),  value: translateProfileValue(mockUser.religion.mosque, tv)  },
            { label: t('fields.arabic'),  value: translateProfileValue(mockUser.religion.arabic, tv)  },
          ]}
        />
        <ProfileGridSection
          icon={Home} iconColor="text-amber-500" iconBg="bg-amber-50"
          title={t('sections.lifeProject')}
          fields={[
            { label: t('fields.hasChildren'),   value: translateProfileValue(mockUser.lifeProject.hasChildren, tv)   },
            { label: t('fields.wantsChildren'), value: translateProfileValue(mockUser.lifeProject.wantsChildren, tv) },
            { label: t('fields.canRelocate'),   value: translateProfileValue(mockUser.lifeProject.canRelocate, tv)   },
            { label: t('fields.polygamy'),      value: translateProfileValue(mockUser.lifeProject.polygamy, tv)      },
          ]}
        />
        <ProfileSection
          icon={Globe} iconColor="text-teal-500" iconBg="bg-teal-50"
          title={t('sections.interests')}
          text={mockUser.interests}
        />
        <ProfileSection
          icon={Star} iconColor="text-yellow-500" iconBg="bg-yellow-50"
          title={t('sections.qualities')}
          text={mockUser.qualities}
        />
        <ProfileSection
          icon={XCircle} iconColor="text-red-500" iconBg="bg-red-50"
          title={t('sections.dealbreakers')}
          text={mockUser.dealbreakers}
        />
        <ProfileSection
          icon={Languages} iconColor="text-violet-500" iconBg="bg-violet-50"
          title={t('sections.languages')}
          text={mockUser.languages}
        />
      </div>

      {/* Modals */}
      <PhotoEditModal open={photoEditOpen} onClose={() => setPhotoEditOpen(false)} />
      <PhotoLightbox  open={lightboxOpen}  onClose={() => setLightboxOpen(false)}  photo={mockUser.avatar} />
    </div>
  )
}
