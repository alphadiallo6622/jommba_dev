import { NextRequest } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

// bypass SSL cert verification (corporate proxy / dev environment) — même
// contournement que /api/coach et /api/generate-text.
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

type Idea = { tone: string; text: string; reason: string }

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json({ error: 'ANTHROPIC_API_KEY manquante' }, { status: 500 })
  }

  let profile: Record<string, unknown>
  try {
    const body = await req.json()
    profile = body.profile
  } catch {
    return Response.json({ error: 'Corps de requête invalide' }, { status: 400 })
  }

  if (!profile || typeof profile !== 'object') {
    return Response.json({ error: 'Profil manquant' }, { status: 400 })
  }

  const p = profile as {
    firstName?: string; age?: number; location?: string; tags?: string[]
    marriageVision?: string; seeking?: string; interests?: string; qualities?: string
  }

  const profileSummary = [
    p.firstName && `Prénom : ${p.firstName}`,
    p.age && `Âge : ${p.age}`,
    p.location && `Ville : ${p.location}`,
    p.tags?.length && `Situation : ${p.tags.join(', ')}`,
    p.marriageVision && `Vision du mariage : ${p.marriageVision}`,
    p.seeking && `Recherche : ${p.seeking}`,
    p.interests && `Centres d'intérêt : ${p.interests}`,
    p.qualities && `Qualités : ${p.qualities}`,
  ].filter(Boolean).join('\n')

  const prompt = `Tu es un assistant d'écriture pour Jommba, une application de rencontre sérieuse orientée mariage halal (musulman).

Voici le profil de la personne à qui écrire un premier message :
${profileSummary}

Génère exactement 3 idées de premiers messages personnalisés, en français, adressés à ${p.firstName || 'cette personne'}.
Chaque message doit :
- s'appuyer sur un élément CONCRET du profil ci-dessus (le citer ou y faire référence)
- rester respectueux, pudique et sérieux (contexte mariage halal)
- faire 1 à 3 phrases, moins de 300 caractères
- éviter les clichés et les formules creuses
- se terminer idéalement par une question ouverte pour engager la discussion

Utilise 3 tons différents : "Curieux", "Sincère", "Taquin" (léger et bienveillant).

Réponds UNIQUEMENT avec un tableau JSON valide, sans texte autour, au format :
[{"tone":"Curieux","text":"...","reason":"élément du profil utilisé (3-5 mots)"}, ...]`

  try {
    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 800,
      messages: [{ role: 'user', content: prompt }],
    })

    const raw = message.content[0].type === 'text' ? message.content[0].text.trim() : '[]'
    // Le modèle peut envelopper le JSON dans du texte ou des ```json — on extrait.
    const jsonStart = raw.indexOf('[')
    const jsonEnd = raw.lastIndexOf(']')
    let ideas: Idea[] = []
    if (jsonStart !== -1 && jsonEnd !== -1) {
      try {
        ideas = JSON.parse(raw.slice(jsonStart, jsonEnd + 1))
      } catch {
        ideas = []
      }
    }

    if (!Array.isArray(ideas) || ideas.length === 0) {
      return Response.json({ error: 'Génération impossible, réessaie.' }, { status: 502 })
    }

    // Nettoyage défensif du format.
    ideas = ideas
      .filter((i) => i && typeof i.text === 'string')
      .slice(0, 3)
      .map((i) => ({
        tone: String(i.tone ?? 'Message'),
        text: String(i.text).trim(),
        reason: String(i.reason ?? '').trim(),
      }))

    return Response.json({ ideas })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erreur inconnue'
    return Response.json({ error: msg }, { status: 500 })
  }
}
