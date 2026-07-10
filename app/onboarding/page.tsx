'use client'

import { useRouter } from 'next/navigation'
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

const TOTAL_STEPS = 7

const STEP_LABELS = [
  'Genre',
  'Âge',
  'Situation',
  'Profil pro.',
  'Localisation',
  'Valeurs',
  'Photos',
]

export default function OnboardingPage() {
  const router              = useRouter()
  const { user }            = useAuth()
  const { currentStep, setStep, reset } = useOnboardingStore()

  // Display name from Supabase auth metadata (set during inscription)
  const firstName = (user?.user_metadata?.first_name as string | undefined) ?? ''

  /* Step 0 = welcome screen */
  const isWelcome  = currentStep === 0
  const progressPct = isWelcome ? 0 : Math.round((currentStep / TOTAL_STEPS) * 100)

  const goNext = () => { if (currentStep < TOTAL_STEPS) setStep(currentStep + 1) }
  const goBack = () => { if (currentStep > 1) setStep(currentStep - 1) }

  const handleFinish = async () => {
    try {
      const supabase = createClient()
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
      if (authError || !authUser) {
        toast.error('Session expirée. Reconnecte-toi.')
        router.push(localizedLogin())
        return
      }

      // Get all store data at submission time
      const store = useOnboardingStore.getState()

      // Age calculation from day/month/year
      let age: number | null = null
      if (store.birthDate) {
        const { day, month, year } = store.birthDate
        const birth = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
        const today = new Date()
        age = today.getFullYear() - birth.getFullYear()
        if (
          today.getMonth() < birth.getMonth() ||
          (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())
        ) age--
      }

      // Determine country and city from location.
      // Un champ vide reste '' (jamais undefined) dans le store tant qu'il
      // n'a pas été rempli — ?? seul ne le convertit pas en null, ce qui
      // faussait le calcul de complétude du profil (city:"" comptait comme
      // "rempli"). On normalise explicitement ici.
      const country = (store.location?.residenceCountry || store.location?.country || null)
      const city    = (store.location?.region?.trim() || null)

      // First valid photo = avatar
      const avatar_url = store.photos.find(p => Boolean(p)) ?? null

      // Profile completion score (mêmes 10 champs clés que le reste de l'app)
      const profile_completion = computeProfileCompletion({
        gender:          store.gender,
        age,
        marital_status:  store.maritalStatus,
        job:             store.profession || null,
        education:       store.educationLevel || null,
        height:          store.height ? parseInt(store.height) : null,
        city,
        country,
        marriage_vision: store.values.marriageVision.length > 0 ? store.values.marriageVision.join(',') : null,
        avatar_url,
      })

      // Save profile to Supabase
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          gender:           store.gender,
          age,
          marital_status:   store.maritalStatus ?? null,
          job:              store.profession     || null,
          education:        store.educationLevel || null,
          height:           store.height ? parseInt(store.height) : null,
          city,
          country,
          marriage_vision:  store.values.marriageVision.length
            ? store.values.marriageVision.join(',') : null,
          seeking:          store.values.soughtQualities.length
            ? store.values.soughtQualities.join(',') : null,
          polygamy:         store.values.polygamy || null,
          has_children:     store.values.children || null,
          avatar_url,
          profile_completion,
        })
        .eq('user_id', authUser.id)

      if (updateError) {
        console.error('[Onboarding] profile update failed:', updateError)
        toast.error('Erreur lors de l\'enregistrement. Réessaie.')
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
      toast.error('Une erreur est survenue. Réessaie.')
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
              As-salam alaykum{firstName ? `, ${firstName}` : ''} !
            </h1>
            <p className="text-base text-gray-500 leading-relaxed">
              Ta moitié, par destin et invocation.
            </p>
          </div>

          {/* Reassurance points */}
          <div className="space-y-3 text-left">
            {[
              { icon: '🔒', text: 'Tes informations restent confidentielles' },
              { icon: '✅', text: 'Profil vérifié sous 12–24 heures' },
              { icon: '💬', text: 'Aucun contact sans ton accord' },
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
            Créer mon profil →
          </button>

          {/* Quranic citation */}
          <div className="border-t border-gray-50 pt-4">
            <p className="text-xs italic text-gray-400 leading-relaxed">
              « Et parmi Ses signes, Il a créé pour vous des épouses pour que vous viviez en tranquillité avec elles »
            </p>
            <p className="text-xs text-emerald-500 font-medium mt-1">— Sourate Ar-Rum, 30:21</p>
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
              Étape {currentStep}/{TOTAL_STEPS} — {STEP_LABELS[currentStep - 1]}
            </p>
            <p className="text-xs text-gray-400">{progressPct}% complété</p>
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
