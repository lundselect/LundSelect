import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { from, name, subject, message, category } = await req.json()

  const body = [
    `De: ${name} <${from}>`,
    category ? `Categoria: ${category}` : null,
    '',
    message,
  ]
    .filter((l) => l !== null)
    .join('\n')

  const mailtoRes = await fetch('https://api.resend.com/emails', {
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
      text: body,
    }),
  })

  if (!mailtoRes.ok) {
    const err = await mailtoRes.text()
    console.error('Resend error:', err)
    return NextResponse.json({ error: 'Failed to send' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
