'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mail, Heart, KeyRound, ArrowLeft, Loader2, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { Link } from '@/i18n/navigation'

function SidePanel() {
  const t = useTranslations('auth.forgotPassword')
  const tShared = useTranslations('auth.shared')

  return (
    <div
      className="hidden lg:flex flex-col justify-between p-10 text-white"
      style={{ background: 'linear-gradient(160deg, #10B981 0%, #064E3B 100%)' }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2">
        <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
          <Heart className="w-5 h-5 text-white fill-white" />
        </div>
        <span className="text-xl font-serif font-bold">Jommba</span>
      </div>

      {/* Message */}
      <div className="space-y-5 text-center">
        <div className="w-16 h-16 rounded-full bg-white/15 flex items-center justify-center mx-auto">
          <KeyRound className="w-8 h-8 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-serif font-bold mb-3 leading-snug">
            {t('sideTitle')}
          </h2>
          <p className="text-sm text-white/80 leading-relaxed">
            {t('sideSubtitle')}
          </p>
        </div>
      </div>

      {/* Footer quote */}
      <div className="text-center bg-white/10 rounded-xl p-4">
        <p className="text-xs italic text-white/80 leading-relaxed">
          {tShared('quoteLove')}
        </p>
        <p className="text-xs text-emerald-300 font-semibold mt-1">{tShared('quoteLoveSource')}</p>
      </div>
    </div>
  )
}

export default function MotDePasseOubliePage() {
  const t = useTranslations('auth.forgotPassword')
  const tShared = useTranslations('auth.shared')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [sentEmail, setSentEmail] = useState('')

  const schema = z.object({
    email: z.email(t('errorEmailInvalid')),
  })
  type FormData = z.infer<typeof schema>

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/api/auth/callback?next=/reinitialiser-mot-de-passe`,
      })
      if (error) {
        console.error('[MotDePasseOublie] Supabase error:', JSON.stringify(error))
        toast.error(error.message || t('errorSendFailed'))
        return
      }
      setSentEmail(data.email)
      setSent(true)
    } catch (err) {
      console.error('[MotDePasseOublie] Exception inattendue:', err)
      toast.error(t('errorNetwork'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <SidePanel />

      {/* Right: form */}
      <div className="flex flex-col justify-center items-center px-6 py-12 bg-white">
        <div className="w-full max-w-sm space-y-7">
          {/* Logo mobile */}
          <div className="lg:hidden flex items-center gap-2 justify-center">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: '#10B981' }}>
              <Heart className="w-4 h-4 text-white fill-white" />
            </div>
            <span className="text-xl font-serif font-bold" style={{ color: '#064E3B' }}>Jommba</span>
          </div>

          {sent ? (
            <div className="text-center space-y-6">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto" style={{ background: '#D1FAE5' }}>
                <Mail className="w-8 h-8 text-emerald-600" />
              </div>
              <div>
                <h1 className="text-2xl font-serif font-bold text-gray-900">{t('sentTitle')}</h1>
                <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                  {t.rich('sentSubtitle', {
                    email: () => <span className="font-semibold text-gray-700">{sentEmail}</span>,
                  })}
                </p>
              </div>
              <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4 text-left">
                <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700 leading-relaxed">
                  {t.rich('sentHint', { strong: (chunks) => <strong>{chunks}</strong> })}
                </p>
              </div>
              <button
                onClick={() => setSent(false)}
                className="text-sm font-semibold"
                style={{ color: '#10B981' }}
              >
                {t('useAnotherEmail')}
              </button>
            </div>
          ) : (
            <>
              <div className="text-center">
                <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: '#D1FAE5' }}>
                  <Mail className="w-7 h-7 text-emerald-600" />
                </div>
                <h1 className="text-2xl font-serif font-bold text-gray-900">{t('title')}</h1>
                <p className="text-sm text-gray-500 mt-1">
                  {t('subtitle')}
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">{tShared('emailLabel')}</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      placeholder={tShared('emailPlaceholder')}
                      {...register('email')}
                      className={cn(
                        'w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all',
                        errors.email ? 'border-red-400' : 'border-gray-200 focus:border-emerald-500'
                      )}
                    />
                  </div>
                  {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-xl text-white font-semibold text-sm transition-opacity hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2"
                  style={{ background: '#10B981' }}
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {t('submit')}
                </button>
              </form>
            </>
          )}

          <p className="text-center text-xs text-gray-500">
            <Link href="/connexion" className="inline-flex items-center gap-1.5 font-semibold" style={{ color: '#10B981' }}>
              <ArrowLeft className="w-3.5 h-3.5" />
              {t('backToLogin')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
