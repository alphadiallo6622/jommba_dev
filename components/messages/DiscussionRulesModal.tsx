'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Shield, AlertTriangle, Ban, Heart } from 'lucide-react'

type Props = {
  firstName: string
  lastInitial: string
  onConfirm: () => void
  onClose: () => void
}

export default function DiscussionRulesModal({ firstName, lastInitial, onConfirm, onClose }: Props) {
  const t = useTranslations('dashboard.messages.rules')
  const [accepted, setAccepted] = useState(false)

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-end md:items-center md:justify-center pb-16 md:pb-0"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-t-2xl md:rounded-2xl w-full md:w-[460px] md:max-w-lg flex flex-col"
        style={{ maxHeight: '90dvh' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Handle bar — mobile only */}
        <div className="md:hidden flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* Green header */}
        <div className="bg-[#10B981] px-5 py-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-white font-bold text-base">{t('title')}</h2>
              <p className="text-white/80 text-xs">
                {t('beforeWriting', { name: `${firstName} ${lastInitial}.` })}
              </p>
            </div>
          </div>
        </div>

        {/* Scrollable rules content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3 min-h-0">

          {/* Warning */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
            <p className="text-amber-700 font-semibold text-sm flex items-center gap-1.5 mb-1">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              {t('warningTitle')}
            </p>
            <p className="text-amber-600 text-xs leading-relaxed">
              {t.rich('warningBody', { b: (chunks) => <strong>{chunks}</strong> })}
            </p>
          </div>

          {/* Rule 1 */}
          <div className="flex gap-3 py-1">
            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0">
              <Ban className="w-4 h-4 text-red-500" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">
                {t('rule1Title')}
              </p>
              <p className="text-gray-400 text-xs leading-relaxed mt-0.5">
                {t('rule1Desc')}
              </p>
            </div>
          </div>

          {/* Rule 2 */}
          <div className="flex gap-3 py-1">
            <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center shrink-0">
              <Heart className="w-4 h-4 text-pink-500" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">{t('rule2Title')}</p>
              <p className="text-gray-400 text-xs leading-relaxed mt-0.5">
                {t('rule2Desc')}
              </p>
            </div>
          </div>

          {/* Rule 3 — highlighted */}
          <div className="bg-red-50 border border-red-100 rounded-xl p-3 flex gap-2.5">
            <Heart className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-red-500 font-semibold text-sm">
                {t('rule3Title')}
              </p>
              <p className="text-red-400 text-xs leading-relaxed mt-0.5">
                {t('rule3Desc')}
              </p>
            </div>
          </div>
        </div>

        {/* Sticky bottom: checkbox + CTA (always visible) */}
        <div className="shrink-0 px-5 pt-3 pb-6 bg-white border-t border-gray-100 space-y-3">
          <label className="flex items-center gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={accepted}
              onChange={e => setAccepted(e.target.checked)}
              className="w-4 h-4 rounded accent-[#10B981]"
            />
            <span className="text-gray-700 text-sm">
              {t('accept')}
            </span>
          </label>

          <button
            onClick={accepted ? onConfirm : undefined}
            disabled={!accepted}
            className={`w-full py-3.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${
              accepted
                ? 'bg-[#10B981] text-white hover:bg-[#059669]'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            <Shield className="w-4 h-4" />
            {accepted ? t('confirmEnabled') : t('confirmDisabled')}
          </button>
        </div>
      </div>
    </div>
  )
}
