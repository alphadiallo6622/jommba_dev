// POST /api/push/send
// Appelée par le trigger Postgres on_notification_push (via pg_net) à chaque
// nouvelle ligne de `notifications`. Protégée par un secret partagé
// (PUSH_WEBHOOK_SECRET = secret Vault push_webhook_secret).
import { NextRequest, NextResponse } from 'next/server'
import { timingSafeEqual } from 'crypto'
import { sendPushForNotification } from '@/lib/push/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function secretMatches(provided: string | null, expected: string): boolean {
  if (!provided) return false
  const a = Buffer.from(provided)
  const b = Buffer.from(expected)
  return a.length === b.length && timingSafeEqual(a, b)
}

export async function POST(req: NextRequest) {
  const expected = process.env.PUSH_WEBHOOK_SECRET
  if (!expected || !secretMatches(req.headers.get('x-push-secret'), expected)) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const { notification_id } = (await req.json().catch(() => ({}))) as { notification_id?: string }
  if (!notification_id || !/^[0-9a-f-]{36}$/i.test(notification_id)) {
    return NextResponse.json({ error: 'notification_id invalide' }, { status: 400 })
  }

  try {
    const result = await sendPushForNotification(notification_id)
    return NextResponse.json({ ok: true, ...result })
  } catch (err) {
    console.error('[push/send]', err)
    return NextResponse.json({ error: 'Envoi échoué' }, { status: 500 })
  }
}
