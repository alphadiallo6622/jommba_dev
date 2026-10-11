'use client'

import { useEffect, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { AlertTriangle, RotateCw } from 'lucide-react'
import Script from 'next/script'

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string
          callback: (token: string) => void
          'error-callback'?: () => void
          'expired-callback'?: () => void
        }
      ) => string
      reset: (widgetId: string) => void
    }
  }
}

export function TurnstileWidget({
  onVerify,
  onExpire,
  resetKey = 0,
}: {
  onVerify: (token: string) => void
  onExpire: () => void
  /** Incrémenter cette valeur redemande un challenge : un token Turnstile est
   *  à usage unique, sans reset l'utilisateur ne peut plus resoumettre. */
  resetKey?: number
}) {
  const t = useTranslations('auth.signup')
  const containerRef = useRef<HTMLDivElement>(null)
  const widgetIdRef   = useRef<string | null>(null)
  // Turnstile a renvoyé error-callback : on masque son bloc brut (« Impossible
  // de se connecter au site web ») et on affiche notre propre message + reprise.
  const [failed, setFailed] = useState(false)

  const render = () => {
    if (!containerRef.current || !window.turnstile || widgetIdRef.current) return
    widgetIdRef.current = window.turnstile.render(containerRef.current, {
      sitekey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY as string,
      callback: token => {
        setFailed(false)
        onVerify(token)
      },
      'error-callback': () => {
        setFailed(true)
        onExpire()
      },
      'expired-callback': onExpire,
    })
  }

  useEffect(() => {
    if (window.turnstile) render()
  }, [])

  const reset = () => {
    if (widgetIdRef.current && window.turnstile) {
      setFailed(false)
      window.turnstile.reset(widgetIdRef.current)
    }
  }

  useEffect(() => {
    if (resetKey > 0) reset()
  }, [resetKey])

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        strategy="afterInteractive"
        onLoad={render}
      />

      {/* Le conteneur reste monté (Turnstile en a besoin) mais on le masque
          quand il échoue pour cacher le bloc d'erreur Cloudflare. */}
      <div ref={containerRef} className={failed ? 'hidden' : undefined} />

      {failed && (
        <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <div className="flex-1 space-y-2">
            <p className="text-xs text-amber-800 leading-relaxed">{t('turnstileError')}</p>
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 hover:text-amber-900 transition-colors"
            >
              <RotateCw className="w-3.5 h-3.5" />
              {t('turnstileRetry')}
            </button>
          </div>
        </div>
      )}
    </>
  )
}
