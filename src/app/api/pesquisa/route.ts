import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { rateLimit } from '@/lib/rateLimit'
import { optionalString, requireArray, ValidationError } from '@/lib/validate'

const VALID_AGES = ['18-24', '25-34', '35-44', '45-54', '55+']
const VALID_FREQUENCIES = ['Semanalmente', 'Mensalmente', 'A cada 2-3 meses', 'Raramente']
const VALID_BUDGETS = ['Até R$150', 'R$150–R$300', 'R$300–R$500', 'Acima de R$500']

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'
  const { ok, retryAfterMs } = rateLimit(`pesquisa:${ip}`, 2, 3_600_000) // 2 per hour per IP
  if (!ok) {
    return NextResponse.json(
      { error: 'Você já respondeu a pesquisa recentemente.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil(retryAfterMs / 1000)) } }
    )
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Corpo da requisição inválido' }, { status: 400 })
  }

  let data: Record<string, unknown>
  try {
    data = body as Record<string, unknown>
    // Validate enumerable fields
    if (data.age && !VALID_AGES.includes(String(data.age))) throw new ValidationError('Faixa etária inválida')
    if (data.frequency && !VALID_FREQUENCIES.includes(String(data.frequency))) throw new ValidationError('Frequência inválida')
    if (data.budget && !VALID_BUDGETS.includes(String(data.budget))) throw new ValidationError('Orçamento inválido')
  } catch (err) {
    if (err instanceof ValidationError) {
      return NextResponse.json({ error: err.message }, { status: 400 })
    }
    return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 })
  }

  const safe = {
    location: optionalString(data.location, 100),
    age: optionalString(data.age, 20),
    gender: optionalString(data.gender, 50),
    frequency: optionalString(data.frequency, 50),
    brand_count: optionalString(data.brandCount, 20),
    channels: requireArray(data.channels, 'Canais'),
    abandoned: optionalString(data.abandoned, 5),
    abandon_reasons: requireArray(data.abandonReasons, 'Motivos'),
    instagram_rating: typeof data.instagramRating === 'number' ? Math.min(5, Math.max(1, Math.round(data.instagramRating))) : null,
    shipping: optionalString(data.shipping, 50),
    outfit_ease: optionalString(data.outfitEase, 50),
    categories: requireArray(data.categories, 'Categorias'),
    budget: optionalString(data.budget, 50),
    interest: optionalString(data.interest, 5),
    platform_features: requireArray(data.platformFeatures, 'Funcionalidades'),
    favorite_brands: optionalString(data.favoriteBrands, 500),
    newsletter: optionalString(data.newsletter, 5),
    email: data.email ? optionalString(data.email, 254) : null,
  }

  const { error: dbError } = await supabase.from('survey_responses').insert(safe)
  if (dbError) console.error('Supabase insert error (pesquisa):', dbError)

  // Email notification — fire and forget, don't block the response
  const lines = [
    'Pesquisa de cliente — Lund Select',
    '─────────────────────────────────',
    '',
    `1. Onde você mora? ${safe.location ?? '—'}`,
    `2. Faixa etária: ${safe.age ?? '—'}`,
    `3. Gênero: ${safe.gender ?? '—'}`,
    `4. Frequência de compra: ${safe.frequency ?? '—'}`,
    `5. Marcas nos últimos 6 meses: ${safe.brand_count ?? '—'}`,
    `6. Canais: ${safe.channels.join(', ')}`,
    `7. Abandonou compra? ${safe.abandoned ?? '—'}`,
    `8. Motivos: ${safe.abandon_reasons.join(', ')}`,
    `9. Instagram (1–5): ${safe.instagram_rating ?? '—'}`,
    `10. Frete: ${safe.shipping ?? '—'}`,
    `11. Outfit ease: ${safe.outfit_ease ?? '—'}`,
    `12. Categorias: ${safe.categories.join(', ')}`,
    `13. Orçamento: ${safe.budget ?? '—'}`,
    `14. Interesse: ${safe.interest ?? '—'}`,
    `15. Funcionalidades: ${safe.platform_features.join(', ')}`,
    `16. Marcas favoritas: ${safe.favorite_brands ?? '—'}`,
    `17. Newsletter: ${safe.newsletter ?? '—'} ${safe.email ? `— ${safe.email}` : ''}`,
  ].join('\n')

  fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.RESEND_API_KEY ?? ''}`,
    },
    body: JSON.stringify({
      from: 'Lund Select <onboarding@resend.dev>',
      to: ['lundselect@gmail.com'],
      subject: '[Pesquisa] Nova resposta',
      text: lines,
    }),
  }).catch((err) => console.error('Resend error (pesquisa):', err))

  return NextResponse.json({ ok: true })
}
