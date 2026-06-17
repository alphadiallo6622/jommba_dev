import { NextRequest } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

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
    return Response.json({ error: 'ANTHROPIC_API_KEY manquante' }, { status: 500 })
  }

  let themes: string[]
  let context: string

  try {
    const body = await req.json()
    themes = body.themes
    context = body.context
  } catch {
    return Response.json({ error: 'Corps de requête invalide' }, { status: 400 })
  }

  if (!themes?.length || !context) {
    return Response.json({ error: 'Paramètres manquants' }, { status: 400 })
  }

  const prompt = `Tu es un assistant d'écriture pour Jommba, une application de rencontre sérieuse orientée mariage halal.

Section du profil : "${context}"
Thèmes sélectionnés : ${themes.join(', ')}

Génère un texte naturel et sincère en français à la première personne (je/mon/ma) pour cette section de profil.
Contraintes :
- Intègre naturellement les thèmes, sans les citer mot pour mot de façon mécanique
- 2 à 4 phrases, moins de 400 caractères au total
- Direct, authentique, sans formules banales ni clichés
- Ton sérieux, adapté à un profil de mariage

Réponds UNIQUEMENT avec le texte, sans guillemets ni introduction.`

  try {
    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 250,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text.trim() : ''
    return Response.json({ text })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erreur inconnue'
    return Response.json({ error: msg }, { status: 500 })
  }
}
