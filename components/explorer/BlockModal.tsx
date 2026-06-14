'use client'

import { AlertTriangle, ShieldOff } from 'lucide-react'
import { toast } from 'sonner'

type Props = {
  profileName: string
  onClose: () => void
}

export default function BlockModal({ profileName, onClose }: Props) {
  const handleBlock = () => {
    toast.success(`${profileName} a été bloqué. Tu ne verras plus ce profil.`)
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-6"
      style={{ background: 'rgba(0,0,0,0.45)' }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl space-y-4"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-500" />
          </div>
          <h2 className="text-lg font-bold text-gray-900">Bloquer {profileName} ?</h2>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-500 leading-relaxed">
          Cette personne ne pourra plus voir ton profil ni te contacter.
        </p>

        {/* Actions */}
        <div className="flex gap-3 pt-1">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleBlock}
            className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-semibold text-sm flex items-center justify-center gap-2 hover:bg-red-600 transition-colors"
          >
            <ShieldOff className="w-4 h-4" />
            Bloquer
          </button>
        </div>
      </div>
    </div>
  )
}
