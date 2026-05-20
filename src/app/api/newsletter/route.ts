import { NextRequest, NextResponse } from 'next/server'
import { rateLimit } from '@/lib/rateLimit'
import { requireEmail, ValidationError } from '@/lib/validate'

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'
  const { ok, retryAfterMs } = rateLimit(`newsletter:${ip}`, 3, 60_000) // 3 per minute per IP
  if (!ok) {
    return NextResponse.json(
      { error: 'Muitas tentativas. Tente novamente em alguns instantes.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil(retryAfterMs / 1000)) } }
    )
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Corpo da requisição inválido' }, { status: 400 })
  }

  let email: string
  try {
    email = requireEmail((body as Record<string, unknown>).email)
  } catch (err) {
    if (err instanceof ValidationError) {
      return NextResponse.json({ error: err.message }, { status: 400 })
    }
    return NextResponse.json({ error: 'E-mail inválido' }, { status: 400 })
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.RESEND_API_KEY ?? ''}`,
    },
    body: JSON.stringify({
      from: 'Lund Select <onboarding@resend.dev>',
      to: ['lundselect@gmail.com'],
      subject: '[Newsletter] Nova inscrição',
      text: `Nova inscrição na newsletter: ${email}`,
    }),
  })

  if (!res.ok) {
    console.error('Resend error (newsletter):', await res.text())
    return NextResponse.json({ error: 'Falha ao processar inscrição' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
