'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft, Camera, Crown, MoreHorizontal, MapPin, Plus,
  Bot, Lightbulb, Heart, Users, BookOpen, Home, Globe,
  Star, AlertCircle, XCircle, Languages,
} from 'lucide-react'
import { toast } from 'sonner'
import { mockProfiles } from '@/lib/mock-demandes'
import { useCurrentUser } from '@/lib/use-current-user'
import ProfileSection from './ProfileSection'
import ProfileGridSection from './ProfileGridSection'
import PhotoGallery from './PhotoGallery'
import PhotoUpsellBanner from './PhotoUpsellBanner'
import MyProfileView from './MyProfileView'

type Props = { id: string }

export default function ProfilePage({ id }: Props) {
  const router  = useRouter()
  const { id: currentUserId } = useCurrentUser()
  const profile = mockProfiles[id]
  const [menuOpen, setMenuOpen] = useState(false)

  const isMyProfile = id === currentUserId

  if (isMyProfile) {
    return <MyProfileView />
  }

  if (!profile) {
    return (
      <div className="max-w-lg mx-auto px-4 py-12 text-center">
        <p className="text-gray-400">Profil introuvable.</p>
        <button onClick={() => router.back()} className="mt-4 text-[#10B981] text-sm font-medium">
          ← Retour
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-4 pb-24 relative">

      {/* Back link */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-gray-500 text-sm mb-4 hover:text-gray-700 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour aux profils
      </button>

      {/* Photo zone */}
      <div className="relative mb-4">
        <img
          src={profile.photo}
          alt={profile.firstName}
          className={`w-full h-72 object-cover rounded-xl ${profile.isPhotoBlurred ? 'blur-sm scale-105' : ''}`}
        />
        {profile.isPhotoBlurred && (
          <span className="absolute top-3 right-12 bg-gray-800/70 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
            <Camera className="w-3 h-3" /> Photo floutée
          </span>
        )}
        {profile.isPremium && (
          <span className="absolute bottom-3 left-3 bg-[#D97706] text-white text-xs px-3 py-1 rounded-full font-semibold flex items-center gap-1">
            <Crown className="w-3 h-3" /> PREMIUM
          </span>
        )}

        {/* 3-dot menu */}
        <div className="absolute bottom-3 right-3">
          <button
            onClick={() => setMenuOpen(v => !v)}
            className="w-8 h-8 rounded-full bg-white/80 flex items-center justify-center"
          >
            <MoreHorizontal className="w-4 h-4 text-gray-600" />
          </button>
          {menuOpen && (
            <div className="absolute bottom-10 right-0 bg-white rounded-xl shadow-lg border border-gray-100 py-1 min-w-[140px] z-10">
              <button
                onClick={() => { setMenuOpen(false); toast.info('Profil bloqué') }}
                className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
              >
                Bloquer
              </button>
              <button
                onClick={() => { setMenuOpen(false); toast.info('Signalement envoyé') }}
                className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-gray-50"
              >
                Signaler
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Photo gallery */}
      <PhotoGallery photo={profile.photo} />
      <PhotoUpsellBanner />

      {/* Name + info */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          {profile.firstName}, {profile.age}
        </h1>
        <p className="text-gray-500 text-sm flex items-center gap-1 mb-3">
          <MapPin className="w-3.5 h-3.5" /> {profile.location}
        </p>
        <div className="flex gap-2 flex-wrap">
          {profile.tags.map(tag => (
            <span key={tag} className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Status banner */}
      <RequestStatusBanner status={profile.requestStatus} />

      {/* Incoming demande: accept / refuse buttons */}
      {profile.requestStatus === 'incoming' && (
        <div className="grid grid-cols-2 gap-2 mb-3">
          <button
            onClick={() => { toast.success('Demande acceptée ✓'); router.push(`/dashboard/messages/${id}`) }}
            className="py-3 bg-[#10B981] text-white text-sm font-semibold rounded-lg hover:bg-[#059669] transition-colors"
          >
            Accepter ✓
          </button>
          <button
            onClick={() => { toast.error('Demande refusée'); router.back() }}
            className="py-3 bg-gray-100 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
          >
            Refuser
          </button>
        </div>
      )}

      {/* Match IA + Idées */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <button
          onClick={() => toast('Fonctionnalité bientôt disponible')}
          className="flex items-center justify-center gap-2 py-3 bg-[#E1F5EE] text-[#10B981] rounded-xl text-sm font-medium hover:bg-green-100 transition-colors"
        >
          <Bot className="w-4 h-4" /> Match IA
        </button>
        <button
          onClick={() => toast('Fonctionnalité bientôt disponible')}
          className="flex items-center justify-center gap-2 py-3 bg-[#E1F5EE] text-[#10B981] rounded-xl text-sm font-medium hover:bg-green-100 transition-colors"
        >
          <Lightbulb className="w-4 h-4" /> Idées de message
        </button>
      </div>

      {/* Content sections */}
      <div className="space-y-3">
        <ProfileSection
          icon={Heart}
          iconColor="text-pink-500"
          iconBg="bg-pink-50"
          title="Ma vision du mariage"
          text={profile.marriageVision}
        />
        <ProfileSection
          icon={Users}
          iconColor="text-green-600"
          iconBg="bg-green-50"
          title="Ce que je recherche"
          text={profile.seeking}
        />
        <ProfileGridSection
          icon={BookOpen}
          iconColor="text-blue-500"
          iconBg="bg-blue-50"
          title="Pratique religieuse"
          fields={[
            { label: 'MADHHAB', value: profile.religion.madhhab  },
            { label: 'MOSQUÉE', value: profile.religion.mosque   },
            { label: 'ARABE',   value: profile.religion.arabic   },
          ]}
        />
        <ProfileGridSection
          icon={Home}
          iconColor="text-amber-500"
          iconBg="bg-amber-50"
          title="Projet de vie"
          fields={[
            { label: 'A DES ENFANTS',        value: profile.lifeProject.hasChildren   },
            { label: 'SOUHAITE DES ENFANTS', value: profile.lifeProject.wantsChildren },
            { label: 'DÉMÉNAGER',            value: profile.lifeProject.canRelocate   },
            { label: 'POLYGAMIE',            value: profile.lifeProject.polygamy      },
          ]}
        />
        <ProfileSection
          icon={Globe}
          iconColor="text-teal-500"
          iconBg="bg-teal-50"
          title="Centres d'intérêt"
          text={profile.interests}
        />
        <ProfileSection
          icon={Star}
          iconColor="text-yellow-500"
          iconBg="bg-yellow-50"
          title="Mes qualités"
          text={profile.qualities}
        />
        {profile.flaws && (
          <ProfileSection
            icon={AlertCircle}
            iconColor="text-orange-500"
            iconBg="bg-orange-50"
            title="Mes défauts"
            text={profile.flaws}
          />
        )}
        <ProfileSection
          icon={XCircle}
          iconColor="text-red-500"
          iconBg="bg-red-50"
          title="Ce que je n'accepte pas"
          text={profile.dealbreakers}
        />
        <ProfileSection
          icon={Languages}
          iconColor="text-violet-500"
          iconBg="bg-violet-50"
          title="Langues parlées"
          text={profile.languages}
        />
      </div>

    </div>
  )
}

function RequestStatusBanner({ status }: { status: string }) {
  if (status === 'incoming') return (
    <div className="w-full py-3 bg-pink-50 text-pink-600 text-center text-sm font-medium rounded-lg mb-3 flex items-center justify-center gap-1.5">
      <Heart className="w-4 h-4 fill-current" /> Cette personne souhaite te contacter
    </div>
  )
  if (status === 'refusee') return (
    <div className="w-full py-3 bg-red-50 text-red-500 text-center text-sm font-medium rounded-lg mb-3">
      Demande refusée
    </div>
  )
  if (status === 'en-attente') return (
    <div className="w-full py-3 bg-amber-50 text-amber-600 text-center text-sm font-medium rounded-lg mb-3">
      Demande envoyée — En attente
    </div>
  )
  if (status === 'acceptee') return (
    <div className="w-full py-3 bg-[#E1F5EE] text-[#10B981] text-center text-sm font-medium rounded-lg mb-3">
      ✓ Contact accepté
    </div>
  )
  return (
    <button className="w-full py-3 bg-[#10B981] text-white text-sm font-semibold rounded-lg mb-3 flex items-center justify-center gap-2 hover:bg-[#059669] transition-colors">
      <Plus className="w-4 h-4" /> Ajouter
    </button>
  )
}
