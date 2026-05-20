import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { rateLimit } from '@/lib/rateLimit'

function generateOrderNumber(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = 'LS-'
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'
  const { ok, retryAfterMs } = rateLimit(`checkout:${ip}`, 10, 60_000)
  if (!ok) {
    return NextResponse.json(
      { error: 'Muitas tentativas.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil(retryAfterMs / 1000)) } }
    )
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Requisição inválida' }, { status: 400 })
  }

  const {
    paymentMethod,
    token,
    paymentMethodId,
    installments,
    payer,
    items,
    total,
    userId,
  } = body as {
    paymentMethod: 'pix' | 'card' | 'boleto'
    token?: string
    paymentMethodId?: string
    installments?: number
    payer: { email: string; firstName: string; lastName: string; cpf: string }
    items: Array<{ name: string; brand: string; size: string; quantity: number; price: number }>
    total: number
    userId?: string
  }

  if (!paymentMethod || !payer?.email || !items?.length || !total) {
    return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 })
  }

  // Build Mercado Pago payment payload
  const mpPayload: Record<string, unknown> = {
    transaction_amount: Math.round(total * 100) / 100,
    description: 'Lund Select',
    payer: {
      email: payer.email,
      first_name: payer.firstName,
      last_name: payer.lastName || payer.firstName,
      identification: {
        type: 'CPF',
        number: payer.cpf.replace(/\D/g, ''),
      },
    },
  }

  if (paymentMethod === 'pix') {
    mpPayload.payment_method_id = 'pix'
  } else if (paymentMethod === 'card') {
    if (!token) return NextResponse.json({ error: 'Token do cartão ausente' }, { status: 400 })
    mpPayload.token = token
    mpPayload.payment_method_id = paymentMethodId || 'visa'
    mpPayload.installments = installments || 1
  } else if (paymentMethod === 'boleto') {
    mpPayload.payment_method_id = 'bolbradesco'
  }

  console.log('[MP Request]', JSON.stringify(mpPayload, null, 2))

  // Call Mercado Pago API
  const mpRes = await fetch('https://api.mercadopago.com/v1/payments', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN ?? ''}`,
      'X-Idempotency-Key': `${userId ?? 'guest'}-${Date.now()}`,
    },
    body: JSON.stringify(mpPayload),
  })

  const mpData = await mpRes.json()
  console.log('[MP Response]', JSON.stringify(mpData, null, 2))

  if (!mpRes.ok || mpData.status === 'rejected') {
    const reason = mpData.status_detail || mpData.message || 'Pagamento recusado'
    return NextResponse.json({ error: reason }, { status: 422 })
  }

  // Create order in Supabase
  const orderNumber = generateOrderNumber()

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      user_id: userId || null,
      order_number: orderNumber,
      status: paymentMethod === 'card' ? 'inprogress' : 'pending',
      total,
    })
    .select('id')
    .single()

  if (!orderError && order) {
    await supabase.from('order_items').insert(
      items.map((item) => ({
        order_id: order.id,
        product_name: item.name,
        brand: item.brand,
        size: item.size,
        quantity: item.quantity,
        price: item.price,
      }))
    )
  }

  // Return result per payment method
  if (paymentMethod === 'pix') {
    const qr = mpData.point_of_interaction?.transaction_data
    return NextResponse.json({
      ok: true,
      method: 'pix',
      orderNumber,
      qrCode: qr?.qr_code ?? null,
      qrCodeBase64: qr?.qr_code_base64 ?? null,
    })
  }

  if (paymentMethod === 'boleto') {
    return NextResponse.json({
      ok: true,
      method: 'boleto',
      orderNumber,
      boletoUrl: mpData.transaction_details?.external_resource_url ?? null,
    })
  }

  return NextResponse.json({
    ok: true,
    method: 'card',
    orderNumber,
    status: mpData.status,
  })
}
