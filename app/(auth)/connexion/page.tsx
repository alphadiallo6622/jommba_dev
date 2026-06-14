'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mail, Lock, Eye, EyeOff, Heart, Shield, Users, CheckCircle2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { mockLogin } from '@/lib/mock'
import { useAuthStore } from '@/store/auth.store'
import { cn } from '@/lib/utils'

const schema = z.object({
  email: z.string().email('Adresse email invalide'),
  password: z.string().min(1, 'Le mot de passe est requis'),
})
type FormData = z.infer<typeof schema>

function SidePanel() {
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

      {/* Footer quote */}
      <div className="text-center bg-white/10 rounded-xl p-4">
        <p className="text-xs italic text-white/80 leading-relaxed">
          « Elles sont un vêtement pour vous et vous êtes un vêtement pour elles. »
        </p>
        <p className="text-xs text-emerald-300 font-semibold mt-1">— Sourate Al-Baqara, 2:187</p>
      </div>
    </div>
  )
}

export default function ConnexionPage() {
  const router = useRouter()
  const setCurrentUser = useAuthStore(s => s.setCurrentUser)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      const res = await mockLogin(data)
      if (res.success && res.user) {
        setCurrentUser(res.user)
        toast.success(`Connexion réussie ! Salam ${res.user.firstName} 🌙`)
        router.push('/dashboard')
      } else {
        toast.error(res.error ?? 'Email ou mot de passe incorrect')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleMock = async () => {
    setLoading(true)
    await new Promise(r => setTimeout(r, 1000))
    setLoading(false)
    toast.success('Connexion Google simulée — redirection...')
    setTimeout(() => router.push('/dashboard'), 800)
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
            <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase mb-1">MARIAGE HALAL • DISCRÉTION • SÉRIEUX</p>
            <h1 className="text-2xl font-serif font-bold text-gray-900">Bismillah, bienvenue</h1>
            <p className="text-sm text-gray-500 mt-1">Connecte-toi pour continuer ta recherche.</p>
          </div>

          {/* Google button */}
          <button
            onClick={handleGoogleMock}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700 disabled:opacity-60"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
              <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            )}
            Connexion rapide avec Google
          </button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100" /></div>
            <div className="relative flex justify-center"><span className="bg-white px-3 text-xs text-gray-400">ou</span></div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email */}
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  placeholder="ton.email@exemple.com"
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
                <label className="text-xs font-semibold text-gray-700">Mot de passe</label>
                <button type="button" className="text-xs font-medium" style={{ color: '#10B981' }}>
                  Mot de passe oublié ?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
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
              Se connecter
            </button>
          </form>

          <p className="text-center text-xs text-gray-500">
            Pas encore membre ?{' '}
            <Link href="/inscription" className="font-bold" style={{ color: '#10B981' }}>
              S&rsquo;inscrire gratuitement
            </Link>
          </p>

          {/* Test accounts */}
          <div className="border-t border-gray-100 pt-4">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 text-center">Comptes de test</p>
            <div className="space-y-2">
              <div className="bg-gray-50 rounded-xl px-3 py-2.5">
                <p className="text-xs font-semibold text-gray-600 mb-0.5">Compte Gratuit</p>
                <p className="text-[11px] text-gray-400">abou.diallo@jommba.net</p>
                <p className="text-[11px] text-gray-400">Mot de passe : <span className="font-mono font-semibold text-gray-600">abou2024</span></p>
              </div>
              <div className="bg-amber-50 border border-amber-100 rounded-xl px-3 py-2.5">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <p className="text-xs font-semibold text-amber-700">Compte Premium</p>
                  <span className="text-[9px] font-bold bg-amber-500 text-white px-1.5 py-0.5 rounded-full">PREMIUM</span>
                </div>
                <p className="text-[11px] text-amber-600">alphadiallo2308@gmail.com</p>
                <p className="text-[11px] text-amber-600">Mot de passe : <span className="font-mono font-semibold text-amber-800">alpha2308</span></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
