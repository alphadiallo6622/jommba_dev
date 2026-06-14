import { NextRequest } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { COACH_SYSTEM_PROMPT } from '@/lib/coach-prompt'

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

  try {
    const body = await req.json()
    messages = body.messages
    userName = body.userName ?? 'cher membre'
  } catch {
    return new Response(
      JSON.stringify({ error: 'Corps de requête invalide' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }

  const systemPrompt = COACH_SYSTEM_PROMPT.replace('[prénom]', userName)

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
        try {
          for await (const chunk of stream) {
            if (
              chunk.type === 'content_block_delta' &&
              chunk.delta.type === 'text_delta'
            ) {
              controller.enqueue(encoder.encode(chunk.delta.text))
            }
          }
        } catch (err) {
          controller.error(err)
        } finally {
          controller.close()
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
