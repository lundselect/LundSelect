import { NextRequest, NextResponse } from 'next/server'
import { rateLimit } from '@/lib/rateLimit'
import { requireString, requireEmail, optionalString, ValidationError } from '@/lib/validate'

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'
  const { ok, retryAfterMs } = rateLimit(`ajuda:${ip}`, 5, 60_000) // 5 per minute per IP
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

  let from: string, name: string, subject: string, message: string, category: string | undefined
  try {
    const b = body as Record<string, unknown>
    from = requireEmail(b.from)
    name = requireString(b.name, 'Nome', 100)
    subject = requireString(b.subject, 'Assunto', 200)
    message = requireString(b.message, 'Mensagem', 5000)
    category = optionalString(b.category, 100)
  } catch (err) {
    if (err instanceof ValidationError) {
      return NextResponse.json({ error: err.message }, { status: 400 })
    }
    return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 })
  }

  const text = [
    `De: ${name} <${from}>`,
    category ? `Categoria: ${category}` : null,
    '',
    message,
  ]
    .filter((l) => l !== null)
    .join('\n')

  const mailRes = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.RESEND_API_KEY ?? ''}`,
    },
    body: JSON.stringify({
      from: 'Lund Select <onboarding@resend.dev>',
      to: ['lundselect@gmail.com'],
      reply_to: from,
      subject: `[Ajuda] ${subject}`,
      text,
    }),
  })

  if (!mailRes.ok) {
    console.error('Resend error (ajuda):', await mailRes.text())
    return NextResponse.json({ error: 'Falha ao enviar mensagem' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
