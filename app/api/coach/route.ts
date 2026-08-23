import { NextRequest } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { COACH_SYSTEM_PROMPT } from '@/lib/coach-prompt'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getPlatformSettings } from '@/lib/admin/queries'

// bypass SSL cert verification (corporate proxy / dev environment)
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { Agent, fetch: undiciFetch } = require('undici') as {
  Agent: new (opts: Record<string, unknown>) => unknown
  fetch: (url: string, init?: Record<string, unknown>) => Promise<Response>
}
const unsafeAgent = new Agent({ connect: { rejectUnauthorized: false } })

const anthropic = new Anthropic({
  fetch: ((url: string | URL | Request, init?: RequestInit) =>
    undiciFetch(String(url), {
      ...(init as Record<string, unknown>),
      dispatcher: unsafeAgent,
    }) as Promise<Response>
  ) as typeof globalThis.fetch,
})

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return new Response(
      JSON.stringify({ error: 'ANTHROPIC_API_KEY non configurée dans .env.local' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }

  let messages: { role: string; content: string }[]
  let userName: string
  let locale: string

  try {
    const body = await req.json()
    messages = body.messages
    userName = body.userName ?? 'cher membre'
    locale = typeof body.locale === 'string' ? body.locale : 'fr'
  } catch {
    return new Response(
      JSON.stringify({ error: 'Corps de requête invalide' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }

  // Le coach répond dans la langue affichée par le membre.
  const isEnglish = locale.startsWith('en')
  const systemPrompt = COACH_SYSTEM_PROMPT
    .replace('[prénom]', userName)
    .replace('[langue]', isEnglish ? 'anglais' : 'français')

  // Authentification : chaque question consomme des tokens facturés, on ne
  // répond donc jamais à un appel anonyme.
  const supabase = await createClient()
  const { data: authData } = await supabase.auth.getUser()
  const coachUserId = authData.user?.id ?? null
  if (!coachUserId) {
    return new Response(
      JSON.stringify({ error: 'Non authentifié' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    )
  }

  // Quota quotidien pour les membres Free (Paramètres → Limites).
  const admin = createAdminClient()
  const { data: profile } = await admin
    .from('profiles')
    .select('is_premium')
    .eq('user_id', coachUserId)
    .maybeSingle()

  if (!profile?.is_premium) {
    const { limits } = await getPlatformSettings()
    const since = new Date()
    since.setHours(0, 0, 0, 0)
    const { count } = await admin
      .from('coach_usage')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', coachUserId)
      .gte('created_at', since.toISOString())

    if ((count ?? 0) >= limits.coachQuestions) {
      const n = limits.coachQuestions
      const error = isEnglish
        ? `You've reached your limit of ${n} question${n > 1 ? 's' : ''} per day with the Coach. Go Premium for unlimited conversations!`
        : `Tu as atteint ta limite de ${n} question${n > 1 ? 's' : ''} par jour avec le Coach. Passe Premium pour des échanges illimités !`
      return new Response(
        JSON.stringify({ error, reason: 'limit' }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      )
    }
  }

  try {
    const stream = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: systemPrompt,
      messages: messages as { role: 'user' | 'assistant'; content: string }[],
      stream: true,
    })

    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {
        let outputTokens: number | null = null
        try {
          for await (const chunk of stream) {
            if (
              chunk.type === 'content_block_delta' &&
              chunk.delta.type === 'text_delta'
            ) {
              controller.enqueue(encoder.encode(chunk.delta.text))
            }
            if (chunk.type === 'message_delta' && chunk.usage?.output_tokens) {
              outputTokens = chunk.usage.output_tokens
            }
          }
        } catch (err) {
          controller.error(err)
        } finally {
          controller.close()
          // Journalise la question pour les stats du dashboard admin (non bloquant).
          try {
            await admin
              .from('coach_usage')
              .insert({ user_id: coachUserId, tokens: outputTokens })
          } catch {
            // La journalisation ne doit jamais faire échouer la réponse du coach.
          }
        }
      },
    })

    return new Response(readable, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur Anthropic inconnue'
    const cause = err instanceof Error && (err as NodeJS.ErrnoException).cause
      ? String((err as NodeJS.ErrnoException).cause)
      : ''
    return new Response(
      JSON.stringify({ error: message, cause }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
