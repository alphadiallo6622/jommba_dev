'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { PREFERRED_MIMES, VOICE_MAX_MS } from '@/lib/supabase/voice-service'

export type RecorderStatus = 'idle' | 'requesting' | 'recording'

export type RecorderError = 'unsupported' | 'denied' | 'failed'

type Options = {
  /** Appelé avec l'enregistrement terminé. Non appelé si l'utilisateur annule. */
  onComplete: (blob: Blob, durationMs: number) => void
  onError?:   (error: RecorderError) => void
  maxMs?:     number
}

/** Choisit le meilleur format que ce navigateur sait enregistrer. undefined
 *  laisse MediaRecorder décider (dernier recours). */
function pickMime(): string | undefined {
  if (typeof MediaRecorder === 'undefined') return undefined
  return PREFERRED_MIMES.find(m => MediaRecorder.isTypeSupported(m))
}

/** Enregistrement audio via les seules API du navigateur (getUserMedia +
 *  MediaRecorder). La durée vient du chronomètre, pas du fichier : les WebM
 *  produits par MediaRecorder n'ont pas toujours de métadonnée de durée. */
export function useVoiceRecorder({ onComplete, onError, maxMs = VOICE_MAX_MS }: Options) {
  const [status,  setStatus]  = useState<RecorderStatus>('idle')
  const [elapsed, setElapsed] = useState(0)

  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef   = useRef<Blob[]>([])
  const streamRef   = useRef<MediaStream | null>(null)
  const startedAt   = useRef(0)
  const tickRef     = useRef<ReturnType<typeof setInterval>  | null>(null)
  const limitRef    = useRef<ReturnType<typeof setTimeout>   | null>(null)
  // Annulation : on jette l'enregistrement au lieu de le remonter.
  const discardRef  = useRef(false)

  const cleanup = useCallback(() => {
    if (tickRef.current)  { clearInterval(tickRef.current); tickRef.current  = null }
    if (limitRef.current) { clearTimeout(limitRef.current);  limitRef.current = null }
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current  = null
    recorderRef.current = null
    chunksRef.current   = []
    setStatus('idle')
    setElapsed(0)
  }, [])

  // Le micro ne doit pas rester ouvert si l'écran est quitté en cours
  // d'enregistrement.
  useEffect(() => cleanup, [cleanup])

  const start = useCallback(async () => {
    if (status !== 'idle') return

    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      onError?.('unsupported')
      return
    }

    setStatus('requesting')
    let stream: MediaStream
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    } catch (err) {
      // NotAllowedError = refus explicite ; le reste est un échec matériel.
      const denied = err instanceof DOMException && (err.name === 'NotAllowedError' || err.name === 'SecurityError')
      setStatus('idle')
      onError?.(denied ? 'denied' : 'failed')
      return
    }

    try {
      const mimeType = pickMime()
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined)

      chunksRef.current  = []
      discardRef.current = false
      streamRef.current  = stream
      recorderRef.current = recorder

      recorder.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data) }

      recorder.onstop = () => {
        const duration = Date.now() - startedAt.current
        const chunks   = chunksRef.current
        const discard  = discardRef.current
        // Le type du recorder est la source de vérité : il peut différer du
        // format demandé.
        const type = recorder.mimeType || mimeType || 'audio/webm'
        cleanup()
        if (!discard && chunks.length > 0) {
          onComplete(new Blob(chunks, { type }), duration)
        }
      }

      startedAt.current = Date.now()
      recorder.start()
      setStatus('recording')
      setElapsed(0)

      tickRef.current  = setInterval(() => setElapsed(Date.now() - startedAt.current), 100)
      // Coupure automatique : la contrainte SQL refuse au-delà de la limite.
      limitRef.current = setTimeout(() => {
        if (recorderRef.current?.state === 'recording') recorderRef.current.stop()
      }, maxMs)
    } catch (err) {
      console.error('[voice] recorder start error:', err)
      cleanup()
      onError?.('failed')
    }
  }, [status, maxMs, onComplete, onError, cleanup])

  /** Termine l'enregistrement et remonte le blob via onComplete. */
  const stop = useCallback(() => {
    if (recorderRef.current?.state === 'recording') {
      discardRef.current = false
      recorderRef.current.stop()
    }
  }, [])

  /** Termine l'enregistrement et jette le résultat. */
  const cancel = useCallback(() => {
    if (recorderRef.current?.state === 'recording') {
      discardRef.current = true
      recorderRef.current.stop()
    } else {
      cleanup()
    }
  }, [cleanup])

  return { status, elapsed, start, stop, cancel, maxMs }
}
