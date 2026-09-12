'use client'

import { Loader2 } from 'lucide-react'
import type { ReactNode } from 'react'

type Props = {
  icon:         ReactNode
  title:        string
  description:  string
  confirmLabel: string
  cancelLabel:  string
  tone?:        'danger' | 'warning'
  pending?:     boolean
  onConfirm:    () => void
  onCancel:     () => void
}

const TONES = {
  danger:  { bubble: 'bg-red-50 text-red-500',     cta: 'bg-red-500 hover:bg-red-600'     },
  warning: { bubble: 'bg-amber-50 text-amber-500', cta: 'bg-amber-500 hover:bg-amber-600' },
}

/** Feuille de confirmation pour une action de modération (blocage, signalement).
 *  Même gabarit que DiscussionRulesModal : bottom-sheet sur mobile, carte
 *  centrée sur desktop. */
export default function ConfirmActionModal({
  icon, title, description, confirmLabel, cancelLabel,
  tone = 'danger', pending = false, onConfirm, onCancel,
}: Props) {
  const styles = TONES[tone]

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-end md:items-center md:justify-center pb-16 md:pb-0"
      onClick={pending ? undefined : onCancel}
    >
      <div
        className="bg-white rounded-t-2xl md:rounded-2xl w-full md:w-[420px] p-5"
        onClick={e => e.stopPropagation()}
      >
        {/* Handle bar — mobile only */}
        <div className="md:hidden flex justify-center -mt-2 mb-3">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${styles.bubble}`}>
          {icon}
        </div>

        <h2 className="text-gray-900 font-bold text-base leading-snug">{title}</h2>
        <p className="text-gray-500 text-sm leading-relaxed mt-1.5">{description}</p>

        <div className="flex gap-2 mt-5">
          <button
            onClick={onCancel}
            disabled={pending}
            className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-700 text-sm font-semibold hover:bg-gray-200 disabled:opacity-50 transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={pending}
            className={`flex-1 py-3 rounded-xl text-white text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-60 transition-colors ${styles.cta}`}
          >
            {pending && <Loader2 className="w-4 h-4 animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
