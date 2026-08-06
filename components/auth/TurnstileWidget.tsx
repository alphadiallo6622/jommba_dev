'use client'

import { useEffect, useRef } from 'react'
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
  const containerRef = useRef<HTMLDivElement>(null)
  const widgetIdRef   = useRef<string | null>(null)

  const render = () => {
    if (!containerRef.current || !window.turnstile || widgetIdRef.current) return
    widgetIdRef.current = window.turnstile.render(containerRef.current, {
      sitekey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY as string,
      callback: onVerify,
      'error-callback': onExpire,
      'expired-callback': onExpire,
    })
  }

  useEffect(() => {
    if (window.turnstile) render()
  }, [])

  useEffect(() => {
    if (resetKey > 0 && widgetIdRef.current && window.turnstile) {
      window.turnstile.reset(widgetIdRef.current)
    }
  }, [resetKey])

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        strategy="afterInteractive"
        onLoad={render}
      />
      <div ref={containerRef} />
    </>
  )
}
