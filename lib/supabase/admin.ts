import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'

// Client avec service_role — UNIQUEMENT côté serveur, jamais exposé au client.
// Contourne le RLS pour les opérations administratives.
export function createAdminClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY manquant dans .env.local')
  }
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
