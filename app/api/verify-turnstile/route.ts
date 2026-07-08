import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  let token: string
  try {
    const body = await req.json()
    token = String(body.token ?? '')
  } catch {
    return NextResponse.json({ success: false }, { status: 400 })
  }

  if (!token) {
    return NextResponse.json({ success: false }, { status: 400 })
  }

  const secretKey = process.env.TURNSTILE_SECRET_KEY
  if (!secretKey) {
    return NextResponse.json({ success: false, error: 'Turnstile non configuré' }, { status: 500 })
  }

  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ secret: secretKey, response: token }),
  })
  const data = await res.json()

  return NextResponse.json({ success: Boolean(data.success) })
}
