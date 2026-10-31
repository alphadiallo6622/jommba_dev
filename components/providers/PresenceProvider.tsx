'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from './AuthProvider'

const PRESENCE_CHANNEL = 'jommba-online-users'

/** Periode du battement qui entretient profiles.last_seen_at. Le canal de
 *  presence ne vit que dans le navigateur : sans cette trace en base, la
 *  console admin n'a aucun moyen de compter les membres connectes. */
const HEARTBEAT_MS = 60_000

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

  // Battement vers la base, en pause quand l'onglet est masque : un onglet
  // oublie en arriere-plan ne doit pas compter comme une connexion active.
  useEffect(() => {
    if (!user) return
    const supabase = createClient()
    const beat = () => {
      if (document.visibilityState !== 'visible') return
      supabase.rpc('touch_last_seen').then(({ error }) => {
        if (error) console.error('[presence] touch_last_seen:', error)
      })
    }
    beat()
    const timer = setInterval(beat, HEARTBEAT_MS)
    document.addEventListener('visibilitychange', beat)
    return () => {
      clearInterval(timer)
      document.removeEventListener('visibilitychange', beat)
    }
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
