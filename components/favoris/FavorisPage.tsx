'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Heart, Users, HeartOff, Lock, Clock, Crown, MapPin, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/providers/AuthProvider'
import { useCurrentUser } from '@/lib/use-current-user'
import { supabaseProfileToExplorer } from '@/lib/supabase/profile-service'
import type { FavoriteEntry } from '@/store/favoris.store'
import { formatHoursAgo } from '@/lib/format-time-ago'
import FavorisCard from './FavorisCard'

type QuiMAimeEntry = {
  id: string
  photo: string
  firstName: string
  lastInitial: string
  age: number
  location: string
  hoursAgo: number
}

type Tab = 'mes-favoris' | 'qui-maime'

type ProfileRow = {
  user_id: string
  first_name: string
  last_name: string | null
  age: number | null
  avatar_url: string | null
  city: string | null
  country: string | null
  marital_status: string | null
  job: string | null
  education: string | null
  is_premium: boolean
  marriage_vision: string | null
  seeking: string | null
  interests: string | null
  qualities: string | null
  has_children: string | null
  wants_children: string | null
  can_relocate: string | null
  polygamy: string | null
  madhhab: string | null
  mosque_frequency: string | null
  arabic_level: string | null
  dealbreakers: string | null
  languages: string | null
}

export default function FavorisPage() {
  const router = useRouter()
  const t = useTranslations('dashboard.favoris')
  const { user } = useAuth()
  const { isPremium } = useCurrentUser()
  const [activeTab, setActiveTab] = useState<Tab>('mes-favoris')
  const [mesFavoris, setMesFavoris] = useState<FavoriteEntry[]>([])
  const [quiMAime, setQuiMAime]     = useState<QuiMAimeEntry[]>([])
  const [loading, setLoading]       = useState(true)

  const fetchData = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const supabase = createClient()

      const [{ data: sent }, { data: received }] = await Promise.all([
        supabase.from('likes').select('receiver_id, created_at').eq('sender_id', user.id).eq('type', 'favorite').order('created_at', { ascending: false }),
        supabase.from('likes').select('sender_id, created_at').eq('receiver_id', user.id).eq('type', 'favorite').order('created_at', { ascending: false }),
      ])

      const sentIds     = (sent     ?? []).map((l: { receiver_id: string }) => l.receiver_id)
      const receivedIds = (received ?? []).map((l: { sender_id: string }) => l.sender_id)
      const allIds = [...new Set([...sentIds, ...receivedIds])]

      const profileMap = new Map<string, ProfileRow>()
      if (allIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('*')
          .in('user_id', allIds)
        for (const p of (profiles ?? []) as ProfileRow[]) profileMap.set(p.user_id, p)
      }

      const sentTimeMap = new Map<string, string>()
      for (const l of (sent ?? []) as { receiver_id: string; created_at: string }[]) {
        if (!sentTimeMap.has(l.receiver_id)) sentTimeMap.set(l.receiver_id, l.created_at)
      }
      const receivedTimeMap = new Map<string, string>()
      for (const l of (received ?? []) as { sender_id: string; created_at: string }[]) {
        if (!receivedTimeMap.has(l.sender_id)) receivedTimeMap.set(l.sender_id, l.created_at)
      }

      setMesFavoris(
        sentIds.map(id => {
          const p = profileMap.get(id)
          const explorerProfile = p
            ? supabaseProfileToExplorer(p as unknown as Parameters<typeof supabaseProfileToExplorer>[0])
            : {
                id,
                firstName: '…', lastInitial: '?', age: 0,
                location: t('unknown'), maritalStatus: '', job: '',
                photos: ['/avatar-placeholder.svg'],
                isEnAvant: false, photosBlurred: false,
                marriageVision: '', ceQueJeRecherche: '',
                centresInteret: '', mesQualites: '',
                info: { madhhab: '', education: '', enfants: '', souhaitEnfants: '', peutDemenager: '', polygamie: '' },
              }
          return { profile: explorerProfile, addedAt: sentTimeMap.get(id) ?? new Date().toISOString() }
        })
      )

      setQuiMAime(
        receivedIds.map(id => {
          const p   = profileMap.get(id)
          const hrs = Math.floor((Date.now() - new Date(receivedTimeMap.get(id) ?? new Date().toISOString()).getTime()) / 3_600_000)
          return {
            id,
            photo:       p?.avatar_url ?? '/avatar-placeholder.svg',
            firstName:   p?.first_name ?? '…',
            lastInitial: (p?.last_name ?? '').charAt(0),
            age:         p?.age ?? 0,
            location:    [p?.city, p?.country].filter(Boolean).join(', ') || t('unknown'),
            hoursAgo:    hrs,
          }
        })
      )
    } catch (err) {
      console.error('[FavorisPage] fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [user, t])

  useEffect(() => { fetchData() }, [fetchData])

  const handleRemoveFavorite = async (id: string) => {
    if (!user) return
    setMesFavoris(prev => prev.filter(f => f.profile.id !== id))
    const supabase = createClient()
    await supabase.from('likes')
      .delete()
      .eq('sender_id', user.id)
      .eq('receiver_id', id)
      .eq('type', 'favorite')
    toast.success(t('removed'))
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-emerald-900 flex items-center gap-2">
          {t('title')}
          <Heart className="w-6 h-6 text-emerald-500" />
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          {t('subtitle')}
        </p>
      </div>

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
          {loading ? t('myFavoritesLoading') : t('myFavorites', { count: mesFavoris.length })}
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
          {loading ? t('whoLikesMeLoading') : t('whoLikesMe', { count: quiMAime.length })}
        </button>
      </div>

      {loading && (
        <div className="flex justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
        </div>
      )}

      {/* === MES FAVORIS === */}
      {!loading && activeTab === 'mes-favoris' && (
        mesFavoris.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {mesFavoris.map((entry) => (
              <FavorisCard
                key={entry.profile.id}
                entry={entry}
                onRemove={handleRemoveFavorite}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 text-center py-16 px-8">
            <HeartOff className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <p className="font-semibold text-gray-700 mb-1">{t('emptyTitle')}</p>
            <p className="text-gray-400 text-sm mb-6">
              {t('emptyDesc')}
            </p>
            <button
              onClick={() => router.push('/dashboard/explorer')}
              className="bg-emerald-500 text-white font-semibold px-6 py-2.5 rounded-xl hover:bg-emerald-600 transition-colors"
            >
              {t('discoverProfiles')}
            </button>
          </div>
        )
      )}

      {/* === QUI M'AIME === */}
      {!loading && activeTab === 'qui-maime' && (
        <>
          {!isPremium && quiMAime.length > 0 && (
            <div className="bg-amber-600 rounded-2xl p-8 text-center mb-6">
              <Lock className="w-12 h-12 text-white mx-auto mb-4" />
              <h2 className="text-white font-bold text-xl mb-3">
                {t('unlockTitle')}
              </h2>
              <p className="text-white/90 text-sm mb-6">
                {t('unlockDesc', { count: quiMAime.length })}
              </p>
              <button
                onClick={() => router.push('/dashboard/premium')}
                className="bg-white text-amber-600 font-semibold px-6 py-3 rounded-xl flex items-center gap-2 mx-auto hover:bg-gray-50 transition-colors"
              >
                <Crown className="w-4 h-4" />
                {t('unlockCta')}
              </button>
            </div>
          )}

          {quiMAime.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {quiMAime.map((person) => (
                <div
                  key={person.id}
                  className={`bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm${isPremium ? ' cursor-pointer hover:shadow-md transition-shadow' : ''}`}
                  onClick={isPremium ? () => router.push(`/dashboard/profil/${person.id}`) : undefined}
                >
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
                      {formatHoursAgo(person.hoursAgo, t)}
                    </span>
                  </div>

                  <div className="p-3">
                    {isPremium ? (
                      <>
                        <div className="flex items-baseline gap-1.5 mb-1">
                          <span className="font-semibold text-sm text-gray-900">{person.firstName} {person.lastInitial}.</span>
                          <span className="text-gray-400 text-xs">{t('yearsOld', { age: person.age })}</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-400 text-xs mb-2">
                          <MapPin className="w-3 h-3" /> {person.location}
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); router.push(`/dashboard/profil/${person.id}`) }}
                          className="w-full bg-emerald-500 text-white text-sm font-medium py-2 rounded-lg flex items-center justify-center gap-1 hover:bg-emerald-600 transition-colors"
                        >
                          {t('viewProfile')}
                        </button>
                      </>
                    ) : (
                      <>
                        <p className="text-gray-300 text-sm font-medium blur-sm select-none">{t('nameHidden')}</p>
                        <p className="text-gray-200 text-xs blur-sm select-none mt-1">{t('cityCountry')}</p>
                        <button
                          onClick={() => router.push('/dashboard/premium')}
                          className="w-full mt-3 bg-amber-100 text-amber-600 text-sm font-medium py-2 rounded-lg flex items-center justify-center gap-1 hover:bg-amber-200 transition-colors"
                        >
                          <Crown className="w-3 h-3" /> {t('unlock')}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 text-center py-16 px-8">
              <Heart className="w-12 h-12 text-gray-200 mx-auto mb-4" />
              <p className="font-semibold text-gray-700 mb-1">{t('noLikesTitle')}</p>
              <p className="text-gray-400 text-sm">{t('noLikesDesc')}</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
