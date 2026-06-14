'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Heart, AlertCircle, RefreshCw, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { mockVerifyOtp, mockSendOtp } from '@/lib/mock'
import Link from 'next/link'

const OTP_LENGTH = 6

export default function VerifyEmailPage() {
  const router = useRouter()
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''))
  const [loading, setLoading]       = useState(false)
  const [resending, setResending]   = useState(false)
  const [countdown, setCountdown]   = useState(60)
  const [verified, setVerified]     = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  /* Countdown timer for resend */
  useEffect(() => {
    if (countdown <= 0) return
    const t = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [countdown])

  /* Auto-validate when all 6 digits filled */
  useEffect(() => {
    const code = digits.join('')
    if (code.length === OTP_LENGTH && !loading) {
      handleVerify(code)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [digits])

  const handleVerify = async (code: string) => {
    setLoading(true)
    try {
      const res = await mockVerifyOtp(code)
      if (res.success) {
        setVerified(true)
        toast.success('Email vérifié ! Bienvenue sur Jommba.')
        setTimeout(() => router.push('/onboarding'), 1200)
      } else {
        toast.error('Code incorrect. Essaie à nouveau.')
        setDigits(Array(OTP_LENGTH).fill(''))
        inputRefs.current[0]?.focus()
      }
    } finally {
      setLoading(false)
    }
  }

  const handleInput = (i: number, value: string) => {
    const char = value.replace(/\D/g, '').slice(-1)
    const next = [...digits]
    next[i] = char
    setDigits(next)
    if (char && i < OTP_LENGTH - 1) {
      inputRefs.current[i + 1]?.focus()
    }
  }

  const handleKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) {
      const next = [...digits]
      next[i - 1] = ''
      setDigits(next)
      inputRefs.current[i - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH)
    if (!pasted) return
    const next = Array(OTP_LENGTH).fill('')
    pasted.split('').forEach((c, i) => { next[i] = c })
    setDigits(next)
    const nextFocus = Math.min(pasted.length, OTP_LENGTH - 1)
    inputRefs.current[nextFocus]?.focus()
  }

  const handleResend = async () => {
    setResending(true)
    await mockSendOtp('email@exemple.com')
    setResending(false)
    setCountdown(60)
    setDigits(Array(OTP_LENGTH).fill(''))
    inputRefs.current[0]?.focus()
    toast.success('Nouveau code envoyé !')
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
            <span className="text-3xl">📩</span>
          </div>
          <h1 className="text-2xl font-serif font-bold text-gray-900">Vérifie ta boîte mail</h1>
          <p className="text-sm text-gray-500 leading-relaxed">
            Un code à 6 chiffres a été envoyé à<br />
            <span className="font-semibold text-gray-700">ton.email@exemple.com</span>
          </p>
        </div>

        {/* OTP inputs */}
        <div className="flex gap-2.5 justify-center" onPaste={handlePaste}>
          {Array.from({ length: OTP_LENGTH }).map((_, i) => (
            <input
              key={i}
              ref={el => { inputRefs.current[i] = el }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digits[i]}
              onChange={e => handleInput(i, e.target.value)}
              onKeyDown={e => handleKeyDown(i, e)}
              disabled={loading || verified}
              className={[
                'w-12 h-14 text-center text-xl font-bold rounded-xl border-2 transition-all focus:outline-none',
                verified
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                  : digits[i]
                    ? 'border-emerald-500 bg-white text-gray-900'
                    : 'border-gray-200 bg-white text-gray-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20',
                loading ? 'opacity-60' : '',
              ].join(' ')}
            />
          ))}
        </div>

        {/* Loading / verified state */}
        {loading && (
          <div className="flex items-center justify-center gap-2 text-sm text-emerald-600">
            <Loader2 className="w-4 h-4 animate-spin" />
            Vérification en cours…
          </div>
        )}
        {verified && (
          <div className="flex items-center justify-center gap-2 text-sm text-emerald-600 font-semibold">
            <CheckCircle2 className="w-5 h-5" />
            Email vérifié ! Redirection…
          </div>
        )}

        {/* Spam warning */}
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
          <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700 leading-relaxed">
            Si tu ne vois pas l&rsquo;email, vérifie ton dossier <strong>Spam</strong> ou{' '}
            <strong>Courrier indésirable</strong>. Le code est valable{' '}
            <strong>1 heure</strong>.
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
