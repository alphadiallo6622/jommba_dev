import { useAuthStore } from '@/store/auth.store'

export const useCurrentUser = () => useAuthStore(s => s.currentUser)
