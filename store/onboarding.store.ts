import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type OnboardingData = {
  firstName: string
  lastName: string
  email: string
  gender: 'homme' | 'femme' | null
  birthDate: { day: string; month: string; year: string } | null
  maritalStatus: string | null
  profession: string
  educationLevel: string
  height: string
  location: {
    type: 'afrique' | 'diaspora'
    country: string
    region?: string
    residenceCountry?: string
  } | null
  values: {
    marriageVision: string[]
    soughtQualities: string[]
    polygamy: string
    children: string
  }
  photos: string[]
  currentStep: number
}

type OnboardingStore = OnboardingData & {
  setField: (key: keyof OnboardingData, value: unknown) => void
  setStep: (step: number) => void
  reset: () => void
}

const initialState: OnboardingData = {
  firstName: '',
  lastName: '',
  email: '',
  gender: null,
  birthDate: null,
  maritalStatus: null,
  profession: '',
  educationLevel: '',
  height: '',
  location: null,
  values: { marriageVision: [], soughtQualities: [], polygamy: '', children: '' },
  photos: [],
  currentStep: 0,
}

export const useOnboardingStore = create<OnboardingStore>()(
  persist(
    (set) => ({
      ...initialState,
      setField: (key, value) => set({ [key]: value }),
      setStep: (step) => set({ currentStep: step }),
      reset: () => set(initialState),
    }),
    { name: 'jommba-onboarding' }
  )
)
