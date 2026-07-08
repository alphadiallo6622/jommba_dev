'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from './AuthProvider'

const PRESENCE_CHANNEL = 'jommba-online-users'

const OnlineUsersContext = createContext<Set<string>>(new Set())

export function PresenceProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [onlineIds, setOnlineIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!user) {
      setOnlineIds(new Set())
      return
    }

    const supabase = createClient()
    const channel = supabase.channel(PRESENCE_CHANNEL, {
      config: { presence: { key: user.id } },
    })

    const syncOnlineIds = () => {
      const state = channel.presenceState()
      setOnlineIds(new Set(Object.keys(state)))
    }

    channel
      .on('presence', { event: 'sync' }, syncOnlineIds)
      .on('presence', { event: 'join' }, syncOnlineIds)
      .on('presence', { event: 'leave' }, syncOnlineIds)
      .subscribe(async status => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ online_at: new Date().toISOString() })
        }
      })

    return () => { supabase.removeChannel(channel) }
  }, [user])

  return (
    <OnlineUsersContext.Provider value={onlineIds}>
      {children}
    </OnlineUsersContext.Provider>
  )
}

export function useOnlineUsers() {
  return useContext(OnlineUsersContext)
}

export function useIsOnline(userId: string | undefined | null) {
  const onlineIds = useOnlineUsers()
  return userId ? onlineIds.has(userId) : false
}
