import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type ProfileStore = {
  isPhotosBlurred: boolean
  isSoundEnabled: boolean
  setPrefs: (prefs: { photosBlurred?: boolean; soundEnabled?: boolean }) => void
  togglePhotosBlur: () => void
  toggleSound: () => void
}

export const useProfileStore = create<ProfileStore>()(
  persist(
    (set) => ({
      isPhotosBlurred: false,
      isSoundEnabled: true,
      // Hydrate depuis user_preferences (Supabase) au chargement du dashboard
      setPrefs: ({ photosBlurred, soundEnabled }) => set(s => ({
        isPhotosBlurred: photosBlurred ?? s.isPhotosBlurred,
        isSoundEnabled:  soundEnabled  ?? s.isSoundEnabled,
      })),
      togglePhotosBlur: () => set(s => ({ isPhotosBlurred: !s.isPhotosBlurred })),
      toggleSound:      () => set(s => ({ isSoundEnabled: !s.isSoundEnabled })),
    }),
    { name: 'jommba-profile-prefs' }
  )
)
