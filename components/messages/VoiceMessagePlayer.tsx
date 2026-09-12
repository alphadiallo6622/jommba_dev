'use client'

import { useState, useRef, useEffect } from 'react'
import { Play, Pause, Loader2, Mic, AlertCircle } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { getVoiceUrl, formatDuration } from '@/lib/supabase/voice-service'

type Props = {
  audioPath:  string
  durationMs: number
  isMine:     boolean
  /** Vocal encore en cours d'envoi : rien à écouter pour l'instant. */
  pending?:   boolean
}

export default function VoiceMessagePlayer({ audioPath, durationMs, isMine, pending = false }: Props) {
  const t = useTranslations('dashboard.messages.voice')
  const [playing, setPlaying] = useState(false)
  const [loading, setLoading] = useState(false)
  const [failed,  setFailed]  = useState(false)
  const [position, setPosition] = useState(0)

  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Libère l'élément audio si la bulle disparaît pendant la lecture.
  useEffect(() => () => {
    audioRef.current?.pause()
    audioRef.current = null
  }, [])

  const toggle = async () => {
    if (pending) return

    const existing = audioRef.current
    if (existing) {
      if (existing.paused) { void existing.play(); setPlaying(true) }
      else                 { existing.pause();    setPlaying(false) }
      return
    }

    // L'URL signée n'est demandée qu'au premier clic : inutile de signer tous
    // les vocaux d'un fil qu'on ne va pas forcément écouter.
    setLoading(true)
    setFailed(false)
    const url = await getVoiceUrl(audioPath)
    setLoading(false)
    if (!url) { setFailed(true); return }

    const audio = new Audio(url)
    audioRef.current = audio

    audio.addEventListener('timeupdate', () => setPosition(audio.currentTime * 1000))
    audio.addEventListener('ended', () => { setPlaying(false); setPosition(0) })
    audio.addEventListener('error', () => { setFailed(true); setPlaying(false) })

    try {
      await audio.play()
      setPlaying(true)
    } catch {
      // Format refusé par ce navigateur (ex. WebM/Opus sur un vieux Safari).
      setFailed(true)
      audioRef.current = null
    }
  }

  // La durée vient de la base : un WebM de MediaRecorder n'expose pas toujours
  // audio.duration (Infinity), on ne peut pas s'y fier pour la progression.
  const progress = durationMs > 0 ? Math.min(100, (position / durationMs) * 100) : 0
  const remaining = playing || position > 0 ? Math.max(0, durationMs - position) : durationMs

  const accent = isMine
    ? { btn: 'bg-white/20 text-white hover:bg-white/30', track: 'bg-white/25', fill: 'bg-white', text: 'text-white/80' }
    : { btn: 'bg-[#E1F5EE] text-[#047857] hover:bg-[#d1eee3]', track: 'bg-gray-200', fill: 'bg-[#10B981]', text: 'text-gray-400' }

  return (
    <div className="flex items-center gap-2.5 min-w-[190px] sm:min-w-[220px]">
      <button
        onClick={toggle}
        disabled={pending}
        aria-label={playing ? t('pause') : t('play')}
        className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-colors disabled:opacity-70 ${accent.btn}`}
      >
        {pending || loading
          ? <Loader2 className="w-4 h-4 animate-spin" />
          : failed
            ? <AlertCircle className="w-4 h-4" />
            : playing
              ? <Pause className="w-4 h-4" />
              : <Play className="w-4 h-4 translate-x-[1px]" />}
      </button>

      <div className="flex-1 min-w-0">
        <div className={`h-1.5 rounded-full overflow-hidden ${accent.track}`}>
          <div
            className={`h-full rounded-full ${accent.fill}`}
            style={{ width: `${progress}%`, transition: 'width 120ms linear' }}
          />
        </div>
        <div className={`flex items-center gap-1 mt-1 text-[10px] tabular-nums ${accent.text}`}>
          <Mic className="w-3 h-3 shrink-0" />
          <span>
            {failed
              ? t('playError')
              : pending
                ? t('sending')
                : formatDuration(remaining)}
          </span>
        </div>
      </div>
    </div>
  )
}
