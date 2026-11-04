'use client'

import { useState, useEffect, useRef } from 'react'
import { Heart, Crown, MapPin, Briefcase, X, BadgeCheck } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import {
  AnimatePresence, motion, useMotionValue, useReducedMotion, useTransform,
  type Variants,
} from 'framer-motion'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { fetchBlockedIds } from '@/lib/supabase/moderation-service'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/providers/AuthProvider'
import { useCurrentUser } from '@/lib/use-current-user'
import { sendContactRequest } from '@/lib/supabase/likes-service'
import { notifyByEmail } from '@/lib/notify-email'
import { useIsOnline } from '@/components/providers/PresenceProvider'
import { oppositeGender } from '@/lib/gender'
import { MIN_VISIBLE_PROFILE_COMPLETION } from '@/lib/constants'

type GridProfile = {
  id: string
  name: string
  age: number
  city: string
  job: string
  score: number
  photo: string
  isPremium: boolean
  photoBlurred: boolean
}

function scoreColor(score: number) {
  if (score >= 90) return 'bg-emerald-500'
  if (score >= 80) return 'bg-amber-500'
  return 'bg-rose-500'
}

/** Sens du départ de la carte : « j'aime » sort à droite, « passer » à gauche. */
type SwipeAction = 'pass' | 'like'

/** Déplacement horizontal, en pixels, au-delà duquel le lâcher vaut décision. */
const SWIPE_DISTANCE = 110
/** Un geste bref mais vif décide aussi, même sous la distance : c'est le
 *  « flick » qu'on attend d'une pile de cartes. */
const SWIPE_VELOCITY = 520
/** Amplitude sur laquelle le tampon passe de transparent à pleinement visible. */
const STAMP_RANGE = 120

/** Carte du carrousel : elle entre par en dessous puis, à la décision, part
 *  sur le côté en pivotant. Le départ est joué soit par les boutons, soit par
 *  le geste de l'utilisateur. */
const CARD_VARIANTS: Variants = {
  enter: { opacity: 0, scale: 0.92, y: 24 },
  center: {
    opacity: 1,
    scale: 1,
    y: 0,
    x: 0,
    rotate: 0,
    transition: { duration: 0.42, ease: [0.16, 1, 0.3, 1] },
  },
  exit: (direction: SwipeAction) => ({
    // Distance en pixels et non en pourcentage : `x` est ici une motion value
    // pilotée par le geste, qui ne sait pas se résoudre contre la largeur du
    // parent en cours d'animation.
    x: direction === 'like' ? 620 : -620,
    rotate: direction === 'like' ? 16 : -16,
    opacity: 0,
    transition: { duration: 0.34, ease: [0.4, 0, 0.2, 1] },
  }),
}

/** Variante sans déplacement, pour `prefers-reduced-motion`. */
const CARD_VARIANTS_REDUCED: Variants = {
  enter:  { opacity: 0 },
  center: { opacity: 1, transition: { duration: 0.15 } },
  exit:   { opacity: 0, transition: { duration: 0.15 } },
}

/** Tampon « J'aime » / « Passer », incliné par-dessus la photo. */
function Stamp({ action, label }: { action: SwipeAction; label: string }) {
  return (
    <span
      className={cn(
        'flex items-center gap-2 rounded-2xl border-4 px-5 py-2.5 text-xl font-black uppercase tracking-wide backdrop-blur-sm',
        action === 'like'
          ? 'border-emerald-400 bg-emerald-500/25 text-white'
          : 'border-gray-300 bg-gray-700/35 text-white',
      )}
      style={{ transform: `rotate(${action === 'like' ? -12 : 12}deg)` }}
    >
      {action === 'like' ? <Heart className="w-6 h-6 fill-current" /> : <X className="w-6 h-6" />}
      {label}
    </span>
  )
}

/**
 * Carte déplaçable du carrousel.
 *
 * Chaque carte possède sa propre `motion value` horizontale — d'où un
 * composant à part plutôt qu'un bloc en ligne : la carte qui s'en va garde la
 * position atteinte par le doigt, celle qui arrive repart de zéro.
 *
 * Rotation et opacité des tampons sont dérivées de cette valeur : elles
 * suivent le doigt sans repasser par l'état React, donc sans re-rendu à
 * chaque frame.
 */
function SwipeCard({
  profile,
  direction,
  reduceMotion,
  onOpen,
  onSwipe,
  labels,
}: {
  profile: GridProfile
  direction: SwipeAction
  reduceMotion: boolean
  onOpen: () => void
  onSwipe: (action: SwipeAction) => void
  labels: { like: string; pass: string }
}) {
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-240, 0, 240], [-16, 0, 16])
  const likeOpacity = useTransform(x, [20, STAMP_RANGE], [0, 1])
  const passOpacity = useTransform(x, [-20, -STAMP_RANGE], [0, 1])

  // Un geste ne doit pas ouvrir le profil au relâchement. Remis à zéro à
  // chaque appui : sans cela, un glissement sans clic condamnerait le tap
  // suivant.
  const dragged = useRef(false)

  return (
    <motion.div
      custom={direction}
      variants={reduceMotion ? CARD_VARIANTS_REDUCED : CARD_VARIANTS}
      initial="enter"
      animate="center"
      exit="exit"
      style={{ x, rotate }}
      drag="x"
      // Contraintes nulles + élasticité : la carte suit le doigt puis revient
      // d'elle-même au centre si la décision n'est pas franche.
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.7}
      dragMomentum={false}
      whileDrag={{ cursor: 'grabbing' }}
      onPointerDown={() => { dragged.current = false }}
      onDragStart={() => { dragged.current = true }}
      onDragEnd={(_, info) => {
        const far  = Math.abs(info.offset.x) > SWIPE_DISTANCE
        const fast = Math.abs(info.velocity.x) > SWIPE_VELOCITY
        if (far || fast) onSwipe(info.offset.x > 0 ? 'like' : 'pass')
      }}
      onClick={() => { if (!dragged.current) onOpen() }}
      className="absolute inset-0 rounded-2xl overflow-hidden cursor-grab select-none active:cursor-grabbing"
    >
      <img
        src={profile.photo}
        alt={profile.name}
        className={cn('w-full h-full object-cover', profile.photoBlurred && 'blur-md scale-105')}
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

      {/* Tampons pilotés par le geste : ils se révèlent à mesure que la carte
          s'écarte, et disparaissent si elle revient au centre. */}
      <motion.div
        aria-hidden="true"
        style={{ opacity: likeOpacity }}
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
      >
        <Stamp action="like" label={labels.like} />
      </motion.div>
      <motion.div
        aria-hidden="true"
        style={{ opacity: passOpacity }}
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
      >
        <Stamp action="pass" label={labels.pass} />
      </motion.div>

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
    </motion.div>
  )
}

function GridCard({ profile, liked, onLike, viewerIsPremium }: {
  profile: GridProfile
  liked: boolean
  onLike: () => void
  viewerIsPremium: boolean
}) {
  const router = useRouter()
  const t = useTranslations('dashboard.grid')
  const isOnline = useIsOnline(profile.id)
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-1 active:scale-[0.98] transition-[translate,scale,box-shadow] duration-300 ease-soft active:duration-75 cursor-pointer group">
      <div
        className="relative overflow-hidden"
        style={{ aspectRatio: '3/4' }}
        onClick={() => router.push(`/dashboard/profil/${profile.id}`)}
      >
        <img
          src={profile.photo}
          alt={profile.name}
          className={cn(
            'w-full h-full object-cover transition-transform duration-500 ease-soft',
            profile.photoBlurred ? 'blur-md scale-105' : 'group-hover:scale-[1.03]',
          )}
          draggable={false}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/5 to-transparent pointer-events-none" />

        {profile.isPremium && (
          <div className="absolute top-2 left-2 flex items-center gap-1 bg-amber-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow">
            <Crown className="w-2.5 h-2.5" />
            PREMIUM
          </div>
        )}

        {viewerIsPremium && isOnline && (
          <div className="absolute top-2 right-11 flex items-center gap-1 bg-white/90 text-emerald-600 text-[10px] font-bold px-2 py-1 rounded-full shadow">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            {t('online')}
          </div>
        )}

        <button
          onClick={(e) => { e.stopPropagation(); onLike() }}
          className={cn(
            'absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center shadow transition-[background-color,scale] duration-150 hover:scale-110 active:scale-90',
            liked ? 'bg-emerald-500' : 'bg-white/90 hover:bg-emerald-50'
          )}
        >
          {/* key : le cœur remonte au passage en « liké » → pulse de confirmation */}
          <Heart
            key={liked ? 'liked' : 'idle'}
            className={cn('w-4 h-4', liked ? 'text-white fill-white animate-pop' : 'text-gray-400')}
          />
        </button>

        <div className={cn(
          'absolute bottom-16 right-2 flex items-center gap-1 px-2 py-1 rounded-full shadow',
          scoreColor(profile.score)
        )}>
          <Heart className="w-2.5 h-2.5 text-white fill-white" />
          <span className="text-white text-[10px] font-bold">{profile.score}%</span>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-3 pointer-events-none">
          <p className="text-white font-bold text-base leading-tight flex items-center gap-1">
            {profile.name} <span className="font-normal opacity-90">{profile.age}</span>
            <BadgeCheck className="w-4 h-4 text-sky-400 shrink-0" aria-label={t('verified')} />
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
  const router  = useRouter()
  const t = useTranslations('dashboard.grid')
  const { user } = useAuth()
  const { isPremium, gender, firstName: myFirstName } = useCurrentUser()
  const [profiles, setProfiles] = useState<GridProfile[]>([])
  const [index, setIndex]       = useState(0)
  const [liked, setLiked]       = useState<Set<string>>(new Set())
  // Sens du dernier geste : il pilote la sortie de la carte et le tampon.
  const [direction, setDirection] = useState<SwipeAction>('like')
  // Tampon « J'aime » / « Passer » flashé par-dessus la carte qui s'en va.
  const [stamp, setStamp] = useState<SwipeAction | null>(null)
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    if (!user) return
    const targetGender = oppositeGender(gender)
    if (!targetGender) return
    const supabase = createClient()
    let cancelled = false
    fetchBlockedIds(user.id).then(blockedIds => {
    if (cancelled) return
    supabase
      .from('profiles')
      .select('user_id, first_name, last_name, age, city, job, avatar_url, is_premium, profile_completion, photos_blurred')
      .neq('user_id', user.id)
      .eq('status', 'validated')
      .eq('visibility', 'active')
      .eq('gender', targetGender)
      // Sans photo de profil (avatar_url), le membre n'est pas visible.
      .not('avatar_url', 'is', null)
      .gte('profile_completion', MIN_VISIBLE_PROFILE_COMPLETION)
      .order('profile_completion', { ascending: false })
      .limit(12)
      .then(({ data }) => {
        if (cancelled) return
        if (data && data.length > 0) {
          setProfiles(
            (data as { user_id: string; first_name: string; last_name: string | null; age: number | null; city: string | null; job: string | null; avatar_url: string | null; is_premium: boolean; profile_completion: number; photos_blurred: boolean | null }[])
              // Les membres bloqués sortent du carrousel.
              .filter(p => !blockedIds.has(p.user_id))
              .map(p => ({
                id:           p.user_id,
                name:         `${p.first_name} ${(p.last_name ?? '').charAt(0)}.`,
                age:          p.age ?? 0,
                city:         p.city ?? t('unknownCity'),
                job:          p.job ?? '',
                score:        p.profile_completion ?? 80,
                photo:        p.avatar_url ?? '/avatar-placeholder.svg',
                isPremium:    p.is_premium,
                photoBlurred: p.photos_blurred ?? false,
              }))
          )
        }
      })
    })
    return () => { cancelled = true }
  }, [user, gender])

  const total   = profiles.length
  const profile = profiles[index]

  // L'index avance tout de suite : AnimatePresence garde la carte sortante le
  // temps de son animation, la suivante entre par-dessous. Aucun setTimeout à
  // synchroniser avec la durée de l'animation.
  //
  // `withStamp` distingue l'origine de la décision : un appui bouton n'a rien
  // montré, on flashe donc le tampon ; un geste a déjà affiché le sien en
  // suivant le doigt, le rejouer ferait doublon.
  const advance = (action: SwipeAction, withStamp = true) => {
    setDirection(action)
    if (withStamp) setStamp(action)
    setIndex(i => i + 1)
  }

  const handleLike = async (id: string, name: string): Promise<boolean> => {
    if (liked.has(id) || !user) return false
    const result = await sendContactRequest(user.id, id, isPremium)
    if (!result.ok) {
      if (result.reason === 'limit') {
        // Le quota quotidien n'est pas une panne mais une limite du plan
        // gratuit : ton d'avertissement plutôt que d'erreur, et un bouton pour
        // agir — le message invitait à passer Premium sans offrir le chemin.
        toast.warning(result.message, {
          duration: 6_000,
          action: {
            label: t('goPremium'),
            onClick: () => router.push('/dashboard/premium'),
          },
        })
      } else {
        toast.error(result.message)
      }
      return false
    }
    setLiked(prev => new Set([...prev, id]))
    notifyByEmail(id, 'demande', myFirstName || 'Un membre')
    toast.success(t('requestSent', { name }))
    return true
  }

  const handlePass = () => advance('pass')
  const handleLikeCarousel = async (withStamp = true) => {
    if (!profile) return
    // Profil déjà liké : la demande n'est pas renvoyée, mais on passe quand
    // même au suivant sinon le bouton reste sans effet.
    if (liked.has(profile.id)) { advance('like', withStamp); return }
    const ok = await handleLike(profile.id, profile.name)
    if (ok) advance('like', withStamp)
  }

  /**
   * Décision prise au doigt. La carte est déjà partie sur le côté quand on
   * arrive ici : si la demande de contact échoue, l'index n'avance pas et la
   * carte revient au centre toute seule — l'utilisateur voit que rien n'a été
   * validé, sans message contradictoire.
   */
  const handleSwipe = (action: SwipeAction) => {
    if (action === 'pass') { advance('pass', false); return }
    void handleLikeCarousel(false)
  }

  if (profiles.length === 0) return null

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
              <h2 className="font-semibold text-gray-900 text-sm leading-tight">{t('selectionTitle')}</h2>
              <p className="text-xs text-gray-400">{t('selectionSubtitle')}</p>
            </div>
          </div>
          <span className="text-xs text-gray-400">{t('profilesCount', { count: profiles.length })}</span>
        </div>

        <div className="grid grid-cols-4 gap-3 stagger-children">
          {profiles.map(p => (
            <GridCard
              key={p.id}
              profile={p}
              liked={liked.has(p.id)}
              onLike={() => handleLike(p.id, p.name)}
              viewerIsPremium={isPremium}
            />
          ))}
        </div>

        <div className="text-center pt-1">
          <button
            onClick={() => router.push('/dashboard/explorer')}
            className="text-sm font-medium text-emerald-500 hover:text-emerald-600 transition-colors"
          >
            {t('seeAll')}
          </button>
        </div>
      </div>

      {/* ── MOBILE : carousel ── */}
      <div className="md:hidden bg-white rounded-xl p-4 space-y-3">

        {!profile ? (
          <>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center shrink-0">
                <Heart className="w-4 h-4 text-pink-500 fill-pink-500" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900 text-sm">{t('selectionTitle')}</h2>
                <p className="text-xs text-gray-400">{t('selectionSubtitle')}</p>
              </div>
            </div>
            <div className="text-center py-10 space-y-3">
              <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mx-auto">
                <Heart className="w-7 h-7 text-emerald-400" />
              </div>
              <p className="font-semibold text-gray-800 text-sm">{t('allSeen')}</p>
              <button
                onClick={() => setIndex(0)}
                className="text-sm font-medium text-emerald-500 hover:text-emerald-600 transition-colors"
              >
                {t('restart')}
              </button>
            </div>
            <div className="text-center">
              <button
                onClick={() => router.push('/dashboard/explorer')}
                className="text-sm font-medium text-emerald-500 hover:text-emerald-600 transition-colors"
              >
                {t('seeAll')}
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
                  <h2 className="font-semibold text-gray-900 text-sm leading-tight">{t('selectionTitle')}</h2>
                  <p className="text-xs text-gray-400">{t('selectionSubtitle')}</p>
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

            {/* Scène du carrousel : la carte sortante et l'entrante s'y
                superposent, d'où les cartes en `absolute inset-0`. */}
            <div className="relative overflow-hidden rounded-2xl" style={{ aspectRatio: '3/4' }}>
              {/* Mode `sync` (par défaut) : les deux cartes coexistent le temps
                  de la transition. Elles sont en `absolute inset-0`, elles se
                  superposent donc sans se pousser — pas de `popLayout`, qui
                  remesurerait inutilement des éléments déjà hors flux. */}
              <AnimatePresence initial={false} custom={direction}>
                <SwipeCard
                  // La clé force React à remonter la carte entière à chaque
                  // profil au lieu de remplacer les textes en place : le nom et
                  // l'âge ne peuvent plus rester figés si une extension ou un
                  // traducteur a modifié le DOM.
                  key={profile.id}
                  profile={profile}
                  direction={direction}
                  reduceMotion={Boolean(reduceMotion)}
                  labels={{ like: t('like'), pass: t('pass') }}
                  onOpen={() => router.push(`/dashboard/profil/${profile.id}`)}
                  onSwipe={handleSwipe}
                />
              </AnimatePresence>

              {/* Tampon des boutons. Le geste a déjà les siens, portés par la
                  carte : on ne le rejoue pas par-dessus. */}
              <AnimatePresence>
                {stamp && (
                  <motion.div
                    key={`${stamp}-${index}`}
                    aria-hidden="true"
                    className="absolute inset-0 flex items-center justify-center pointer-events-none"
                    initial={{ opacity: 0, scale: 0.5, rotate: stamp === 'like' ? 14 : -14 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.25 }}
                    transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                    onAnimationComplete={() => setStamp(null)}
                  >
                    <Stamp action={stamp} label={stamp === 'like' ? t('like') : t('pass')} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex items-stretch gap-3 pt-1">
              <motion.button
                onClick={handlePass}
                whileTap={{ scale: 0.93 }}
                transition={{ type: 'spring', stiffness: 520, damping: 22 }}
                className="flex flex-col items-center justify-center gap-1 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors flex-1"
              >
                {/* La croix pivote à chaque profil écarté. */}
                <motion.span
                  key={`pass-${index}`}
                  initial={{ rotate: -90, scale: 0.6 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 18 }}
                >
                  <X className="w-5 h-5 text-gray-500" />
                </motion.span>
                <span className="text-[11px] font-semibold text-gray-500">{t('pass')}</span>
              </motion.button>
              <motion.button
                onClick={(e) => { e.stopPropagation(); handleLikeCarousel() }}
                whileTap={{ scale: 0.93 }}
                transition={{ type: 'spring', stiffness: 520, damping: 22 }}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 py-2.5 rounded-xl transition-colors flex-1",
                  liked.has(profile.id) ? "bg-emerald-400 hover:bg-emerald-500" : "bg-emerald-500 hover:bg-emerald-600"
                )}
              >
                {/* Battement de cœur à chaque nouveau profil présenté. */}
                <motion.span
                  key={`like-${index}`}
                  initial={{ scale: 0.6 }}
                  animate={{ scale: [0.6, 1.18, 1] }}
                  transition={{ duration: 0.45, times: [0, 0.6, 1], ease: 'easeOut' }}
                >
                  <Heart className="w-5 h-5 text-white fill-white" />
                </motion.span>
                <span className="text-[11px] font-semibold text-white">
                  {liked.has(profile.id) ? t('alreadyLiked') : t('like')}
                </span>
              </motion.button>
            </div>

            <div className="text-center pb-1">
              <button
                onClick={() => router.push('/dashboard/explorer')}
                className="text-sm font-medium text-emerald-500 hover:text-emerald-600 transition-colors"
              >
                {t('seeAll')}
              </button>
            </div>
          </>
        )}
      </div>
    </>
  )
}
