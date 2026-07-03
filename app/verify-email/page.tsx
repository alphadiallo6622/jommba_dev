'use client'

import { useState, useEffect, useRef, type ClipboardEvent, type KeyboardEvent } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Heart, AlertCircle, RefreshCw, ArrowLeft, Loader2, Mail } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Suspense } from 'react'
import { cn } from '@/lib/utils'

const CODE_LENGTH = 6

function VerifyEmailContent() {
  const router         = useRouter()
  const searchParams   = useSearchParams()
  const emailParam     = searchParams.get('email') ?? ''

  const [digits, setDigits]       = useState<string[]>(Array(CODE_LENGTH).fill(''))
  const [verifying, setVerifying] = useState(false)
  const [resending, setResending] = useState(false)
  const [countdown, setCountdown] = useState(60)
  const inputsRef = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (countdown <= 0) return
    const t = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [countdown])

  useEffect(() => {
    inputsRef.current[0]?.focus()
  }, [])

  const submitCode = async (code: string) => {
    if (!emailParam) {
      toast.error('Email introuvable. Retourne à l\'inscription.')
      return
    }
    setVerifying(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.verifyOtp({
        email: emailParam,
        token: code,
        type: 'signup',
      })
      if (error) {
        toast.error(error.message)
        setDigits(Array(CODE_LENGTH).fill(''))
        inputsRef.current[0]?.focus()
      } else {
        toast.success('Email vérifié ! Bienvenue sur Jommba.')
        router.replace('/onboarding')
      }
    } finally {
      setVerifying(false)
    }
  }

  const handleChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1)
    const next = [...digits]
    next[index] = digit
    setDigits(next)

    if (digit && index < CODE_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus()
    }

    const code = next.join('')
    if (code.length === CODE_LENGTH) {
      submitCode(code)
    }
  }

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, CODE_LENGTH)
    if (!pasted) return
    e.preventDefault()
    const next = Array(CODE_LENGTH).fill('')
    pasted.split('').forEach((d, i) => { next[i] = d })
    setDigits(next)
    const lastIndex = Math.min(pasted.length, CODE_LENGTH) - 1
    inputsRef.current[lastIndex]?.focus()
    if (pasted.length === CODE_LENGTH) {
      submitCode(pasted)
    }
  }

  const handleResend = async () => {
    if (!emailParam) {
      toast.error('Email introuvable. Retourne à l\'inscription.')
      return
    }
    setResending(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.resend({ type: 'signup', email: emailParam })
      if (error) {
        toast.error(error.message)
      } else {
        setCountdown(60)
        setDigits(Array(CODE_LENGTH).fill(''))
        inputsRef.current[0]?.focus()
        toast.success('Code renvoyé !')
      }
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm space-y-8">

        {/* Logo */}
        <div className="flex items-center gap-2 justify-center">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#10B981' }}>
            <Heart className="w-5 h-5 text-white fill-white" />
          </div>
          <span className="text-xl font-serif font-bold" style={{ color: '#064E3B' }}>Jommba</span>
        </div>

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: '#D1FAE5' }}>
            <Mail className="w-8 h-8 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-serif font-bold text-gray-900">Entre ton code</h1>
          <p className="text-sm text-gray-500 leading-relaxed">
            Un code à 6 chiffres a été envoyé à<br />
            <span className="font-semibold text-gray-700">{emailParam || 'ton adresse email'}</span>
          </p>
        </div>

        {/* OTP inputs */}
        <div className="flex items-center justify-center gap-2">
          {digits.map((digit, i) => (
            <input
              key={i}
              ref={el => { inputsRef.current[i] = el }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              disabled={verifying}
              onChange={e => handleChange(i, e.target.value)}
              onKeyDown={e => handleKeyDown(i, e)}
              onPaste={handlePaste}
              className={cn(
                'w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-bold rounded-xl border text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all disabled:opacity-60',
                digit ? 'border-emerald-400' : 'border-gray-200 focus:border-emerald-500',
              )}
            />
          ))}
        </div>

        {verifying && (
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <Loader2 className="w-4 h-4 animate-spin" />
            Vérification en cours…
          </div>
        )}

        {/* Spam warning */}
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
          <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700 leading-relaxed">
            Si tu ne vois pas l&rsquo;email, vérifie ton dossier <strong>Spam</strong> ou{' '}
            <strong>Courrier indésirable</strong>. Le code est valable <strong>1 heure</strong>.
          </p>
        </div>

        {/* Resend */}
        <div className="text-center">
          {countdown > 0 ? (
            <p className="text-sm text-gray-400">
              Renvoyer le code dans{' '}
              <span className="font-semibold text-gray-600">{countdown}s</span>
            </p>
          ) : (
            <button
              onClick={handleResend}
              disabled={resending}
              className="inline-flex items-center gap-2 text-sm font-semibold transition-colors disabled:opacity-60"
              style={{ color: '#10B981' }}
            >
              {resending
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <RefreshCw className="w-4 h-4" />
              }
              Renvoyer le code
            </button>
          )}
        </div>

        {/* Back link */}
        <div className="text-center">
          <Link
            href="/inscription"
            className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Modifier mon adresse email
          </Link>
        </div>

      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailContent />
    </Suspense>
  )
}
