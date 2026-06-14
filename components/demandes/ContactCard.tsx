'use client'

import { MapPin, MessageCircle, ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ContactEntry } from '@/lib/mock-demandes'

type Props = {
  contact: ContactEntry
}

export default function ContactCard({ contact }: Props) {
  const router = useRouter()
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
      <div className="flex items-center gap-3 mb-3">
        <img
          src={contact.photo}
          alt={contact.firstName}
          className="w-12 h-12 rounded-full object-cover"
        />
        <div className="flex-1">
          <p className="font-semibold text-gray-900">
            {contact.firstName} {contact.lastInitial}., {contact.age}
          </p>
          <p className="text-gray-400 text-xs flex items-center gap-1 mt-1">
            <MapPin className="w-3 h-3" /> {contact.city}
          </p>
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => toast.info('Messagerie bientôt disponible 💬')}
          className="flex-1 py-2 bg-[#10B981] text-white rounded-lg text-sm font-medium hover:bg-[#059669] flex items-center justify-center gap-1 transition-colors"
        >
          <MessageCircle className="w-4 h-4" /> Écrire un message
        </button>
        <button
          onClick={() => router.push(`/dashboard/profil/${contact.id}`)}
          className="py-2 px-3 bg-[#E1F5EE] text-[#10B981] rounded-lg text-sm hover:bg-green-100 flex items-center justify-center transition-colors"
        >
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
