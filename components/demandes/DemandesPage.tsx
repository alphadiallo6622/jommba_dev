'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Heart, Inbox, Send, Users, Search, Timer, CheckCircle, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import { mockRecues, mockEnvoyees, mockContacts, ReceivedRequest, SentRequest, ContactEntry } from '@/lib/mock-demandes'
import { cn } from '@/lib/utils'
import ReceivedRequestCard from './ReceivedRequestCard'
import SentRequestCard from './SentRequestCard'
import ContactCard from './ContactCard'
import EmptyState from './EmptyState'
import DiscussionRulesModal from '@/components/messages/DiscussionRulesModal'

type MainTab = 'recues' | 'envoyees' | 'contacts'
type SubFilter = 'toutes' | 'en-attente' | 'acceptees' | 'refusees'

const subFilters: { id: SubFilter; label: string; icon: React.ElementType }[] = [
  { id: 'toutes',      label: 'Toutes',      icon: Send        },
  { id: 'en-attente',  label: 'En attente',  icon: Timer       },
  { id: 'acceptees',   label: 'Acceptées',   icon: CheckCircle },
  { id: 'refusees',    label: 'Refusées',    icon: XCircle     },
]

export default function DemandesPage() {
  const router = useRouter()
  const [activeTab, setActiveTab]     = useState<MainTab>('recues')
  const [subFilter, setSubFilter]     = useState<SubFilter>('toutes')
  const [recues, setRecues]           = useState<ReceivedRequest[]>(mockRecues)
  const [envoyees]                    = useState<SentRequest[]>(mockEnvoyees)
  const [contacts]                    = useState<ContactEntry[]>(mockContacts)
  const [pendingRequest, setPendingRequest] = useState<ReceivedRequest | null>(null)

  const handleAccept = (id: number) => {
    const request = recues.find(r => r.id === id)
    if (request) setPendingRequest(request)
  }

  const handleConfirmAccept = () => {
    if (!pendingRequest) return
    setRecues(prev => prev.filter(r => r.id !== pendingRequest.id))
    setPendingRequest(null)
    toast.success('Demande acceptée ✓')
    router.push(`/dashboard/messages/${pendingRequest.id}`)
  }

  const handleRefuse = (id: number) => {
    setRecues(prev => prev.filter(r => r.id !== id))
    toast.error('Demande refusée')
  }

  const filteredEnvoyees = envoyees.filter(r => {
    if (subFilter === 'toutes')      return true
    if (subFilter === 'en-attente')  return r.status === 'en-attente'
    if (subFilter === 'acceptees')   return r.status === 'acceptee'
    if (subFilter === 'refusees')    return r.status === 'refusee'
    return true
  })

  const mainTabs = [
    { id: 'recues'   as MainTab, label: 'Reçues',   icon: Inbox, count: recues.length   },
    { id: 'envoyees' as MainTab, label: 'Envoyées', icon: Send,  count: envoyees.length },
    { id: 'contacts' as MainTab, label: 'Contacts', icon: Users, count: contacts.length },
  ]

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#064E3B] flex items-center gap-2">
            Demandes <Heart className="w-5 h-5 text-[#10B981]" />
          </h1>
          <p className="text-gray-400 text-sm mt-1">Gère tes demandes et contacts</p>
        </div>
        <button
          onClick={() => router.push('/dashboard/explorer')}
          className="flex items-center gap-2 bg-[#E1F5EE] text-[#10B981] px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors"
        >
          <Search className="w-4 h-4" /> Découvrir
        </button>
      </div>

      {/* Main tabs */}
      <div className="flex mb-6 bg-gray-50 p-1 rounded-xl w-full">
        {mainTabs.map(({ id, label, icon: Icon, count }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={cn(
              'flex flex-1 items-center justify-center gap-1.5 px-2 py-2 rounded-lg text-sm font-medium transition-colors',
              activeTab === id
                ? 'bg-[#064E3B] text-white'
                : 'text-gray-500 hover:text-gray-700',
            )}
          >
            <Icon className="w-4 h-4 shrink-0" />
            {label}
            <span className={cn(
              'text-xs px-1.5 py-0.5 rounded-full font-semibold',
              activeTab === id
                ? 'bg-white/20 text-white'
                : count > 0 ? 'bg-[#E1F5EE] text-[#10B981]' : 'bg-gray-200 text-gray-400',
            )}>
              {count}
            </span>
          </button>
        ))}
      </div>

      {/* === REÇUES === */}
      {activeTab === 'recues' && (
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
            title="Aucune demande reçue"
            subtitle="Les demandes que tu recevras apparaîtront ici"
            buttonLabel="Découvrir des profils"
            onButtonClick={() => router.push('/dashboard/explorer')}
          />
        )
      )}

      {/* === ENVOYÉES === */}
      {activeTab === 'envoyees' && (
        <>
          {/* Sub-filters */}
          <div className="flex gap-2 mb-5 flex-wrap">
            {subFilters.map(({ id, label, icon: Icon }) => (
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
                {label}
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
              title="Aucune demande dans cette catégorie"
              subtitle="Les demandes filtrées apparaîtront ici"
              buttonLabel="Découvrir des profils"
              onButtonClick={() => router.push('/dashboard/explorer')}
            />
          )}
        </>
      )}

      {/* === CONTACTS === */}
      {activeTab === 'contacts' && (
        contacts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {contacts.map(c => (
              <ContactCard key={c.id} contact={c} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Users}
            title="Aucun contact pour l'instant"
            subtitle="Tes contacts acceptés apparaîtront ici"
            buttonLabel="Découvrir des profils"
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
