'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/providers/AuthProvider'

export function useDemandesCount(): number {
  const { user } = useAuth()
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!user) return
    const supabase = createClient()
    supabase
      .from('likes')
      .select('*', { count: 'exact', head: true })
      .eq('receiver_id', user.id)
      .eq('type', 'request')
      .eq('status', 'pending')
      .then(({ count: c }) => setCount(c ?? 0))
  }, [user])

  return count
}
