'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Lock, Eye, EyeOff, Heart, Loader2, CheckCircle2, ShieldAlert } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

const schema = z
  .object({
    password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
    confirmPassword: z.string().min(1, 'Confirme ton mot de passe'),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  })
type FormData = z.infer<typeof schema>

type SessionState = 'checking' | 'valid' | 'invalid'

function Logo() {
  return (
    <div className="flex items-center gap-2 justify-center">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#10B981' }}>
        <Heart className="w-5 h-5 text-white fill-white" />
      </div>
      <span className="text-xl font-serif font-bold" style={{ color: '#064E3B' }}>Jommba</span>
    </div>
  )
}

export default function ReinitialiserMotDePassePage() {
  const router = useRouter()
  const [sessionState, setSessionState] = useState<SessionState>('checking')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSessionState(session ? 'valid' : 'invalid')
    })
  }, [])

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({ password: data.password })
      if (error) {
        console.error('[ReinitialiserMotDePasse] Supabase error:', JSON.stringify(error))
        toast.error(error.message || 'Impossible de modifier le mot de passe.')
        return
      }
      toast.success('Mot de passe modifié avec succès ✓')
      setDone(true)
      setTimeout(() => {
        router.push('/dashboard')
        router.refresh()
      }, 1500)
    } catch (err) {
      console.error('[ReinitialiserMotDePasse] Exception inattendue:', err)
      toast.error('Une erreur est survenue. Réessaie.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm space-y-8">
        <Logo />

        {sessionState === 'checking' && (
          <div className="flex flex-col items-center gap-3 py-10">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            <p className="text-sm text-gray-500">Vérification du lien…</p>
          </div>
        )}

        {sessionState === 'invalid' && (
          <div className="text-center space-y-5">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto bg-red-50">
              <ShieldAlert className="w-8 h-8 text-red-500" />
            </div>
            <div>
              <h1 className="text-2xl font-serif font-bold text-gray-900">Lien invalide ou expiré</h1>
              <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                Ce lien de réinitialisation n&rsquo;est plus valable. Demande-en un nouveau pour continuer.
              </p>
            </div>
            <Link
              href="/mot-de-passe-oublie"
              className="inline-flex items-center justify-center w-full py-2.5 rounded-xl text-white font-semibold text-sm transition-opacity hover:opacity-90"
              style={{ background: '#10B981' }}
            >
              Demander un nouveau lien
            </Link>
          </div>
        )}

        {sessionState === 'valid' && done && (
          <div className="text-center space-y-5">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto" style={{ background: '#D1FAE5' }}>
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-2xl font-serif font-bold text-gray-900">C&rsquo;est fait !</h1>
              <p className="text-sm text-gray-500 mt-2">Ton mot de passe a été modifié. Redirection…</p>
            </div>
          </div>
        )}

        {sessionState === 'valid' && !done && (
          <>
            <div className="text-center">
              <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: '#D1FAE5' }}>
                <Lock className="w-7 h-7 text-emerald-600" />
              </div>
              <h1 className="text-2xl font-serif font-bold text-gray-900">Nouveau mot de passe</h1>
              <p className="text-sm text-gray-500 mt-1">Choisis un mot de passe sécurisé pour ton compte.</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Nouveau mot de passe</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="8 caractères minimum"
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

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Confirmer le mot de passe</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="••••••••"
                    {...register('confirmPassword')}
                    className={cn(
                      'w-full pl-10 pr-10 py-2.5 rounded-xl border text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all',
                      errors.confirmPassword ? 'border-red-400' : 'border-gray-200 focus:border-emerald-500'
                    )}
                  />
                  <button type="button" onClick={() => setShowConfirm(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{errors.confirmPassword.message}</p>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl text-white font-semibold text-sm transition-opacity hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2"
                style={{ background: '#10B981' }}
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                Modifier mon mot de passe
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
