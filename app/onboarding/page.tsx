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
import { mockSubmitProfile } from '@/lib/mock'
import { toast } from 'sonner'

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
  const router = useRouter()
  const { currentStep, setStep, firstName, reset } = useOnboardingStore()

  /* Step 0 = welcome screen */
  const isWelcome = currentStep === 0

  const progressPct = isWelcome ? 0 : Math.round((currentStep / TOTAL_STEPS) * 100)

  const goNext = () => {
    if (currentStep < TOTAL_STEPS) setStep(currentStep + 1)
  }
  const goBack = () => {
    if (currentStep > 1) setStep(currentStep - 1)
  }

  const handleFinish = async () => {
    try {
      const res = await mockSubmitProfile()
      if (res.success) {
        reset()
        router.push('/onboarding/success')
      }
    } catch {
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
        {/* Full-width green bar */}
        <div className="h-1.5 bg-gray-100 w-full">
          <div
            className="h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${progressPct}%`, background: '#10B981' }}
          />
        </div>

        <div className="flex items-center justify-between px-6 py-3">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: '#10B981' }}>
              <Heart className="w-4 h-4 text-white fill-white" />
            </div>
            <span className="text-base font-serif font-bold" style={{ color: '#064E3B' }}>Jommba</span>
          </div>

          {/* Step + pct */}
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
