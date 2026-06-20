'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Mail, Lock, Eye, EyeOff, Heart, Shield, Users, CheckCircle2,
  Loader2, User, ArrowLeft, ArrowRight, Check,
} from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

/* ─── Schemas ─── */
const step1Schema = z.object({
  firstName: z.string().min(2, 'Prénom requis (min. 2 caractères)'),
  lastName:  z.string().min(2, 'Nom requis (min. 2 caractères)'),
  email:     z.email('Adresse email invalide'),
})
const step2Schema = z.object({
  password:        z.string().min(8, 'Minimum 8 caractères'),
  confirmPassword: z.string().min(1, 'Confirmation requise'),
}).refine(d => d.password === d.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
})
type Step1Data = z.infer<typeof step1Schema>
type Step2Data = z.infer<typeof step2Schema>

/* ─── Password strength ─── */
function getStrength(pwd: string): { level: number; label: string; color: string } {
  if (!pwd) return { level: 0, label: '', color: '' }
  let score = 0
  if (pwd.length >= 8)  score++
  if (pwd.length >= 12) score++
  if (/[A-Z]/.test(pwd)) score++
  if (/[0-9]/.test(pwd)) score++
  if (/[^A-Za-z0-9]/.test(pwd)) score++
  if (score <= 1) return { level: 1, label: 'Faible',  color: 'bg-red-500' }
  if (score <= 3) return { level: 2, label: 'Moyen',   color: 'bg-amber-500' }
  return              { level: 3, label: 'Fort',    color: 'bg-emerald-500' }
}

/* ─── Shared left panel ─── */
function SidePanel() {
  return (
    <div
      className="hidden lg:flex flex-col justify-between p-10 text-white"
      style={{ background: 'linear-gradient(160deg, #10B981 0%, #064E3B 100%)' }}
    >
      <div className="flex items-center gap-2">
        <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
          <Heart className="w-5 h-5 text-white fill-white" />
        </div>
        <span className="text-xl font-serif font-bold">Jommba</span>
      </div>

      <div className="space-y-6">
        <div className="text-center">
          <p className="font-arabic text-3xl leading-loose text-white/90 mb-3">
            وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُم
          </p>
          <p className="text-sm italic text-white/80 leading-relaxed">
            « Et parmi Ses signes, Il a créé pour vous des épouses<br />
            pour que vous viviez en tranquillité avec elles »
          </p>
        </div>

        <div className="space-y-3 mt-4">
          <p className="text-xs font-bold uppercase tracking-widest text-white/60">Pourquoi Jommba ?</p>
          {[
            { icon: CheckCircle2, text: 'Communauté sérieuse et vérifiée' },
            { icon: Shield,       text: 'Respect des valeurs islamiques' },
            { icon: Users,        text: 'Discrétion totale garantie' },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-2.5 text-sm text-white/90">
              <Icon className="w-4 h-4 text-emerald-300 shrink-0" />
              {text}
            </div>
          ))}
        </div>
      </div>

      <div className="text-center bg-white/10 rounded-xl p-4">
        <p className="text-xs italic text-white/80 leading-relaxed">
          « Elles sont un vêtement pour vous et vous êtes un vêtement pour elles. »
        </p>
        <p className="text-xs text-emerald-300 font-semibold mt-1">— Sourate Al-Baqara, 2:187</p>
      </div>
    </div>
  )
}

/* ─── Step indicator ─── */
function StepIndicator({ step }: { step: 1 | 2 }) {
  return (
    <div className="flex items-center justify-center gap-3 mb-6">
      <div className={cn(
        'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all',
        step === 1 ? 'text-white' : 'bg-emerald-500 text-white',
      )} style={step === 1 ? { background: '#10B981' } : {}}>
        {step === 1 ? '1' : <Check className="w-4 h-4" />}
      </div>
      <div className={cn('h-0.5 w-8 rounded-full', step === 2 ? 'bg-emerald-500' : 'bg-gray-200')} />
      <div className={cn(
        'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all',
        step === 2 ? 'text-white' : 'bg-gray-200 text-gray-400',
      )} style={step === 2 ? { background: '#10B981' } : {}}>
        2
      </div>
    </div>
  )
}

/* ─── Main page ─── */
export default function InscriptionPage() {
  const router  = useRouter()
  const [step, setStep]           = useState<1 | 2>(1)
  const [agreed, setAgreed]       = useState(false)
  const [loading, setLoading]     = useState(false)
  const [step1Data, setStep1Data] = useState<Step1Data | null>(null)
  const [showPwd, setShowPwd]     = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const {
    register: r1,
    handleSubmit: hs1,
    formState: { errors: e1 },
  } = useForm<Step1Data>({ resolver: zodResolver(step1Schema) })

  const {
    register: r2,
    handleSubmit: hs2,
    watch: w2,
    formState: { errors: e2 },
  } = useForm<Step2Data>({ resolver: zodResolver(step2Schema) })

  const pwdValue     = w2('password') || ''
  const confirmValue = w2('confirmPassword') || ''
  const strength     = getStrength(pwdValue)
  const passwordsMatch = pwdValue && confirmValue && pwdValue === confirmValue

  /* Google OAuth */
  const handleGoogle = async () => {
    if (!agreed) return
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

  /* Step 1 → 2 */
  const onStep1 = (data: Step1Data) => {
    setStep1Data(data)
    setStep(2)
  }

  /* Step 2 → Supabase signUp */
  const onStep2 = async (data: Step2Data) => {
    if (!step1Data) return
    setLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signUp({
        email:    step1Data.email,
        password: data.password,
        options: {
          data: {
            first_name: step1Data.firstName,
            last_name:  step1Data.lastName,
          },
          emailRedirectTo: `${window.location.origin}/api/auth/callback`,
        },
      })
      if (error) {
        toast.error(error.message)
      } else {
        toast.success('Compte créé ! Vérifie ta boîte mail.')
        router.push('/verify-email')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <SidePanel />

      {/* Right: form */}
      <div className="flex flex-col justify-center items-center px-6 py-12 bg-white">
        <div className="w-full max-w-sm space-y-6">

          {/* Logo mobile */}
          <div className="lg:hidden flex items-center gap-2 justify-center">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: '#10B981' }}>
              <Heart className="w-4 h-4 text-white fill-white" />
            </div>
            <span className="text-xl font-serif font-bold" style={{ color: '#064E3B' }}>Jommba</span>
          </div>

          <div className="text-center">
            <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase mb-1">MARIAGE HALAL • DISCRÉTION • SÉRIEUX</p>
            <h1 className="text-2xl font-serif font-bold text-gray-900">
              {step === 1 ? 'Créer mon compte' : 'Sécurise ton compte'}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {step === 1 ? 'Inscription gratuite et sans engagement.' : 'Choisis un mot de passe solide.'}
            </p>
          </div>

          <StepIndicator step={step} />

          {/* ── STEP 1 ── */}
          {step === 1 && (
            <>
              {/* Consent checkbox */}
              <label className="flex items-start gap-3 cursor-pointer group">
                <div className={cn(
                  'mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-all',
                  agreed ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300 group-hover:border-emerald-400',
                )}>
                  {agreed && <Check className="w-3 h-3 text-white" />}
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={agreed}
                    onChange={e => setAgreed(e.target.checked)}
                  />
                </div>
                <span className="text-xs text-gray-600 leading-relaxed">
                  J&rsquo;accepte les{' '}
                  <a href="#" className="font-semibold underline" style={{ color: '#10B981' }}>CGU</a>
                  {' '}et je m&rsquo;engage à respecter la{' '}
                  <a href="#" className="font-semibold underline" style={{ color: '#10B981' }}>charte de pudeur et de bienséance</a>
                  {' '}de Jommba.
                </span>
              </label>

              {/* Google button */}
              <button
                onClick={handleGoogle}
                disabled={loading || !agreed}
                className="w-full flex items-center justify-center gap-3 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                }
                S&rsquo;inscrire avec Google
              </button>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100" /></div>
                <div className="relative flex justify-center"><span className="bg-white px-3 text-xs text-gray-400">ou</span></div>
              </div>

              {/* Step 1 form */}
              <form onSubmit={hs1(onStep1)} className="space-y-4">
                {/* Prénom */}
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">Prénom</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Ton prénom"
                      {...r1('firstName')}
                      className={cn(
                        'w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all',
                        e1.firstName ? 'border-red-400' : 'border-gray-200 focus:border-emerald-500',
                      )}
                    />
                  </div>
                  {e1.firstName && <p className="text-xs text-red-500 mt-1">{e1.firstName.message}</p>}
                </div>

                {/* Nom */}
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">Nom</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Ton nom de famille"
                      {...r1('lastName')}
                      className={cn(
                        'w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all',
                        e1.lastName ? 'border-red-400' : 'border-gray-200 focus:border-emerald-500',
                      )}
                    />
                  </div>
                  {e1.lastName && <p className="text-xs text-red-500 mt-1">{e1.lastName.message}</p>}
                </div>

                {/* Email */}
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      placeholder="ton.email@exemple.com"
                      {...r1('email')}
                      className={cn(
                        'w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all',
                        e1.email ? 'border-red-400' : 'border-gray-200 focus:border-emerald-500',
                      )}
                    />
                  </div>
                  {e1.email && <p className="text-xs text-red-500 mt-1">{e1.email.message}</p>}
                </div>

                <button
                  type="submit"
                  disabled={!agreed}
                  className="w-full py-2.5 rounded-xl text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 disabled:cursor-not-allowed"
                  style={{ background: agreed ? '#10B981' : '#9CA3AF' }}
                >
                  Continuer
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              <p className="text-center text-xs text-gray-500">
                Déjà membre ?{' '}
                <Link href="/connexion" className="font-bold" style={{ color: '#10B981' }}>
                  Se connecter
                </Link>
              </p>
            </>
          )}

          {/* ── STEP 2 ── */}
          {step === 2 && (
            <form onSubmit={hs2(onStep2)} className="space-y-4">
              {/* Password */}
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Mot de passe</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={showPwd ? 'text' : 'password'}
                    placeholder="••••••••"
                    {...r2('password')}
                    className={cn(
                      'w-full pl-10 pr-10 py-2.5 rounded-xl border text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all',
                      e2.password ? 'border-red-400' : 'border-gray-200 focus:border-emerald-500',
                    )}
                  />
                  <button type="button" onClick={() => setShowPwd(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {/* Strength bar */}
                {pwdValue.length > 0 && (
                  <div className="mt-2 space-y-1">
                    <div className="flex gap-1">
                      {[1, 2, 3].map(i => (
                        <div
                          key={i}
                          className={cn(
                            'h-1 flex-1 rounded-full transition-all',
                            strength.level >= i ? strength.color : 'bg-gray-200',
                          )}
                        />
                      ))}
                    </div>
                    <p className={cn(
                      'text-xs font-medium',
                      strength.level === 1 ? 'text-red-500' : strength.level === 2 ? 'text-amber-500' : 'text-emerald-500',
                    )}>
                      {strength.label}
                    </p>
                  </div>
                )}
                {e2.password && <p className="text-xs text-red-500 mt-1">{e2.password.message}</p>}
              </div>

              {/* Confirm password */}
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Confirmer le mot de passe</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="••••••••"
                    {...r2('confirmPassword')}
                    className={cn(
                      'w-full pl-10 pr-10 py-2.5 rounded-xl border text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all',
                      e2.confirmPassword ? 'border-red-400' : passwordsMatch ? 'border-emerald-400' : 'border-gray-200 focus:border-emerald-500',
                    )}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    {passwordsMatch && <Check className="w-4 h-4 text-emerald-500" />}
                    <button type="button" onClick={() => setShowConfirm(v => !v)} className="text-gray-400 hover:text-gray-600">
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                {e2.confirmPassword && <p className="text-xs text-red-500 mt-1">{e2.confirmPassword.message}</p>}
              </div>

              {/* Fake Cloudflare CAPTCHA */}
              <div className="border border-gray-200 rounded-xl p-3.5 flex items-center justify-between bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded border-2 border-gray-300 bg-white flex items-center justify-center">
                    <Check className="w-3 h-3 text-emerald-500" />
                  </div>
                  <span className="text-sm text-gray-700 font-medium">Je ne suis pas un robot</span>
                </div>
                <div className="flex flex-col items-end">
                  <div className="w-8 h-8 opacity-60">
                    <svg viewBox="0 0 65 65" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M32.5 5L60 20v25L32.5 60 5 45V20L32.5 5z" fill="#F48120" />
                      <path d="M32.5 15L50 24.5v16L32.5 50 15 40.5v-16L32.5 15z" fill="white" fillOpacity="0.3" />
                    </svg>
                  </div>
                  <span className="text-[8px] text-gray-400">Cloudflare</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Retour
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 rounded-xl text-white font-semibold text-sm transition-opacity hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2"
                  style={{ background: '#10B981' }}
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Créer mon compte
                </button>
              </div>
            </form>
          )}

          {/* Bottom quote */}
          <div className="border-t border-gray-50 pt-4 text-center">
            <p className="text-xs italic text-gray-400 leading-relaxed">
              « Elles sont un vêtement pour vous et vous êtes un vêtement pour elles. »
            </p>
            <p className="text-xs text-emerald-500 font-medium mt-0.5">— Sourate Al-Baqara, 2:187</p>
          </div>
        </div>
      </div>
    </div>
  )
}
