'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mail, Lock, Eye, EyeOff, Heart, Shield, Users, CheckCircle2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { Link } from '@/i18n/navigation'

function SidePanel() {
  const t = useTranslations('auth.shared')

  const reasons = [
    { icon: CheckCircle2, text: t('reason1') },
    { icon: Shield, text: t('reason2') },
    { icon: Users, text: t('reason3') },
  ]

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

      {/* Quote */}
      <div className="space-y-6">
        <div className="text-center">
          <p className="font-arabic text-3xl leading-loose text-white/90 mb-3">
            وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُم
          </p>
          <p className="text-sm italic text-white/80 leading-relaxed">
            {t('quoteTranquility')}
          </p>
        </div>

        <div className="space-y-3 mt-4">
          <p className="text-xs font-bold uppercase tracking-widest text-white/60">{t('whyJommba')}</p>
          {reasons.map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-2.5 text-sm text-white/90">
              <Icon className="w-4 h-4 text-emerald-300 shrink-0" />
              {text}
            </div>
          ))}
        </div>
      </div>

      {/* Footer quote */}
      <div className="text-center bg-white/10 rounded-xl p-4">
        <p className="text-xs italic text-white/80 leading-relaxed">
          {t('quoteGarment')}
        </p>
        <p className="text-xs text-emerald-300 font-semibold mt-1">{t('quoteGarmentSource')}</p>
      </div>
    </div>
  )
}

export default function ConnexionPage() {
  const router = useRouter()
  const t = useTranslations('auth.login')
  const tShared = useTranslations('auth.shared')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const schema = z.object({
    email: z.email(t('errorEmailInvalid')),
    password: z.string().min(1, t('errorPasswordRequired')),
  })
  type FormData = z.infer<typeof schema>

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      const supabase = createClient()
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })
      console.log('[Connexion] response:', JSON.stringify({ user: authData?.user?.email, session: !!authData?.session, error }))
      if (error) {
        console.error('[Connexion] Supabase error:', JSON.stringify(error))
        const isInvalidCreds =
          error.code === 'invalid_credentials' ||
          (error.message ?? '').toLowerCase().includes('invalid login credentials') ||
          (error.message ?? '').toLowerCase().includes('invalid_credentials')
        toast.error(isInvalidCreds ? t('errorInvalidCredentials') : (error.message || t('errorGeneric')))
        return
      }
      router.push('/dashboard')
      router.refresh()
    } catch (err) {
      console.error('[Connexion] Exception inattendue:', err)
      toast.error(t('errorNetwork'))
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/api/auth/callback` },
      })
      if (error) toast.error(error.message)
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

          <div className="text-center">
            <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase mb-1">{tShared('brandTagline')}</p>
            <h1 className="text-2xl font-serif font-bold text-gray-900">{t('title')}</h1>
            <p className="text-sm text-gray-500 mt-1">{t('subtitle')}</p>
          </div>

          {/* Google button */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700 disabled:opacity-60"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
              <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            )}
            {t('googleButton')}
          </button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100" /></div>
            <div className="relative flex justify-center"><span className="bg-white px-3 text-xs text-gray-400">{tShared('or')}</span></div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email */}
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

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-gray-700">{tShared('passwordLabel')}</label>
                <Link href="/mot-de-passe-oublie" className="text-xs font-medium" style={{ color: '#10B981' }}>
                  {t('forgotPassword')}
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder={tShared('passwordPlaceholder')}
                  {...register('password')}
                  className={cn(
                    'w-full pl-10 pr-10 py-2.5 rounded-xl border text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all',
                    errors.password ? 'border-red-400' : 'border-gray-200 focus:border-emerald-500'
                  )}
                />
                <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
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

          <p className="text-center text-xs text-gray-500">
            {t('noAccount')}{' '}
            <Link href="/inscription" className="font-bold" style={{ color: '#10B981' }}>
              {t('signupLink')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
