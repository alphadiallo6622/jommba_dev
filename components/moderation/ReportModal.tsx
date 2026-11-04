'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Flag, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/components/providers/AuthProvider'
import { reportUser, REPORT_REASONS, type ReportReasonId } from '@/lib/supabase/moderation-service'
import { cn } from '@/lib/utils'

type Props = {
  /** Prénom affiché dans le titre. */
  profileName: string
  /** `user_id` du membre signalé. */
  reportedUserId: string
  onClose: () => void
  /** Appelé après un envoi réussi (fermeture d'un menu parent, par ex.). */
  onSent?: () => void
}

/** Longueur minimale du commentaire : un signalement sans explication ne permet
 *  pas à la modération de trancher, c'est le point de départ de toute décision. */
const MIN_COMMENT = 10
const MAX_COMMENT = 600

export default function ReportModal({ profileName, reportedUserId, onClose, onSent }: Props) {
  const t = useTranslations('dashboard.explorer.report')
  const { user } = useAuth()
  const [selected, setSelected] = useState<ReportReasonId | null>(null)
  const [description, setDescription] = useState('')
  const [pending, setPending] = useState(false)

  const comment = description.trim()
  const canSubmit = selected !== null && comment.length >= MIN_COMMENT && !pending

  const handleSubmit = async () => {
    if (!canSubmit) return
    if (!user) { toast.error(t('error')); return }
    setPending(true)
    const ok = await reportUser(user.id, reportedUserId, selected, comment)
    setPending(false)
    if (!ok) { toast.error(t('error')); return }
    toast.success(t('sent'))
    onSent?.()
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-6 animate-overlay-in"
      style={{ background: 'rgba(0,0,0,0.45)' }}
      onClick={pending ? undefined : onClose}
    >
      <div
        className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl space-y-5 animate-modal-in max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Icon + Title */}
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
            <Flag className="w-5 h-5 text-amber-500" />
          </div>
          <h2 className="text-lg font-bold text-gray-900">{t('title', { name: profileName })}</h2>
          <p className="text-xs text-gray-500 leading-relaxed">{t('intro')}</p>
        </div>

        {/* Reason pills */}
        <div className="grid grid-cols-2 gap-2">
          {REPORT_REASONS.map(({ id, key, emoji }) => (
            <button
              key={id}
              type="button"
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

        {/* Description — obligatoire : c'est ce que lit la modération. */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-gray-700">
            {t('commentLabel')}
          </label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value.slice(0, MAX_COMMENT))}
            placeholder={t('placeholder')}
            rows={4}
            className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200/60 transition-all"
          />
          <div className="flex items-center justify-between text-[11px]">
            <span className={cn(comment.length > 0 && comment.length < MIN_COMMENT ? 'text-amber-600' : 'text-gray-400')}>
              {comment.length < MIN_COMMENT
                ? t('commentHint', { count: MIN_COMMENT })
                : t('commentOk')}
            </span>
            <span className="text-gray-400">{comment.length}/{MAX_COMMENT}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={pending}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            {t('cancel')}
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="flex-1 py-2.5 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: '#D97706' }}
          >
            {pending
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <Flag className="w-4 h-4" />}
            {t('submit')}
          </button>
        </div>
      </div>
    </div>
  )
}
