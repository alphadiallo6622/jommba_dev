'use client'

import { useState, useEffect, useId } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/providers/AuthProvider'

// Nombre de messages non lus (badge Navbar / BottomNav).
export function useUnreadMessagesCount(): number {
  const { user } = useAuth()
  const [count, setCount] = useState(0)
  // Id unique par instance : Navbar et BottomNav utilisent ce hook simultanément,
  // il faut donc un nom de canal distinct pour chaque abonnement Realtime.
  const instanceId = useId()

  useEffect(() => {
    if (!user) return
    const supabase = createClient()

    const fetchCount = () => {
      supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('receiver_id', user.id)
        .eq('is_read', false)
        .then(({ count: c }) => setCount(c ?? 0))
    }

    fetchCount()

    // Mise à jour en temps réel à la réception d'un nouveau message
    const channel = supabase
      .channel(`unread-messages-${user.id}-${instanceId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `receiver_id=eq.${user.id}`,
      }, fetchCount)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'messages',
        filter: `receiver_id=eq.${user.id}`,
      }, fetchCount)
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [user, instanceId])

  return count
}
