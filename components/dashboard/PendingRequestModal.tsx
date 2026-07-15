'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import {
  Heart, X, MapPin, Briefcase, Clock, Crown, Check,
  CheckCircle2, Send, Loader2, Zap,
} from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/providers/AuthProvider'
import { useCurrentUser } from '@/lib/use-current-user'
import { notifyByEmail } from '@/lib/notify-email'
import { getOrCreateConversation, sendMessage } from '@/lib/supabase/messages-service'

type PendingRequest = {
  id: string          // sender_id
  firstName: string
  age: number
  photo: string
  city: string
  job: string | null
  isPremium: boolean
  flashMessage: string | null
  timeAgo: string
  createdAt: string
}

// Session flag : évite de re-proposer le popup après fermeture pendant la
// même visite (rechargements de page inclus via sessionStorage).
const DISMISS_KEY = 'jommba:pending-request-dismissed'

export default function PendingRequestModal() {
  const router = useRouter()
  const t = useTranslations('dashboard.pendingModal')
  const { user } = useAuth()
  const { firstName: myFirstName } = useCurrentUser()

  // Libellé « il y a … » localisé (dépend de t, donc défini dans le composant).
  const formatTimeAgo = useCallback((dateStr: string): string => {
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
    if (diff < 60)     return t('timeNow')
    if (diff < 3600)   return t('timeMinutes', { n: Math.floor(diff / 60) })
    if (diff < 86400)  return t('timeHours', { n: Math.floor(diff / 3600) })
    if (diff < 172800) return t('timeYesterday')
    return t('timeDays', { n: Math.floor(diff / 86400) })
  }, [t])

  const [request, setRequest] = useState<PendingRequest | null>(null)
  const [pendingCount, setPendingCount] = useState(0)
  const [step, setStep] = useState<'invite' | 'message'>('invite')
  const [accepting, setAccepting] = useState(false)
  const [sending, setSending] = useState(false)
  const [messageText, setMessageText] = useState('')
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [visible, setVisible] = useState(false)

  // Récupère la demande en attente la plus récente au montage.
  const loadPending = useCallback(async () => {
    if (!user) return
    // Déjà fermé pendant cette session : on n'importune pas l'utilisateur.
    try {
      if (sessionStorage.getItem(DISMISS_KEY) === '1') return
    } catch { /* ignore */ }

    const supabase = createClient()
    const { data: likes } = await supabase
      .from('likes')
      .select('sender_id, created_at, status, type, flash_message')
      .eq('receiver_id', user.id)
      .eq('type', 'request')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })

    const pending = likes ?? []
    if (pending.length === 0) return

    setPendingCount(pending.length)
    const latest = pending[0] as { sender_id: string; created_at: string; flash_message: string | null }

    const { data: profile } = await supabase
      .from('profiles')
      .select('user_id, first_name, age, avatar_url, city, job, is_premium')
      .eq('user_id', latest.sender_id)
      .maybeSingle()

    const p = profile as {
      first_name?: string; age?: number | null; avatar_url?: string | null
      city?: string | null; job?: string | null; is_premium?: boolean | null
    } | null

    setRequest({
      id: latest.sender_id,
      firstName: p?.first_name ?? t('unknownMember'),
      age: p?.age ?? 0,
      photo: p?.avatar_url ?? '/avatar-placeholder.svg',
      city: p?.city ?? t('unknownCity'),
      job: p?.job ?? null,
      isPremium: p?.is_premium === true,
      flashMessage: latest.flash_message ?? null,
      timeAgo: formatTimeAgo(latest.created_at),
      createdAt: latest.created_at,
    })
    setVisible(true)
  }, [user, t, formatTimeAgo])

  useEffect(() => { loadPending() }, [loadPending])

  const dismiss = () => {
    try { sessionStorage.setItem(DISMISS_KEY, '1') } catch { /* ignore */ }
    setVisible(false)
  }

  const handleRefuse = async () => {
    if (!request || !user) return
    const supabase = createClient()
    await supabase
      .from('likes')
      .update({ status: 'rejected' })
      .eq('sender_id', request.id)
      .eq('receiver_id', user.id)
      .eq('type', 'request')
    toast(t('refused'))
    dismiss()
  }

  const handleAccept = async () => {
    if (!request || !user) return
    setAccepting(true)
    const supabase = createClient()
    const { error } = await supabase
      .from('likes')
      .update({ status: 'accepted' })
      .eq('sender_id', request.id)
      .eq('receiver_id', user.id)
      .eq('type', 'request')

    if (error) {
      toast.error(t('acceptError'))
      setAccepting(false)
      return
    }

    // Les règles de discussion sont réputées acceptées via ce flux : la
    // messagerie ne les redemandera pas à l'ouverture de la conversation.
    try { localStorage.setItem(`jommba:rules-accepted:${user.id}:${request.id}`, '1') } catch { /* ignore */ }

    // Prépare la conversation pour permettre l'envoi du message optionnel.
    const conv = await getOrCreateConversation(user.id, request.id)
    setConversationId(conv?.id ?? null)

    notifyByEmail(request.id, 'demande_acceptee', myFirstName || 'Un membre')
    setAccepting(false)
    setStep('message')
  }

  const handleSendMessage = async () => {
    if (!request || !user) return
    const text = messageText.trim()
    if (!text) { goToConversation(); return }

    setSending(true)
    let convId = conversationId
    if (!convId) {
      const conv = await getOrCreateConversation(user.id, request.id)
      convId = conv?.id ?? null
    }
    if (convId) {
      await sendMessage(convId, user.id, request.id, text)
      notifyByEmail(request.id, 'message', myFirstName || 'Un membre')
    }
    setSending(false)
    goToConversation()
  }

  const goToConversation = () => {
    dismiss()
    router.push(`/dashboard/messages/${request?.id}`)
  }

  if (!visible || !request) return null

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4"
      onClick={step === 'invite' ? dismiss : undefined}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {step === 'invite' ? (
          <>
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#10B981] flex items-center justify-center shrink-0">
                  <Heart className="w-5 h-5 text-white fill-white" />
                </div>
                <div>
                  <h2 className="font-bold text-gray-900 text-base leading-tight">{t('title')}</h2>
                  <p className="text-gray-400 text-xs">
                    {t('countDesc', { count: pendingCount })}
                  </p>
                </div>
              </div>
              <button
                onClick={dismiss}
                className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors shrink-0"
                aria-label={t('close')}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Profile photo card */}
            <div className="px-5">
              <button
                type="button"
                onClick={() => { dismiss(); router.push(`/dashboard/profil/${request.id}`) }}
                className="relative block w-full rounded-2xl overflow-hidden aspect-[4/5]"
              >
                <img
                  src={request.photo}
                  alt={request.firstName}
                  className="w-full h-full object-cover"
                />
                {/* Time badge */}
                <span className="absolute top-3 left-3 inline-flex items-center gap-1 bg-black/50 backdrop-blur-sm text-white text-xs font-medium px-2.5 py-1 rounded-lg">
                  <Clock className="w-3 h-3" /> {request.timeAgo}
                </span>
                {/* Premium badge */}
                {request.isPremium && (
                  <span className="absolute top-3 right-3 inline-flex items-center gap-1 bg-amber-400 text-amber-900 text-xs font-bold px-2.5 py-1 rounded-lg">
                    <Crown className="w-3 h-3" /> {t('premium')}
                  </span>
                )}
                {/* Name overlay */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-4 pt-10 pb-3 text-left">
                  <p className="text-white font-bold text-lg">
                    {request.firstName} {request.age > 0 && <span className="font-medium">{t('yearsOld', { age: request.age })}</span>}
                  </p>
                </div>
              </button>
            </div>

            {/* Meta chips */}
            <div className="flex items-center gap-2 px-5 pt-3 flex-wrap">
              <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-600 text-xs font-medium px-2.5 py-1 rounded-lg">
                <MapPin className="w-3 h-3" /> {request.city}
              </span>
              {request.job && (
                <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-600 text-xs font-medium px-2.5 py-1 rounded-lg">
                  <Briefcase className="w-3 h-3" /> {request.job}
                </span>
              )}
            </div>

            {/* Message flash joint à la demande */}
            {request.flashMessage && (
              <div className="mx-5 mt-3 rounded-xl bg-amber-50 border border-amber-200 p-3">
                <p className="text-[11px] font-semibold text-amber-700 flex items-center gap-1 mb-1">
                  <Zap className="w-3 h-3" /> {t('flashFrom', { name: request.firstName })}
                </p>
                <p className="text-sm text-gray-700 leading-relaxed">{request.flashMessage}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 px-5 pt-4">
              <button
                onClick={handleRefuse}
                disabled={accepting}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <X className="w-4 h-4" /> {t('refuse')}
              </button>
              <button
                onClick={handleAccept}
                disabled={accepting}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-[#10B981] text-white text-sm font-semibold hover:bg-[#059669] transition-colors disabled:opacity-60"
              >
                {accepting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                {t('accept')}
              </button>
            </div>

            {/* Footer link */}
            <button
              onClick={() => { dismiss(); router.push('/dashboard/demandes') }}
              className="w-full flex items-center justify-center gap-1.5 py-4 mt-2 text-gray-500 text-sm hover:text-gray-700 transition-colors"
            >
              <Heart className="w-3.5 h-3.5" /> {t('seeAllRequests')}
            </button>
          </>
        ) : (
          <>
            {/* Header — accepted */}
            <div className="flex items-center justify-between px-5 pt-5 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#10B981] flex items-center justify-center shrink-0">
                  <Heart className="w-5 h-5 text-white fill-white" />
                </div>
                <h2 className="font-bold text-gray-900 text-base">{t('acceptedTitle')}</h2>
              </div>
              <button
                onClick={goToConversation}
                className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors shrink-0"
                aria-label={t('close')}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="px-5 pb-6">
              {/* Success banner */}
              <div className="flex items-start gap-3 bg-[#E9F9F2] rounded-xl p-3.5 mb-5">
                <CheckCircle2 className="w-5 h-5 text-[#10B981] shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{t('acceptedBanner', { name: request.firstName })}</p>
                  <p className="text-gray-500 text-xs">{t('conversationCreated')}</p>
                </div>
              </div>

              {/* Optional message */}
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                {t('sendMessageLabel')} <span className="text-gray-400 font-normal">{t('optional')}</span>
              </label>
              <div className="relative">
                <textarea
                  value={messageText}
                  onChange={e => setMessageText(e.target.value.slice(0, 500))}
                  placeholder={t('sayHello', { name: request.firstName })}
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/15 transition-all resize-none"
                />
                <span className="absolute bottom-2 right-3 text-[11px] text-gray-400">{messageText.length}/500</span>
              </div>

              <button
                onClick={handleSendMessage}
                disabled={sending}
                className="w-full flex items-center justify-center gap-2 py-3.5 mt-4 rounded-xl bg-[#10B981] text-white text-sm font-semibold hover:bg-[#059669] transition-colors disabled:opacity-60"
              >
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {t('sendMessage')}
              </button>

              <button
                onClick={goToConversation}
                disabled={sending}
                className="w-full text-center py-3 mt-1 text-[#10B981] text-sm font-medium hover:text-[#059669] transition-colors disabled:opacity-60"
              >
                {t('goToConversation')}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
