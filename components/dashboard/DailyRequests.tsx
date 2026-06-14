'use client'

import { Send } from 'lucide-react'
import { useCurrentUser } from '@/lib/use-current-user'

export default function DailyRequests() {
  const { dailyRequests } = useCurrentUser()
  const { used, total } = dailyRequests
  const remaining = total - used
  const pct = Math.round((remaining / total) * 100)

  return (
    <div className="bg-white rounded-lg p-4">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <Send className="w-4 h-4 text-emerald-500 shrink-0" />
          <div>
            <p className="font-semibold text-gray-900 text-sm">Demandes aujourd&rsquo;hui</p>
            <p className="text-xs text-gray-400">{total} demandes disponibles aujourd&rsquo;hui</p>
          </div>
        </div>
        <span className="font-bold text-emerald-500 text-sm">{remaining}/{total}</span>
      </div>

      <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-emerald-500 rounded-full transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
