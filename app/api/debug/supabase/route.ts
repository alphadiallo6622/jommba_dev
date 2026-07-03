import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// Route de vérification — UNIQUEMENT en développement.
// Accès : GET /api/debug/supabase
// Supprime ce fichier avant de passer en production.
export async function GET() {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Non disponible en production' }, { status: 403 })
  }

  try {
    const supabase = await createClient()

    // 1. Tester la connexion Supabase Auth
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    // 2. Lister les tables existantes dans le schéma public
    let tables: unknown = null
    let tablesError: unknown = null
    try {
      const result = await supabase.rpc('list_public_tables').select()
      tables = result.data
      tablesError = result.error
    } catch {
      tablesError = 'RPC non disponible'
    }

    // Fallback : requête information_schema directe
    let tableList: string[] = []
    if (!tables) {
      const { data: rawTables } = await supabase
        .from('profiles')
        .select('id')
        .limit(1)

      // Si on arrive ici sans erreur, profiles existe
      tableList = rawTables !== null ? ['profiles ✓'] : []
    }

    // 3. Vérifier chaque table attendue
    const expectedTables = [
      'profiles',
      'user_preferences',
      'profile_photos',
      'conversations',
      'messages',
      'likes',
      'profile_visitors',
      'boosts',
      'subscriptions',
      'reports',
      'notifications',
      'support_tickets',
    ]

    const tableStatus: Record<string, boolean | string> = {}

    await Promise.all(
      expectedTables.map(async (table) => {
        const { error } = await supabase
          .from(table as 'profiles')
          .select('id')
          .limit(1)

        if (error?.code === '42P01') {
          tableStatus[table] = '✗ N\'existe pas'
        } else if (error && error.code !== 'PGRST116') {
          tableStatus[table] = `⚠ Erreur RLS (table existe)`
        } else {
          tableStatus[table] = '✓ Existe'
        }
      })
    )

    const allCreated  = Object.values(tableStatus).every(v => !String(v).startsWith('✗'))
    const missingTables = Object.entries(tableStatus)
      .filter(([, v]) => String(v).startsWith('✗'))
      .map(([k]) => k)

    return NextResponse.json({
      connexion:       authError ? '✗ Erreur' : '✓ Supabase connecté',
      utilisateur:     user ? `✓ ${user.email}` : '✗ Non authentifié (normal sans session)',
      tables:          tableStatus,
      résumé:          allCreated
        ? '✅ Toutes les tables existent'
        : `❌ Tables manquantes : ${missingTables.join(', ')} — Exécuter supabase/schema.sql`,
      action_requise:  allCreated ? null : 'Aller sur https://supabase.com/dashboard/project/llbmllsfjirqtoubweyu/editor et exécuter le contenu de supabase/schema.sql',
    }, { status: 200 })

  } catch (error) {
    return NextResponse.json({
      connexion: '✗ Échec',
      erreur: String(error),
      action: 'Vérifier NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY dans .env.local',
    }, { status: 500 })
  }
}
