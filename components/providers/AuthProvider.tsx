'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { localizedLogin } from '@/lib/i18n/locale-cookie'
import { disablePush, setBadge } from '@/lib/push/client'

type AuthContextValue = {
  user: User | null
  isLoading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isLoading: true,
  signOut: async () => {},
})

export function AuthProvider({
  children,
  initialUser,
}: {
  children: React.ReactNode
  initialUser: User | null
}) {
  const [user, setUser] = useState<User | null>(initialUser)
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
      }
    )
    return () => subscription.unsubscribe()
  }, [supabase])

  const signOut = useCallback(async () => {
    // Cet appareil ne doit plus recevoir les notifications du compte qui se
    // déconnecte (appareil partagé) : à faire avant de perdre la session.
    await disablePush()
    setBadge(0)
    await supabase.auth.signOut()
    setUser(null)
    window.location.href = localizedLogin()
  }, [supabase])

  return (
    <AuthContext.Provider value={{ user, isLoading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
