import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { MockUser, mockUserFree } from '@/lib/mock-user'

type AuthStore = {
  currentUser: MockUser
  setCurrentUser: (user: MockUser) => void
  logout: () => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      currentUser: mockUserFree,
      setCurrentUser: (user) => set({ currentUser: user }),
      logout: () => set({ currentUser: mockUserFree }),
    }),
    { name: 'jommba-auth' }
  )
)
