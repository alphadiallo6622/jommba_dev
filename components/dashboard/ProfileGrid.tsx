'use client'

import { useState } from 'react'
import { Heart, Crown, MapPin, Briefcase, X, Star } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { mockProfiles } from '@/lib/mock-user'

function scoreColor(score: number) {
  if (score >= 90) return 'bg-emerald-500'
  if (score >= 80) return 'bg-amber-500'
  return 'bg-rose-500'
}

/* ── Desktop grid card ── */
function GridCard({ profile, liked, onLike }: {
  profile: typeof mockProfiles[0]
  liked: boolean
  onLike: () => void
}) {
  const router = useRouter()
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
      <div
        className="relative"
        style={{ aspectRatio: '3/4' }}
        onClick={() => router.push(`/dashboard/profil/${profile.id}`)}
      >
        <img
          src={`https://i.pravatar.cc/400?img=${profile.img}`}
          alt={profile.name}
          className="w-full h-full object-cover"
          draggable={false}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/5 to-transparent pointer-events-none" />

        {profile.isPremium && (
          <div className="absolute top-2 left-2 flex items-center gap-1 bg-amber-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow">
            <Crown className="w-2.5 h-2.5" />
            PREMIUM
          </div>
        )}

        <button
          onClick={(e) => { e.stopPropagation(); onLike() }}
          className={cn(
            'absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center shadow transition-colors',
            liked ? 'bg-emerald-500' : 'bg-white/90 hover:bg-emerald-50'
          )}
        >
          <Star className={cn('w-4 h-4', liked ? 'text-white fill-white' : 'text-gray-400')} />
        </button>

        <div className={cn(
          'absolute bottom-16 right-2 flex items-center gap-1 px-2 py-1 rounded-full shadow',
          scoreColor(profile.score)
        )}>
          <Heart className="w-2.5 h-2.5 text-white fill-white" />
          <span className="text-white text-[10px] font-bold">{profile.score}%</span>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-3 pointer-events-none">
          <p className="text-white font-bold text-base leading-tight">
            {profile.name} <span className="font-normal opacity-90">{profile.age}</span>
          </p>
          <div className="flex items-center gap-1 mt-0.5">
            <MapPin className="w-3 h-3 text-white/70 shrink-0" />
            <span className="text-white/85 text-xs">{profile.city}</span>
          </div>
        </div>
      </div>

      <div className="px-3 py-2 flex items-center gap-1.5">
        <Briefcase className="w-3 h-3 text-gray-400 shrink-0" />
        <span className="text-xs text-gray-500 line-clamp-1">{profile.job}</span>
      </div>
    </div>
  )
}

export default function ProfileGrid() {
  const router = useRouter()
  const [index, setIndex]   = useState(0)
  const [liked, setLiked]   = useState<Set<number>>(new Set())
  const [leaving, setLeaving] = useState<'pass' | 'like' | null>(null)

  const total   = mockProfiles.length
  const profile = mockProfiles[index]

  const advance = (action: 'pass' | 'like') => {
    setLeaving(action)
    setTimeout(() => {
      setIndex(i => i + 1)
      setLeaving(null)
    }, 200)
  }

  const handleLike = (id: number, name: string) => {
    if (!liked.has(id)) {
      setLiked(prev => new Set([...prev, id]))
      toast.success(`Demande envoyée à ${name} ✓`)
    }
  }

  const handlePass = () => advance('pass')

  const handleLikeCarousel = () => {
    if (!profile) return
    handleLike(profile.id, profile.name)
    advance('like')
  }

  return (
    <>
      {/* ── DESKTOP : grille 4 colonnes ── */}
      <div className="hidden md:block bg-white rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center shrink-0">
              <Heart className="w-4 h-4 text-pink-500 fill-pink-500" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 text-sm leading-tight">La sélection Jommba</h2>
              <p className="text-xs text-gray-400">Des profils choisis pour toi</p>
            </div>
          </div>
          <span className="text-xs text-gray-400">{mockProfiles.length} profils</span>
        </div>

        <div className="grid grid-cols-4 gap-3">
          {mockProfiles.map(p => (
            <GridCard
              key={p.id}
              profile={p}
              liked={liked.has(p.id)}
              onLike={() => handleLike(p.id, p.name)}
            />
          ))}
        </div>

        <div className="text-center pt-1">
          <button
            onClick={() => router.push('/dashboard/explorer')}
            className="text-sm font-medium text-emerald-500 hover:text-emerald-600 transition-colors"
          >
            Voir tous les profils →
          </button>
        </div>
      </div>

      {/* ── MOBILE : carousel (inchangé) ── */}
      <div className="md:hidden bg-white rounded-xl p-4 space-y-3">

        {!profile ? (
          <>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center shrink-0">
                <Heart className="w-4 h-4 text-pink-500 fill-pink-500" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900 text-sm">La sélection Jommba</h2>
                <p className="text-xs text-gray-400">Des profils choisis pour toi</p>
              </div>
            </div>
            <div className="text-center py-10 space-y-3">
              <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mx-auto">
                <Heart className="w-7 h-7 text-emerald-400" />
              </div>
              <p className="font-semibold text-gray-800 text-sm">Tu as vu tous les profils !</p>
              <button
                onClick={() => setIndex(0)}
                className="text-sm font-medium text-emerald-500 hover:text-emerald-600 transition-colors"
              >
                Recommencer
              </button>
            </div>
            <div className="text-center">
              <button
                onClick={() => router.push('/dashboard/explorer')}
                className="text-sm font-medium text-emerald-500 hover:text-emerald-600 transition-colors"
              >
                Voir tous les profils →
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center shrink-0">
                  <Heart className="w-4 h-4 text-pink-500 fill-pink-500" />
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900 text-sm leading-tight">La sélection Jommba</h2>
                  <p className="text-xs text-gray-400">Des profils choisis pour toi</p>
                </div>
              </div>
              <span className="text-sm text-gray-400 font-medium tabular-nums">{index + 1}/{total}</span>
            </div>

            <div className="h-[3px] bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-400 rounded-full transition-all duration-300"
                style={{ width: `${((index + 1) / total) * 100}%` }}
              />
            </div>

            <div
              className={cn(
                'relative rounded-2xl overflow-hidden cursor-pointer select-none transition-all duration-200',
                leaving === 'pass' && '-translate-x-4 opacity-0',
                leaving === 'like' && 'translate-x-4 opacity-0',
              )}
              style={{ aspectRatio: '3/4' }}
              onClick={() => router.push(`/dashboard/profil/${profile.id}`)}
            >
              <img
                src={`https://i.pravatar.cc/400?img=${profile.img}`}
                alt={profile.name}
                className="w-full h-full object-cover"
                draggable={false}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/5 to-transparent pointer-events-none" />
              {profile.isPremium && (
                <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-amber-500 text-white text-[11px] font-bold px-3 py-1.5 rounded-full shadow-md">
                  <Crown className="w-3 h-3" />
                  PREMIUM
                </div>
              )}
              <div className={cn(
                'absolute top-3 right-3 flex items-center gap-1 px-3 py-1.5 rounded-full shadow-md',
                scoreColor(profile.score)
              )}>
                <Heart className="w-3 h-3 text-white fill-white" />
                <span className="text-white text-[11px] font-bold">{profile.score}%</span>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-4 space-y-1 pointer-events-none">
                <h3 className="text-white font-bold text-[26px] leading-tight">
                  {profile.name}{' '}
                  <span className="font-normal text-xl opacity-90">{profile.age}</span>
                </h3>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-white/70 shrink-0" />
                  <span className="text-white/85 text-sm">{profile.city}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-white/70 shrink-0" />
                  <span className="text-white/85 text-sm line-clamp-1">{profile.job}</span>
                </div>
              </div>
            </div>

            <div className="flex items-stretch gap-3 pt-1">
              <button
                onClick={handlePass}
                className="flex flex-col items-center justify-center gap-1 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 active:scale-95 transition-all flex-1"
              >
                <X className="w-5 h-5 text-gray-500" />
                <span className="text-[11px] font-semibold text-gray-500">Passer</span>
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleLikeCarousel() }}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 py-2.5 rounded-xl active:scale-95 transition-all flex-1",
                  liked.has(profile.id) ? "bg-emerald-400 hover:bg-emerald-500" : "bg-emerald-500 hover:bg-emerald-600"
                )}
              >
                <Star className="w-5 h-5 text-white fill-white" />
                <span className="text-[11px] font-semibold text-white">
                  {liked.has(profile.id) ? "Déjà liké" : "J'aime"}
                </span>
              </button>
            </div>

            <div className="text-center pb-1">
              <button
                onClick={() => router.push('/dashboard/explorer')}
                className="text-sm font-medium text-emerald-500 hover:text-emerald-600 transition-colors"
              >
                Voir tous les profils →
              </button>
            </div>
          </>
        )}
      </div>
    </>
  )
}