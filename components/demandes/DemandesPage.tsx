'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Heart, Inbox, Send, Users, Search, Timer, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import type { ReceivedRequest, SentRequest, ContactEntry } from '@/lib/mock-demandes'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/providers/AuthProvider'
import { useCurrentUser } from '@/lib/use-current-user'
import { notifyByEmail } from '@/lib/notify-email'
import ReceivedRequestCard from './ReceivedRequestCard'
import SentRequestCard from './SentRequestCard'
import ContactCard from './ContactCard'
import EmptyState from './EmptyState'
import DiscussionRulesModal from '@/components/messages/DiscussionRulesModal'

type MainTab = 'recues' | 'envoyees' | 'contacts'
type SubFilter = 'toutes' | 'en-attente' | 'acceptees' | 'refusees'

const subFilters: { id: SubFilter; labelKey: string; icon: React.ElementType }[] = [
  { id: 'toutes',      labelKey: 'all',      icon: Send        },
  { id: 'en-attente',  labelKey: 'pending',  icon: Timer       },
  { id: 'acceptees',   labelKey: 'accepted', icon: CheckCircle },
  { id: 'refusees',    labelKey: 'rejected', icon: XCircle     },
]

function mapStatus(status: string): 'en-attente' | 'acceptee' | 'refusee' {
  if (status === 'accepted') return 'acceptee'
  if (status === 'rejected') return 'refusee'
  return 'en-attente'
}

export default function DemandesPage() {
  const router = useRouter()
  const t = useTranslations('dashboard.demandes')
  const { user } = useAuth()
  const { firstName: myFirstName } = useCurrentUser()
  const [activeTab, setActiveTab]     = useState<MainTab>('recues')

  // Libellé « il y a … » localisé (dépend de t).
  const formatTimeAgo = useCallback((dateStr: string): string => {
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
    if (diff < 60)     return t('timeNow')
    if (diff < 3600)   return t('timeMinutes', { n: Math.floor(diff / 60) })
    if (diff < 86400)  return t('timeHours', { n: Math.floor(diff / 3600) })
    if (diff < 172800) return t('timeYesterday')
    return t('timeDays', { n: Math.floor(diff / 86400) })
  }, [t])
  const [subFilter, setSubFilter]     = useState<SubFilter>('toutes')
  const [recues, setRecues]           = useState<ReceivedRequest[]>([])
  const [envoyees, setEnvoyees]       = useState<SentRequest[]>([])
  const [contacts, setContacts]       = useState<ContactEntry[]>([])
  const [loading, setLoading]         = useState(true)
  const [pendingRequest, setPendingRequest] = useState<ReceivedRequest | null>(null)

  const fetchData = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const supabase = createClient()

      const [{ data: likesRecues }, { data: likesEnvoyees }] = await Promise.all([
        supabase.from('likes')
          .select('*')
          .eq('receiver_id', user.id)
          .eq('type', 'request')
          .order('created_at', { ascending: false }),
        supabase.from('likes')
          .select('*')
          .eq('sender_id', user.id)
          .eq('type', 'request')
          .order('created_at', { ascending: false }),
      ])

      const senderIds   = (likesRecues   ?? []).map((l: { sender_id: string }) => l.sender_id)
      const receiverIds = (likesEnvoyees ?? []).map((l: { receiver_id: string }) => l.receiver_id)
      const allIds = [...new Set([...senderIds, ...receiverIds])]

      type ProfileRow = { user_id: string; first_name: string; last_name: string | null; age: number | null; avatar_url: string | null; city: string | null }
      const profileMap = new Map<string, ProfileRow>()

      if (allIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, first_name, last_name, age, avatar_url, city')
          .in('user_id', allIds)
        for (const p of (profiles ?? []) as ProfileRow[]) profileMap.set(p.user_id, p)
      }

      const buildPhoto = (userId: string, url: string | null) =>
        url ?? '/avatar-placeholder.svg'

      setRecues(
        (likesRecues ?? [])
          .filter((l: { status: string }) => l.status === 'pending')
          .map((l: { sender_id: string; created_at: string }) => {
            const p = profileMap.get(l.sender_id)
            return {
              id:          l.sender_id,
              firstName:   p?.first_name ?? '…',
              lastInitial: (p?.last_name ?? '').charAt(0),
              age:         p?.age ?? 0,
              photo:       buildPhoto(l.sender_id, p?.avatar_url ?? null),
              city:        p?.city ?? t('unknown'),
              timeAgo:     formatTimeAgo(l.created_at),
              isNew:       Date.now() - new Date(l.created_at).getTime() < 86_400_000,
            }
          })
      )

      const envoyeesData: SentRequest[] = (likesEnvoyees ?? []).map(
        (l: { receiver_id: string; created_at: string; status: string }) => {
          const p = profileMap.get(l.receiver_id)
          return {
            id:          l.receiver_id,
            firstName:   p?.first_name ?? '…',
            lastInitial: (p?.last_name ?? '').charAt(0),
            age:         p?.age ?? 0,
            photo:       buildPhoto(l.receiver_id, p?.avatar_url ?? null),
            timeAgo:     formatTimeAgo(l.created_at),
            status:      mapStatus(l.status),
          }
        }
      )
      setEnvoyees(envoyeesData)

      setContacts(
        envoyeesData
          .filter((_, i) => (likesEnvoyees ?? [])[i]?.status === 'accepted')
          .map(({ id, firstName, lastInitial, age, photo, timeAgo }) => ({
            id, firstName, lastInitial, age, photo, city: profileMap.get(id)?.city ?? t('unknown'), timeAgo,
          }))
      )
    } catch (err) {
      console.error('[DemandesPage] fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [user, t, formatTimeAgo])

  useEffect(() => { fetchData() }, [fetchData])

  const handleAccept = (id: string) => {
    const request = recues.find(r => r.id === id)
    if (request) setPendingRequest(request)
  }

  const handleConfirmAccept = async () => {
    if (!pendingRequest || !user) return
    const supabase = createClient()
    const { error } = await supabase
      .from('likes')
      .update({ status: 'accepted' })
      .eq('sender_id', pendingRequest.id)
      .eq('receiver_id', user.id)
      .eq('type', 'request')

    if (error) {
      toast.error(t('acceptError'))
      return
    }
    // Les règles viennent d'être acceptées dans ce popup : on mémorise pour ce
    // contact afin que la messagerie ne les redemande pas à l'ouverture.
    try { localStorage.setItem(`jommba:rules-accepted:${user.id}:${pendingRequest.id}`, '1') } catch { /* ignore */ }
    setRecues(prev => prev.filter(r => r.id !== pendingRequest.id))
    setPendingRequest(null)
    notifyByEmail(pendingRequest.id, 'demande_acceptee', myFirstName || t('unknownMember'))
    toast.success(t('accepted'))
    router.push(`/dashboard/messages/${pendingRequest.id}`)
  }

  const handleRefuse = async (id: string) => {
    if (!user) return
    const supabase = createClient()
    await supabase
      .from('likes')
      .update({ status: 'rejected' })
      .eq('sender_id', id)
      .eq('receiver_id', user.id)
      .eq('type', 'request')
    setRecues(prev => prev.filter(r => r.id !== id))
    toast.error(t('refused'))
  }

  const filteredEnvoyees = envoyees.filter(r => {
    if (subFilter === 'toutes')     return true
    if (subFilter === 'en-attente') return r.status === 'en-attente'
    if (subFilter === 'acceptees')  return r.status === 'acceptee'
    if (subFilter === 'refusees')   return r.status === 'refusee'
    return true
  })

  const mainTabs = [
    { id: 'recues'   as MainTab, label: t('tabs.received'), icon: Inbox, count: recues.length   },
    { id: 'envoyees' as MainTab, label: t('tabs.sent'),     icon: Send,  count: envoyees.length },
    { id: 'contacts' as MainTab, label: t('tabs.contacts'), icon: Users, count: contacts.length },
  ]

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#064E3B] flex items-center gap-2">
            {t('title')} <Heart className="w-5 h-5 text-[#10B981]" />
          </h1>
          <p className="text-gray-400 text-sm mt-1">{t('subtitle')}</p>
        </div>
        <button
          onClick={() => router.push('/dashboard/explorer')}
          className="flex items-center gap-2 bg-[#E1F5EE] text-[#10B981] px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors"
        >
          <Search className="w-4 h-4" /> {t('discover')}
        </button>
      </div>

      {/* Main tabs */}
      <div className="flex mb-6 bg-gray-50 p-1 rounded-xl w-full">
        {mainTabs.map(({ id, label, icon: Icon, count }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={cn(
              'flex flex-1 items-center justify-center gap-1 px-1 py-2 rounded-lg text-xs font-medium transition-colors sm:gap-1.5 sm:px-2 sm:text-sm',
              activeTab === id
                ? 'bg-[#064E3B] text-white'
                : 'text-gray-500 hover:text-gray-700',
            )}
          >
            <Icon className="w-3.5 h-3.5 shrink-0 hidden sm:block" />
            {label}
            <span className={cn(
              'text-[10px] px-1 py-0.5 rounded-full font-semibold shrink-0 sm:text-xs sm:px-1.5',
              activeTab === id
                ? 'bg-white/20 text-white'
                : count > 0 ? 'bg-[#E1F5EE] text-[#10B981]' : 'bg-gray-200 text-gray-400',
            )}>
              {loading ? '…' : count}
            </span>
          </button>
        ))}
      </div>

      {/* Loading spinner */}
      {loading && (
        <div className="flex justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-[#10B981]" />
        </div>
      )}

      {/* === REÇUES === */}
      {!loading && activeTab === 'recues' && (
        recues.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recues.map(r => (
              <ReceivedRequestCard
                key={r.id}
                request={r}
                onAccept={handleAccept}
                onRefuse={handleRefuse}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Inbox}
            title={t('emptyReceivedTitle')}
            subtitle={t('emptyReceivedSubtitle')}
            buttonLabel={t('discoverProfiles')}
            onButtonClick={() => router.push('/dashboard/explorer')}
          />
        )
      )}

      {/* === ENVOYÉES === */}
      {!loading && activeTab === 'envoyees' && (
        <>
          <div className="flex gap-2 mb-5 flex-wrap">
            {subFilters.map(({ id, labelKey, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setSubFilter(id)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                  subFilter === id
                    ? 'bg-[#064E3B] text-white'
                    : 'bg-white text-gray-500 border border-gray-200 hover:text-gray-700',
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                {t(`filters.${labelKey}`)}
              </button>
            ))}
          </div>

          {filteredEnvoyees.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredEnvoyees.map(r => (
                <SentRequestCard key={r.id} request={r} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Send}
              title={t('emptySentTitle')}
              subtitle={t('emptySentSubtitle')}
              buttonLabel={t('discoverProfiles')}
              onButtonClick={() => router.push('/dashboard/explorer')}
            />
          )}
        </>
      )}

      {/* === CONTACTS === */}
      {!loading && activeTab === 'contacts' && (
        contacts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {contacts.map(c => (
              <ContactCard key={c.id} contact={c} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Users}
            title={t('emptyContactsTitle')}
            subtitle={t('emptyContactsSubtitle')}
            buttonLabel={t('discoverProfiles')}
            onButtonClick={() => router.push('/dashboard/explorer')}
          />
        )
      )}

      {/* Discussion rules modal */}
      {pendingRequest && (
        <DiscussionRulesModal
          firstName={pendingRequest.firstName}
          lastInitial={pendingRequest.lastInitial}
          onConfirm={handleConfirmAccept}
          onClose={() => setPendingRequest(null)}
        />
      )}
    </div>
  )
}
