'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Heart } from 'lucide-react'
import { useOnboardingStore } from '@/store/onboarding.store'
import StepGender        from '@/components/onboarding/StepGender'
import StepAge           from '@/components/onboarding/StepAge'
import StepMaritalStatus from '@/components/onboarding/StepMaritalStatus'
import StepProfessional  from '@/components/onboarding/StepProfessional'
import StepLocation      from '@/components/onboarding/StepLocation'
import StepValues        from '@/components/onboarding/StepValues'
import StepPhotos        from '@/components/onboarding/StepPhotos'
import { createClient }  from '@/lib/supabase/client'
import { computeProfileCompletion } from '@/lib/supabase/profile-completion'
import { useAuth }       from '@/components/providers/AuthProvider'
import { toast }         from 'sonner'
import { localizedLogin } from '@/lib/i18n/locale-cookie'
import { applyModerationPolicy } from './actions'
import { TOTAL_STEPS, fullPatch, stepPatch } from '@/lib/onboarding-steps'

const STEP_LABEL_KEYS = [
  'gender',
  'age',
  'maritalStatus',
  'professional',
  'location',
  'values',
  'photos',
] as const

export default function OnboardingPage() {
  const router              = useRouter()
  const t                   = useTranslations('onboarding')
  const { user }            = useAuth()
  const { currentStep, setStep, reset } = useOnboardingStore()

  // Le store est persiste dans le navigateur, donc la reprise est acquise
  // sur le meme appareil. Sur un autre appareil, le genre deja enregistre
  // doit malgre tout etre retrouve : le choix est irreversible, et le
  // formulaire ne doit pas offrir de le refaire.
  useEffect(() => {
    if (!user) return
    if (useOnboardingStore.getState().gender) return
    createClient()
      .from('profiles')
      .select('gender')
      .eq('user_id', user.id)
      .single()
      .then(({ data }) => {
        if (data?.gender) useOnboardingStore.getState().setField('gender', data.gender)
      })
  }, [user])

  // Display name from Supabase auth metadata. Le formulaire d'inscription pose
  // first_name ; Google (OIDC) renvoie given_name / name — d'où les fallbacks.
  const meta = user?.user_metadata as Record<string, unknown> | undefined
  const metaName = (key: string) => {
    const v = meta?.[key]
    return typeof v === 'string' ? v.trim() : ''
  }
  const firstName =
    metaName('first_name') ||
    metaName('given_name') ||
    (metaName('name') || metaName('full_name')).split(' ')[0] ||
    ''

  /* Step 0 = welcome screen */
  const isWelcome  = currentStep === 0
  const progressPct = isWelcome ? 0 : Math.round((currentStep / TOTAL_STEPS) * 100)

  // Chaque etape est ecrite des qu'elle est franchie. Avant, le formulaire
  // n'ecrivait qu'a la derniere etape : un abandon en route ne laissait aucune
  // trace en base, et le membre repartait de zero en changeant d'appareil.
  // L'echec n'interrompt pas la saisie — l'ecriture finale rattrapera l'etape.
  const saveStep = async (step: number) => {
    if (!user) return
    const patch = stepPatch(step, useOnboardingStore.getState())
    if (Object.keys(patch).length === 0) return
    const { error } = await createClient()
      .from('profiles')
      .update(patch)
      .eq('user_id', user.id)
    if (error) console.error('[Onboarding] etape', step, 'non enregistree :', error)
  }

  const goNext = () => {
    if (currentStep >= TOTAL_STEPS) return
    void saveStep(currentStep)
    setStep(currentStep + 1)
  }
  const goBack = () => { if (currentStep > 1) setStep(currentStep - 1) }

  const handleFinish = async () => {
    try {
      const supabase = createClient()
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
      if (authError || !authUser) {
        toast.error(t('toast.sessionExpired'))
        router.push(localizedLogin())
        return
      }

      // Les etapes ont deja ete ecrites une a une. On repart de ce qui est en
      // base et le formulaire ne fait que completer : une valeur vide dans le
      // store (etape saisie sur un autre appareil, cache vide) ne doit pas
      // effacer ce qui est deja enregistre.
      const store = useOnboardingStore.getState()
      const { data: saved } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', authUser.id)
        .single()

      const merged = { ...(saved ?? {}), ...fullPatch(store) } as Record<string, unknown>
      const str = (key: string) => (merged[key] as string | null) ?? null

      // Score de complétude (mêmes 10 champs clés que le reste de l'app)
      const profile_completion = computeProfileCompletion({
        gender:          str('gender'),
        age:             (merged.age as number | null) ?? null,
        marital_status:  str('marital_status'),
        job:             str('job'),
        education:       str('education'),
        height:          (merged.height as number | null) ?? null,
        city:            str('city'),
        country:         str('country'),
        marriage_vision: str('marriage_vision'),
        avatar_url:      str('avatar_url'),
      })

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          ...fullPatch(store),
          profile_completion,
          // Temoin d'achevement : c'est lui, et non le genre, qui ouvre le
          // dashboard depuis que les etapes sont enregistrees au fil de l'eau.
          onboarding_completed_at: new Date().toISOString(),
        })
        .eq('user_id', authUser.id)

      if (updateError) {
        console.error('[Onboarding] profile update failed:', updateError)
        toast.error(t('toast.saveError'))
        return
      }

      // Save photos to profile_photos table
      const validPhotos = store.photos.filter(p => Boolean(p))
      if (validPhotos.length > 0) {
        await supabase.from('profile_photos').delete().eq('user_id', authUser.id)
        await supabase.from('profile_photos').insert(
          validPhotos.map((url, i) => ({
            user_id:    authUser.id,
            url,
            is_primary: i === 0,
            order:      i,
          }))
        )
      }

      // Politique de modération (validation auto) décidée côté serveur.
      // Non bloquant : en cas d'échec le profil reste simplement en attente.
      try {
        await applyModerationPolicy()
      } catch (err) {
        console.error('[Onboarding] moderation policy failed:', err)
      }

      reset()
      router.push('/onboarding/success')
    } catch (err) {
      console.error('[Onboarding] submit error:', err)
      toast.error(t('toast.genericError'))
    }
  }

  /* Welcome screen */
  if (isWelcome) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 bg-white">
        <div className="w-full max-w-sm space-y-8 text-center">
          {/* Logo */}
          <div className="flex items-center gap-2 justify-center">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#10B981' }}>
              <Heart className="w-5 h-5 text-white fill-white" />
            </div>
            <span className="text-xl font-serif font-bold" style={{ color: '#064E3B' }}>Jommba</span>
          </div>

          {/* Moon emoji + greeting */}
          <div className="space-y-3">
            <div className="text-5xl">🌙</div>
            <h1 className="text-2xl font-serif font-bold text-gray-900 leading-snug">
              {t('welcome.greeting')}{firstName ? `, ${firstName}` : ''} !
            </h1>
            <p className="text-base text-gray-500 leading-relaxed">
              {t('welcome.tagline')}
            </p>
          </div>

          {/* Reassurance points */}
          <div className="space-y-3 text-left">
            {[
              { icon: '🔒', text: t('welcome.point1') },
              { icon: '✅', text: t('welcome.point2') },
              { icon: '💬', text: t('welcome.point3') },
            ].map(({ icon, text }) => (
              <div key={text} className="flex items-center gap-3 bg-gray-50 rounded-xl p-3.5">
                <span className="text-xl">{icon}</span>
                <p className="text-sm text-gray-700 font-medium">{text}</p>
              </div>
            ))}
          </div>

          {/* CTA */}
          <button
            onClick={goNext}
            className="w-full py-3 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
            style={{ background: '#10B981' }}
          >
            {t('welcome.cta')}
          </button>

          {/* Quranic citation */}
          <div className="border-t border-gray-50 pt-4">
            <p className="text-xs italic text-gray-400 leading-relaxed">
              {t('welcome.quote')}
            </p>
            <p className="text-xs text-emerald-500 font-medium mt-1">{t('welcome.quoteSource')}</p>
          </div>
        </div>
      </div>
    )
  }

  /* Onboarding steps */
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Progress bar header */}
      <header className="sticky top-0 z-20 bg-white border-b border-gray-100">
        <div className="h-1.5 bg-gray-100 w-full">
          <div
            className="h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${progressPct}%`, background: '#10B981' }}
          />
        </div>

        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: '#10B981' }}>
              <Heart className="w-4 h-4 text-white fill-white" />
            </div>
            <span className="text-base font-serif font-bold" style={{ color: '#064E3B' }}>Jommba</span>
          </div>

          <div className="text-right">
            <p className="text-xs font-bold text-gray-700">
              {t('header.step', {
                current: currentStep,
                total: TOTAL_STEPS,
                label: t(`stepLabels.${STEP_LABEL_KEYS[currentStep - 1]}`),
              })}
            </p>
            <p className="text-xs text-gray-400">{t('header.completed', { pct: progressPct })}</p>
          </div>
        </div>
      </header>

      {/* Step content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-10">
        <div className="w-full max-w-md">
          {currentStep === 1 && <StepGender onNext={goNext} />}
          {currentStep === 2 && <StepAge onNext={goNext} onBack={goBack} />}
          {currentStep === 3 && <StepMaritalStatus onNext={goNext} onBack={goBack} />}
          {currentStep === 4 && <StepProfessional onNext={goNext} onBack={goBack} />}
          {currentStep === 5 && <StepLocation onNext={goNext} onBack={goBack} />}
          {currentStep === 6 && <StepValues onNext={goNext} onBack={goBack} />}
          {currentStep === 7 && <StepPhotos onNext={handleFinish} onBack={goBack} isLast />}
        </div>
      </main>
    </div>
  )
}
