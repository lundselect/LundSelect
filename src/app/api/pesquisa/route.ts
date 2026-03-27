import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const data = await req.json()

  const lines = [
    `Pesquisa de cliente — Lund Select`,
    `─────────────────────────────────`,
    ``,
    `1. Onde você mora? ${data.location}`,
    `2. Faixa etária: ${data.age}`,
    `3. Como você se identifica? ${data.gender}`,
    `4. Com que frequência você compra moda? ${data.frequency}`,
    `5. Quantas marcas comprou nos últimos 6 meses? ${data.brandCount}`,
    `6. Onde você costuma descobrir e comprar marcas novas? ${(data.channels ?? []).join(', ')}`,
    `7. Já abandonou uma compra por experiência ruim? ${data.abandoned}`,
    `8. Motivos para abandono: ${(data.abandonReasons ?? []).join(', ')}`,
    `9. Conveniência de comprar pelo Instagram (1–5): ${data.instagramRating}`,
    `10. Importância do frete rápido: ${data.shipping}`,
    `11. Facilidade de montar looks completos: ${data.outfitEase}`,
    `12. Categorias que mais compra: ${(data.categories ?? []).join(', ')}`,
    `13. Gasto típico por peça: ${data.budget}`,
    `14. Usaria uma plataforma multi-marcas curada como a Lund Select? ${data.interest}`,
    `15. O que mais importa em uma plataforma assim? ${(data.platformFeatures ?? []).join(', ')}`,
    `16. Marcas brasileiras favoritas: ${data.favoriteBrands}`,
    `17. Quer receber novidades da Lund Select? ${data.newsletter} ${data.email ? `— ${data.email}` : ''}`,
  ].join('\n')

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.RESEND_API_KEY ?? ''}`,
    },
    body: JSON.stringify({
      from: 'Lund Select <onboarding@resend.dev>',
      to: ['lundselect@gmail.com'],
      subject: `[Pesquisa] Nova resposta`,
      text: lines,
    }),
  })

  if (!res.ok) return NextResponse.json({ error: 'Failed to send' }, { status: 500 })
  return NextResponse.json({ ok: true })
}
