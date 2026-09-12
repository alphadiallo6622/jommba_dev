'use client'

import { useState } from 'react'
import { Send, Mic, Trash2, Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { useVoiceRecorder, type RecorderError } from '@/lib/use-voice-recorder'
import { VOICE_MIN_MS, VOICE_MAX_MS, formatDuration } from '@/lib/supabase/voice-service'

type Props = {
  onSend: (text: string) => void
  /** Envoi d'un vocal — réservé aux Premium (la policy RLS le vérifie aussi). */
  onSendVoice: (blob: Blob, durationMs: number) => Promise<void>
  isPremium: boolean
}

export default function MessageInput({ onSend, onSendVoice, isPremium }: Props) {
  const t = useTranslations('dashboard.messages')
  const [text, setText]       = useState('')
  const [sending, setSending] = useState(false)

  const handleSend = () => {
    if (!text.trim()) return
    onSend(text.trim())
    setText('')
  }

  const handleRecorded = async (blob: Blob, durationMs: number) => {
    // Un appui trop court est un faux départ, pas un message.
    if (durationMs < VOICE_MIN_MS) {
      toast.info(t('voice.tooShort'))
      return
    }
    setSending(true)
    try {
      await onSendVoice(blob, durationMs)
    } finally {
      setSending(false)
    }
  }

  const handleRecorderError = (error: RecorderError) => {
    toast.error(t(error === 'denied' ? 'voice.denied' : error === 'unsupported' ? 'voice.unsupported' : 'voice.failed'))
  }

  const recorder = useVoiceRecorder({
    onComplete: handleRecorded,
    onError:    handleRecorderError,
  })

  const isRecording = recorder.status === 'recording'
  const remaining   = Math.max(0, VOICE_MAX_MS - recorder.elapsed)

  // ── Barre d'enregistrement ──────────────────────────────────────────────────
  if (isRecording) {
    return (
      <div className="px-3 sm:px-4 py-3 bg-white border-t border-gray-100 shrink-0">
        <div className="w-full flex items-center gap-2">
          <button
            onClick={recorder.cancel}
            aria-label={t('voice.cancel')}
            className="w-10 h-10 rounded-full bg-gray-100 text-gray-500 hover:bg-red-50 hover:text-red-500 flex items-center justify-center shrink-0 active:scale-95 transition-all"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          <div className="flex-1 min-w-0 flex items-center gap-2.5 px-4 py-2.5 bg-red-50 border border-red-100 rounded-full">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shrink-0" />
            <span className="text-sm font-medium text-red-600 tabular-nums shrink-0">
              {formatDuration(recorder.elapsed)}
            </span>
            <span className="text-xs text-red-400 truncate">
              {t('voice.recording')}
            </span>
            <span className="ml-auto text-[10px] text-red-400 tabular-nums shrink-0">
              −{formatDuration(remaining)}
            </span>
          </div>

          <button
            onClick={recorder.stop}
            aria-label={t('voice.send')}
            className="w-11 h-11 rounded-full bg-gradient-to-br from-[#10B981] to-[#059669] text-white flex items-center justify-center shrink-0 shadow-[0_4px_14px_-4px_rgba(16,185,129,0.8)] hover:brightness-105 active:scale-95 transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    )
  }

  // ── Barre normale ───────────────────────────────────────────────────────────
  return (
    <div className="px-3 sm:px-4 py-3 bg-white border-t border-gray-100 shrink-0">
      <div className="w-full flex items-center gap-2">

        {/* Voice button — premium only */}
        {isPremium && (
          <button
            onClick={recorder.start}
            disabled={sending || recorder.status === 'requesting'}
            aria-label={t('voice.record')}
            title={t('voice.record')}
            className="w-10 h-10 rounded-full bg-gray-100 text-gray-500 hover:bg-[#E1F5EE] hover:text-[#047857] flex items-center justify-center shrink-0 active:scale-95 transition-all disabled:opacity-60"
          >
            {sending || recorder.status === 'requesting'
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <Mic className="w-4 h-4" />}
          </button>
        )}

        {/* Text input */}
        <input
          type="text"
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder={t('input.placeholder')}
          className="flex-1 min-w-0 px-4 py-3 bg-gray-100 border border-transparent rounded-full text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:bg-white focus:border-[#10B981]/40 focus:ring-4 focus:ring-[#10B981]/10 transition-all"
        />

        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={!text.trim()}
          className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 transition-all ${
            text.trim()
              ? 'bg-gradient-to-br from-[#10B981] to-[#059669] text-white shadow-[0_4px_14px_-4px_rgba(16,185,129,0.8)] hover:brightness-105 active:scale-95'
              : 'bg-gray-100 text-gray-300 cursor-not-allowed'
          }`}
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
