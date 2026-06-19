'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Heart, Users, HeartOff, Lock, Clock, Crown, MapPin } from 'lucide-react'
import { useFavorisStore } from '@/store/favoris.store'
import { useCurrentUser } from '@/lib/use-current-user'
import FavorisCard from './FavorisCard'

const QUI_M_AIME = [
  { id: 101, photo: 'https://i.pravatar.cc/300?img=11', firstName: 'Aminata', lastInitial: 'S', age: 26, location: 'Dakar, SN', job: 'Comptable',  hoursAgo: 3  },
  { id: 102, photo: 'https://i.pravatar.cc/300?img=15', firstName: 'Rokhaya', lastInitial: 'D', age: 29, location: 'Thiès, SN',  job: 'Infirmière', hoursAgo: 8  },
  { id: 103, photo: 'https://i.pravatar.cc/300?img=22', firstName: 'Coumba',  lastInitial: 'B', age: 24, location: 'Dakar, SN', job: 'Étudiante',  hoursAgo: 14 },
]

type Tab = 'mes-favoris' | 'qui-maime'

export default function FavorisPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<Tab>('mes-favoris')
  const { favorites, removeFavorite } = useFavorisStore()
  const { isPremium } = useCurrentUser()

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-emerald-900 flex items-center gap-2">
          Favoris
          <Heart className="w-6 h-6 text-emerald-500" />
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Tes coups de cœur et ceux qui t&apos;ont remarqué
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('mes-favoris')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-colors border ${
            activeTab === 'mes-favoris'
              ? 'bg-white border-gray-200 text-gray-900 shadow-sm'
              : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          <Heart className="w-4 h-4" />
          Mes favoris ({favorites.length})
        </button>

        <button
          onClick={() => setActiveTab('qui-maime')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-colors border ${
            activeTab === 'qui-maime'
              ? 'bg-white border-gray-200 text-gray-900 shadow-sm'
              : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          <Users className="w-4 h-4" />
          Qui m&apos;aime ({QUI_M_AIME.length})
        </button>
      </div>

      {/* === MES FAVORIS === */}
      {activeTab === 'mes-favoris' && (
        favorites.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {favorites.map((entry) => (
              <FavorisCard
                key={entry.profile.id}
                entry={entry}
                onRemove={removeFavorite}
              />
            ))}
          </div>
        ) : (
          /* Empty state */
          <div className="bg-white rounded-2xl border border-gray-100 text-center py-16 px-8">
            <HeartOff className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <p className="font-semibold text-gray-700 mb-1">Aucun favori pour l&apos;instant</p>
            <p className="text-gray-400 text-sm mb-6">
              Explore les profils et ajoute tes coups de cœur en favoris
            </p>
            <button
              onClick={() => router.push('/dashboard/explorer')}
              className="bg-emerald-500 text-white font-semibold px-6 py-2.5 rounded-xl hover:bg-emerald-600 transition-colors"
            >
              Découvrir des profils
            </button>
          </div>
        )
      )}

      {/* === QUI M'AIME === */}
      {activeTab === 'qui-maime' && (
        <>
          {!isPremium && (
            <div className="bg-amber-600 rounded-2xl p-8 text-center mb-6">
              <div className="flex justify-center mb-4">
                <Lock className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-white font-bold text-xl mb-3">
                Vois qui a un coup de cœur pour toi
              </h2>
              <p className="text-white/90 text-sm mb-6">
                {QUI_M_AIME.length} personnes t&apos;ont mis en favori.<br />
                Passe Premium pour les découvrir !
              </p>
              <button
                onClick={() => router.push('/dashboard/premium')}
                className="bg-white text-amber-600 font-semibold px-6 py-3 rounded-xl flex items-center gap-2 mx-auto hover:bg-gray-50 transition-colors"
              >
                <Crown className="w-4 h-4" />
                Débloquer les favoris →
              </button>
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {QUI_M_AIME.map((person) => (
              <div key={person.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
                <div className="relative">
                  <img
                    src={person.photo}
                    alt=""
                    className={`w-full aspect-square object-cover ${!isPremium ? 'blur-md scale-110' : ''}`}
                  />
                  {!isPremium && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                      <Lock className="w-7 h-7 text-white drop-shadow-lg" />
                    </div>
                  )}
                  <span className="absolute top-2 right-2 bg-emerald-900 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Il y a {person.hoursAgo}h
                  </span>
                </div>

                <div className="p-3">
                  {isPremium ? (
                    <>
                      <div className="flex items-baseline gap-1.5 mb-1">
                        <span className="font-semibold text-sm text-gray-900">
                          {person.firstName} {person.lastInitial}.
                        </span>
                        <span className="text-gray-400 text-xs">{person.age} ans</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-400 text-xs mb-2">
                        <MapPin className="w-3 h-3" />
                        {person.location}
                      </div>
                      <button
                        onClick={() => router.push(`/dashboard/profil/${person.id}`)}
                        className="w-full bg-emerald-500 text-white text-sm font-medium py-2 rounded-lg flex items-center justify-center gap-1 hover:bg-emerald-600 transition-colors"
                      >
                        Voir le profil →
                      </button>
                    </>
                  ) : (
                    <>
                      <p className="text-gray-300 text-sm font-medium blur-sm select-none">Nom masqué</p>
                      <p className="text-gray-200 text-xs blur-sm select-none mt-1">• Ville, Pays</p>
                      <button
                        onClick={() => router.push('/dashboard/premium')}
                        className="w-full mt-3 bg-amber-100 text-amber-600 text-sm font-medium py-2 rounded-lg flex items-center justify-center gap-1 hover:bg-amber-200 transition-colors"
                      >
                        <Crown className="w-3 h-3" />
                        Débloquer ce profil
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

    </div>
  )
}
