import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { email } = await req.json()

  const now = new Date().toLocaleString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    dateStyle: 'long',
    timeStyle: 'short',
  })

  const html = `
    <div style="font-family: Georgia, serif; max-width: 520px; margin: 0 auto; color: #1a1a1a;">
      <div style="border-bottom: 1px solid #c9a84c; padding-bottom: 24px; margin-bottom: 32px;">
        <p style="letter-spacing: 0.3em; text-transform: uppercase; font-size: 13px; color: #c9a84c; margin: 0;">Lund Select</p>
      </div>
      <h2 style="font-weight: 300; font-size: 22px; margin-bottom: 16px;">Senha alterada com sucesso</h2>
      <p style="color: #555; line-height: 1.7; font-size: 15px;">
        A senha da sua conta Lund Select associada a <strong>${email}</strong> foi alterada em ${now}.
      </p>
      <p style="color: #555; line-height: 1.7; font-size: 15px;">
        Se não foi você, entre em contacto imediatamente através de <a href="mailto:lundselect@gmail.com" style="color: #c9a84c;">lundselect@gmail.com</a>.
      </p>
      <div style="border-top: 1px solid #eee; margin-top: 40px; padding-top: 20px;">
        <p style="color: #aaa; font-size: 12px; letter-spacing: 0.1em;">© Lund Select · lund-select.vercel.app</p>
      </div>
    </div>
  `

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.RESEND_API_KEY ?? ''}`,
    },
    body: JSON.stringify({
      from: 'Lund Select <onboarding@resend.dev>',
      to: [email],
      subject: 'Sua senha foi alterada — Lund Select',
      html,
    }),
  })

  if (!res.ok) {
    return NextResponse.json({ error: 'Failed to send' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
