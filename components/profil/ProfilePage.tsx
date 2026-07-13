'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft, Camera, Crown, MoreHorizontal, MapPin, Plus,
  Zap, Lightbulb, Heart, Users, BookOpen, Home, Globe,
  Star, AlertCircle, XCircle, Languages, Loader2, BadgeCheck,
} from 'lucide-react'
import { toast } from 'sonner'
import { useIsOnline } from '@/components/providers/PresenceProvider'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/providers/AuthProvider'
import { useCurrentUser } from '@/lib/use-current-user'
import { sendContactRequest } from '@/lib/supabase/likes-service'
import { notifyByEmail } from '@/lib/notify-email'
import { oppositeGender } from '@/lib/gender'
import { MIN_VISIBLE_PROFILE_COMPLETION } from '@/lib/constants'
import type { FullProfile } from '@/lib/mock-demandes'
import type { Profile } from '@/lib/supabase/types'
import ProfileSection from './ProfileSection'
import ProfileGridSection from './ProfileGridSection'
import PhotoGallery from './PhotoGallery'
import PhotoUpsellBanner from './PhotoUpsellBanner'
import MyProfileView from './MyProfileView'
import MessageIdeasModal from './MessageIdeasModal'
import FlashMessageModal from './FlashMessageModal'

type Props = { id: string }

function profileToFull(p: Profile, requestStatus: FullProfile['requestStatus']): FullProfile {
  return {
    id:             p.user_id,
    firstName:      p.first_name,
    age:            p.age ?? 0,
    photo:          p.avatar_url ?? '/avatar-placeholder.svg',
    isPhotoBlurred: p.photos_blurred ?? false,
    isPremium:      p.is_premium,
    location:       [p.city, p.country].filter(Boolean).join(', ') || 'Inconnu',
    tags:           [p.marital_status, p.job, p.education].filter(Boolean) as string[],
    requestStatus,
    marriageVision: p.marriage_vision ?? '',
    seeking:        p.seeking ?? '',
    religion: {
      madhhab: p.madhhab ?? '',
      mosque:  p.mosque_frequency ?? '',
      arabic:  p.arabic_level ?? '',
    },
    lifeProject: {
      hasChildren:   p.has_children ?? '',
      wantsChildren: p.wants_children ?? '',
      canRelocate:   p.can_relocate ?? '',
      polygamy:      p.polygamy ?? '',
    },
    interests:   p.interests ?? '',
    qualities:   p.qualities ?? '',
    flaws:       p.flaws ?? '',
    dealbreakers: p.dealbreakers ?? '',
    languages:   p.languages ?? '',
  }
}

export default function ProfilePage({ id }: Props) {
  const router  = useRouter()
  const { user } = useAuth()
  const { isPremium, gender, firstName: myFirstName } = useCurrentUser()
  const isOnline = useIsOnline(id)
  const [profile, setProfile]   = useState<FullProfile | null>(null)
  const [loading, setLoading]   = useState(true)
  const [menuOpen, setMenuOpen] = useState(false)
  const [showIdeas, setShowIdeas] = useState(false)
  const [showFlash, setShowFlash] = useState(false)

  const isMyProfile = id === user?.id

  const fetchProfile = useCallback(async () => {
    if (!user || isMyProfile) { setLoading(false); return }
    setLoading(true)
    try {
      const supabase = createClient()

      const [{ data: p }, { data: outgoing }, { data: incoming }] = await Promise.all([
        supabase.from('profiles').select('*').eq('user_id', id).single(),
        supabase.from('likes').select('status').eq('sender_id', user.id).eq('receiver_id', id).eq('type', 'request').maybeSingle(),
        supabase.from('likes').select('status').eq('sender_id', id).eq('receiver_id', user.id).eq('type', 'request').maybeSingle(),
      ])

      if (!p) { setProfile(null); return }

      // Matching hétérosexuel strict : un accès direct par URL à un profil du
      // même genre (ou dont le genre n'est pas encore renseigné) est traité
      // comme introuvable, comme s'il n'existait pas.
      const targetGender = oppositeGender(gender)
      if (!targetGender || (p as Profile).gender !== targetGender) {
        setProfile(null)
        return
      }

      // Un profil incomplet est invisible pour les autres — même règle que
      // la bannière "Ton profil est invisible" sur le dashboard.
      if (((p as Profile).profile_completion ?? 0) < MIN_VISIBLE_PROFILE_COMPLETION) {
        setProfile(null)
        return
      }

      let status: FullProfile['requestStatus'] = 'none'
      if (outgoing) {
        status = outgoing.status === 'accepted' ? 'acceptee' : outgoing.status === 'rejected' ? 'refusee' : 'en-attente'
      } else if (incoming && incoming.status === 'pending') {
        status = 'incoming'
      } else if (incoming && incoming.status === 'accepted') {
        status = 'acceptee'
      }

      setProfile(profileToFull(p as Profile, status))

      // Journalise la visite (1 ligne par paire visiteur/profil, horodatage
      // rafraîchi — sert au compteur de Visiteurs uniques) — seulement pour
      // un profil valide et accessible.
      supabase.from('profile_visitors').upsert({
        visitor_id: user.id,
        profile_id: id,
        visited_at: new Date().toISOString(),
      }, { onConflict: 'visitor_id,profile_id' }).then(({ error }) => {
        if (error) console.error('[ProfilePage] visit log error:', error)
      })

      // Journalise chaque vue individuellement (non dédupliqué — sert au
      // compteur de Vues total, distinct des Visiteurs uniques).
      supabase.from('profile_views').insert({
        viewer_id:  user.id,
        profile_id: id,
      }).then(({ error }) => {
        if (error) console.error('[ProfilePage] view log error:', error)
      })
    } catch (err) {
      console.error('[ProfilePage] fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [user, id, isMyProfile, gender])

  useEffect(() => { fetchProfile() }, [fetchProfile])

  const handleSendRequest = async () => {
    if (!user) return
    const result = await sendContactRequest(user.id, id, isPremium)
    if (!result.ok) { toast.error(result.message); return }
    setProfile(p => p ? { ...p, requestStatus: 'en-attente' } : p)
    notifyByEmail(id, 'demande', myFirstName || 'Un membre')
    toast.success('Demande envoyée ✓')
  }

  // Envoie une demande de contact accompagnée d'un message flash (Premium).
  const handleSendFlash = async (flashMessage: string): Promise<boolean> => {
    if (!user) return false
    const result = await sendContactRequest(user.id, id, isPremium, flashMessage)
    if (!result.ok) { toast.error(result.message); return false }
    setProfile(p => p ? { ...p, requestStatus: 'en-attente' } : p)
    notifyByEmail(id, 'demande', myFirstName || 'Un membre')
    toast.success('Demande envoyée avec ton message flash ✓')
    return true
  }

  const handleAcceptIncoming = async () => {
    if (!user) return
    const supabase = createClient()
    await supabase.from('likes').update({ status: 'accepted' })
      .eq('sender_id', id).eq('receiver_id', user.id).eq('type', 'request')
    setProfile(p => p ? { ...p, requestStatus: 'acceptee' } : p)
    notifyByEmail(id, 'demande_acceptee', myFirstName || 'Un membre')
    toast.success('Demande acceptée ✓')
    router.push(`/dashboard/messages/${id}`)
  }

  const handleRefuseIncoming = async () => {
    if (!user) return
    const supabase = createClient()
    await supabase.from('likes').update({ status: 'rejected' })
      .eq('sender_id', id).eq('receiver_id', user.id).eq('type', 'request')
    setProfile(p => p ? { ...p, requestStatus: 'none' } : p)
    toast.error('Demande refusée')
  }

  const handleReport = async () => {
    setMenuOpen(false)
    if (!user) return
    const supabase = createClient()
    const { error } = await supabase.from('reports').insert({
      reporter_id: user.id,
      reported_id: id,
      reason:      'Signalement depuis le profil',
      status:      'pending',
    })
    if (error) { toast.error('Erreur lors du signalement'); return }
    toast.success('Signalement envoyé. Notre équipe va examiner ce profil.')
  }

  if (isMyProfile) return <MyProfileView />

  if (loading) return (
    <div className="flex justify-center py-24">
      <Loader2 className="w-6 h-6 animate-spin text-[#10B981]" />
    </div>
  )

  if (!profile) return (
    <div className="max-w-lg mx-auto px-4 py-12 text-center">
      <p className="text-gray-400">Profil introuvable.</p>
      <button onClick={() => router.back()} className="mt-4 text-[#10B981] text-sm font-medium">
        ← Retour
      </button>
    </div>
  )

  return (
    <div className="max-w-lg mx-auto px-4 py-4 pb-24 relative">

      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-gray-500 text-sm mb-4 hover:text-gray-700 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour aux profils
      </button>

      {/* Photo */}
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
        {isPremium && isOnline && (
          <span className="absolute top-3 left-3 bg-white/90 text-emerald-600 text-xs px-3 py-1 rounded-full font-semibold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" /> En ligne
          </span>
        )}
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
                onClick={handleReport}
                className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-gray-50"
              >
                Signaler
              </button>
            </div>
          )}
        </div>
      </div>

      <PhotoGallery photo={profile.photo} isPremium={profile.isPremium} />
      <PhotoUpsellBanner />

      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-1 flex items-center gap-1.5">
          {profile.firstName}, {profile.age}
          <BadgeCheck className="w-5 h-5 text-sky-500 shrink-0" aria-label="Profil vérifié" />
        </h1>
        <p className="text-gray-500 text-sm flex items-center gap-1 mb-3">
          <MapPin className="w-3.5 h-3.5" /> {profile.location}
        </p>
        <div className="flex gap-2 flex-wrap">
          {profile.tags.map(tag => (
            <span key={tag} className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">{tag}</span>
          ))}
        </div>
      </div>

      <RequestStatusBanner
        status={profile.requestStatus}
        onSend={handleSendRequest}
        onAccept={handleAcceptIncoming}
        onRefuse={handleRefuseIncoming}
      />

      <div className="grid grid-cols-2 gap-3 mb-6">
        <button
          onClick={() => setShowFlash(true)}
          className="flex items-center justify-center gap-2 py-3 bg-amber-50 text-amber-600 rounded-xl text-sm font-medium hover:bg-amber-100 transition-colors"
        >
          <Zap className="w-4 h-4" /> Message Flash
        </button>
        <button
          onClick={() => setShowIdeas(true)}
          className="flex items-center justify-center gap-2 py-3 bg-[#E1F5EE] text-[#10B981] rounded-xl text-sm font-medium hover:bg-green-100 transition-colors"
        >
          <Lightbulb className="w-4 h-4" /> Idées de message
        </button>
      </div>

      <div className="space-y-3">
        <ProfileSection icon={Heart}      iconColor="text-pink-500"   iconBg="bg-pink-50"   title="Ma vision du mariage"       text={profile.marriageVision} />
        <ProfileSection icon={Users}      iconColor="text-green-600"  iconBg="bg-green-50"  title="Ce que je recherche"        text={profile.seeking} />
        <ProfileGridSection
          icon={BookOpen} iconColor="text-blue-500" iconBg="bg-blue-50" title="Pratique religieuse"
          fields={[
            { label: 'MADHHAB', value: profile.religion.madhhab },
            { label: 'MOSQUÉE', value: profile.religion.mosque  },
            { label: 'ARABE',   value: profile.religion.arabic  },
          ]}
        />
        <ProfileGridSection
          icon={Home} iconColor="text-amber-500" iconBg="bg-amber-50" title="Projet de vie"
          fields={[
            { label: 'A DES ENFANTS',        value: profile.lifeProject.hasChildren   },
            { label: 'SOUHAITE DES ENFANTS', value: profile.lifeProject.wantsChildren },
            { label: 'DÉMÉNAGER',            value: profile.lifeProject.canRelocate   },
            { label: 'POLYGAMIE',            value: profile.lifeProject.polygamy      },
          ]}
        />
        <ProfileSection icon={Globe}     iconColor="text-teal-500"   iconBg="bg-teal-50"   title="Centres d'intérêt"          text={profile.interests} />
        <ProfileSection icon={Star}      iconColor="text-yellow-500" iconBg="bg-yellow-50" title="Mes qualités"                text={profile.qualities} />
        {profile.flaws && (
          <ProfileSection icon={AlertCircle} iconColor="text-orange-500" iconBg="bg-orange-50" title="Mes défauts" text={profile.flaws} />
        )}
        <ProfileSection icon={XCircle}   iconColor="text-red-500"    iconBg="bg-red-50"    title="Ce que je n'accepte pas"    text={profile.dealbreakers} />
        <ProfileSection icon={Languages} iconColor="text-violet-500" iconBg="bg-violet-50" title="Langues parlées"            text={profile.languages} />
      </div>

      {/* Modals IA */}
      {showIdeas && (
        <MessageIdeasModal profile={profile} onClose={() => setShowIdeas(false)} />
      )}
      {showFlash && (
        <FlashMessageModal
          profile={profile}
          isPremium={isPremium}
          onSend={handleSendFlash}
          onClose={() => setShowFlash(false)}
        />
      )}

    </div>
  )
}

type BannerProps = {
  status: FullProfile['requestStatus']
  onSend: () => void
  onAccept: () => void
  onRefuse: () => void
}
function RequestStatusBanner({ status, onSend, onAccept, onRefuse }: BannerProps) {
  if (status === 'incoming') return (
    <>
      <div className="w-full py-3 bg-pink-50 text-pink-600 text-center text-sm font-medium rounded-lg mb-3 flex items-center justify-center gap-1.5">
        <Heart className="w-4 h-4 fill-current" /> Cette personne souhaite te contacter
      </div>
      <div className="grid grid-cols-2 gap-2 mb-3">
        <button onClick={onAccept} className="py-3 bg-[#10B981] text-white text-sm font-semibold rounded-lg hover:bg-[#059669] transition-colors">Accepter ✓</button>
        <button onClick={onRefuse} className="py-3 bg-gray-100 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors">Refuser</button>
      </div>
    </>
  )
  if (status === 'refusee')    return <div className="w-full py-3 bg-red-50 text-red-500 text-center text-sm font-medium rounded-lg mb-3">Demande refusée</div>
  if (status === 'en-attente') return <div className="w-full py-3 bg-amber-50 text-amber-600 text-center text-sm font-medium rounded-lg mb-3">Demande envoyée — En attente</div>
  if (status === 'acceptee')   return <div className="w-full py-3 bg-[#E1F5EE] text-[#10B981] text-center text-sm font-medium rounded-lg mb-3">✓ Contact accepté</div>
  return (
    <button onClick={onSend} className="w-full py-3 bg-[#10B981] text-white text-sm font-semibold rounded-lg mb-3 flex items-center justify-center gap-2 hover:bg-[#059669] transition-colors">
      <Plus className="w-4 h-4" /> Ajouter
    </button>
  )
}
