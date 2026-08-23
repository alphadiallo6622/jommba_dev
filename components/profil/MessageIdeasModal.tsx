'use client'

import { useState, useEffect, useCallback } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { Sparkles, X, Copy, Check, Loader2, RefreshCw, Lightbulb } from 'lucide-react'
import { toast } from 'sonner'
import type { FullProfile } from '@/lib/mock-demandes'

type Idea = { tone: string; text: string; reason: string }

type Props = {
  profile: FullProfile
  onClose: () => void
}

// Couleur et emoji du badge selon le ton. Le ton est rédigé par le modèle dans
// la langue du membre : on indexe donc sur les libellés FR et EN.
const TONE_STYLE: Record<string, string> = {
  Curieux: 'bg-purple-50 text-purple-600',
  Curious: 'bg-purple-50 text-purple-600',
  Sincère: 'bg-blue-50 text-blue-600',
  Sincere: 'bg-blue-50 text-blue-600',
  Taquin: 'bg-amber-50 text-amber-600',
  Playful: 'bg-amber-50 text-amber-600',
}

const TONE_EMOJI: Record<string, string> = {
  Curieux: '🤔',
  Curious: '🤔',
  Sincère: '💚',
  Sincere: '💚',
  Taquin: '😄',
  Playful: '😄',
}

export default function MessageIdeasModal({ profile, onClose }: Props) {
  const t = useTranslations('dashboard.profil.ideas')
  const locale = useLocale()
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  const generate = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/message-ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile: {
            firstName: profile.firstName,
            age: profile.age,
            location: profile.location,
            tags: profile.tags,
            marriageVision: profile.marriageVision,
            seeking: profile.seeking,
            interests: profile.interests,
            qualities: profile.qualities,
          },
          locale,
        }),
      })
      const data = await res.json()
      if (!res.ok || !data.ideas) {
        throw new Error(data.error || t('genError'))
      }
      setIdeas(data.ideas)
    } catch (e) {
      setError(e instanceof Error ? e.message : t('unknownError'))
    } finally {
      setLoading(false)
    }
  }, [profile, t, locale])

  useEffect(() => { generate() }, [generate])

  const handleCopy = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedIndex(index)
      toast.success(t('copiedToast'))
      setTimeout(() => setCopiedIndex(null), 2000)
    } catch {
      toast.error(t('copyError'))
    }
  }

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/50 flex items-end md:items-center md:justify-center"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-t-2xl md:rounded-2xl w-full md:w-[480px] md:max-w-lg flex flex-col overflow-hidden"
        style={{ maxHeight: '88dvh' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Handle bar — mobile */}
        <div className="md:hidden flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* Header */}
        <div className="bg-[#10B981] px-5 py-4 shrink-0 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-white font-bold text-base leading-tight">{t('title')}</h2>
              <p className="text-white/80 text-xs">{t('personalizedFor', { name: profile.firstName })}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors shrink-0"
            aria-label={t('close')}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0 bg-gray-50/50">
          {loading && (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
              <Loader2 className="w-7 h-7 animate-spin text-[#10B981]" />
              <p className="text-sm text-gray-500">{t('generating')}</p>
            </div>
          )}

          {!loading && error && (
            <div className="flex flex-col items-center justify-center py-12 gap-4 text-center">
              <p className="text-sm text-gray-500">{error}</p>
              <button
                onClick={generate}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#10B981] text-white text-sm font-medium hover:bg-[#059669] transition-colors"
              >
                <RefreshCw className="w-4 h-4" /> {t('retry')}
              </button>
            </div>
          )}

          {!loading && !error && ideas.map((idea, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
              <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${TONE_STYLE[idea.tone] ?? 'bg-gray-100 text-gray-600'}`}>
                {TONE_EMOJI[idea.tone] ?? '✨'} {idea.tone}
              </span>
              <p className="text-sm text-gray-800 leading-relaxed mt-3">{idea.text}</p>
              <div className="flex items-center justify-between mt-3">
                <span className="text-[11px] text-gray-400 italic pr-3">{idea.reason}</span>
                <button
                  onClick={() => handleCopy(idea.text, i)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#10B981]/40 text-[#10B981] text-xs font-semibold hover:bg-[#E1F5EE] transition-colors shrink-0"
                >
                  {copiedIndex === i ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedIndex === i ? t('copied') : t('copy')}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer hint */}
        <div className="shrink-0 px-5 py-3 border-t border-gray-100 bg-white flex items-center justify-center gap-1.5 text-xs text-gray-400">
          <Lightbulb className="w-3.5 h-3.5" />
          {t('footerHint')}
        </div>
      </div>
    </div>
  )
}
