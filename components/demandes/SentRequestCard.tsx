'use client'

import { Clock, ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { SentRequest } from '@/lib/mock-demandes'
import StatusBadge from './StatusBadge'

type Props = {
  request: SentRequest
}

export default function SentRequestCard({ request }: Props) {
  const router = useRouter()
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
      <div className="flex items-center gap-3 mb-3">
        <img
          src={request.photo}
          alt={request.firstName}
          className="w-12 h-12 rounded-full object-cover"
        />
        <div className="flex-1">
          <p className="font-semibold text-gray-900">
            {request.firstName} {request.lastInitial}., {request.age}
          </p>
          <p className="text-gray-400 text-xs flex items-center gap-1 mt-1">
            <Clock className="w-3 h-3" /> {request.timeAgo}
          </p>
        </div>
        <StatusBadge status={request.status} />
      </div>
      <button
        onClick={() => router.push(`/dashboard/profil/${request.id}`)}
        className="w-full py-2 bg-[#E1F5EE] text-[#10B981] rounded-lg text-sm font-medium hover:bg-green-100 flex items-center justify-center gap-1 transition-colors"
      >
        Voir profil <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  )
}
