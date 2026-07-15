'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Flag } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

type Props = {
  profileName: string
  onClose: () => void
}

const REASONS = [
  { id: 'fausse_photo', key: 'fakePhoto',     emoji: '📷' },
  { id: 'faux_nom',     key: 'fakeName',      emoji: '👤' },
  { id: 'inapproprie',  key: 'inappropriate', emoji: '⚠️' },
  { id: 'arnaque',      key: 'scam',          emoji: '🔴' },
  { id: 'harcelement',  key: 'harassment',    emoji: '🚫' },
  { id: 'autre',        key: 'other',         emoji: '🏷️' },
] as const

export default function ReportModal({ profileName, onClose }: Props) {
  const t = useTranslations('dashboard.explorer.report')
  const [selected, setSelected] = useState<string | null>(null)
  const [description, setDescription] = useState('')

  const handleSubmit = () => {
    toast.success(t('sent'))
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-6"
      style={{ background: 'rgba(0,0,0,0.45)' }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl space-y-5"
        onClick={e => e.stopPropagation()}
      >
        {/* Icon + Title */}
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
            <Flag className="w-5 h-5 text-amber-500" />
          </div>
          <h2 className="text-lg font-bold text-gray-900">{t('title', { name: profileName })}</h2>
        </div>

        {/* Reason pills */}
        <div className="grid grid-cols-2 gap-2">
          {REASONS.map(({ id, key, emoji }) => (
            <button
              key={id}
              onClick={() => setSelected(selected === id ? null : id)}
              className={cn(
                'flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all text-left',
                selected === id
                  ? 'border-amber-500 bg-amber-50 text-amber-700'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-amber-300 hover:bg-amber-50/40',
              )}
            >
              <span className="text-base leading-none">{emoji}</span>
              {t(`reasons.${key}`)}
            </button>
          ))}
        </div>

        {/* Description */}
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder={t('placeholder')}
          rows={3}
          className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200/60 transition-all"
        />

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
          >
            {t('cancel')}
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 py-2.5 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
            style={{ background: '#D97706' }}
          >
            <Flag className="w-4 h-4" />
            {t('submit')}
          </button>
        </div>
      </div>
    </div>
  )
}
