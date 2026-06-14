import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type ProfileStore = {
  isPhotosBlurred: boolean
  isSoundEnabled: boolean
  togglePhotosBlur: () => void
  toggleSound: () => void
}

export const useProfileStore = create<ProfileStore>()(
  persist(
    (set) => ({
      isPhotosBlurred: false,
      isSoundEnabled: true,
      togglePhotosBlur: () => set(s => ({ isPhotosBlurred: !s.isPhotosBlurred })),
      toggleSound:      () => set(s => ({ isSoundEnabled: !s.isSoundEnabled })),
    }),
    { name: 'jommba-profile-prefs' }
  )
)
