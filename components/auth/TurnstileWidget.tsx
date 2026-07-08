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

export function TurnstileWidget({ onVerify, onExpire }: { onVerify: (token: string) => void; onExpire: () => void }) {
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
