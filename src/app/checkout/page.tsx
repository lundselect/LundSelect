'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useCart } from '@/contexts/CartContext'
import { useAuth } from '@/contexts/AuthContext'

declare global {
  interface Window {
    MercadoPago: new (key: string) => {
      createCardToken: (data: Record<string, string>) => Promise<{ id: string }>
    }
  }
}

type Step = 'address' | 'payment' | 'done'
type PayMethod = 'pix' | 'card' | 'boleto'

interface Addr {
  name: string; email: string; cpf: string; phone: string
  cep: string; street: string; number: string; complement: string
  neighborhood: string; city: string; state: string
}

interface CardData {
  number: string; holder: string; expMonth: string; expYear: string
  cvv: string; installments: number
}

const SHIPPING_THRESHOLD = 300
const SHIPPING_COST = 25

function detectBrand(num: string): string {
  const n = num.replace(/\s/g, '')
  if (/^4/.test(n)) return 'visa'
  if (/^5[1-5]|^2[2-7]/.test(n)) return 'master'
  if (/^3[47]/.test(n)) return 'amex'
  if (/^6/.test(n)) return 'elo'
  return 'visa'
}

const maskCPF = (v: string) =>
  v.replace(/\D/g, '').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2').slice(0, 14)

const maskCEP = (v: string) =>
  v.replace(/\D/g, '').replace(/(\d{5})(\d)/, '$1-$2').slice(0, 9)

const maskPhone = (v: string) =>
  v.replace(/\D/g, '').replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2').slice(0, 15)

const maskCard = (v: string) =>
  v.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim().slice(0, 19)

const inputCls = 'w-full bg-offwhite/5 border border-gold/20 text-offwhite placeholder-offwhite/20 px-4 py-3 text-sm focus:outline-none focus:border-gold/50 transition-colors'
const labelCls = 'block text-offwhite/50 text-[10px] tracking-[0.2em] uppercase mb-1.5'

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart()
  const { user } = useAuth()
  const router = useRouter()

  const [step, setStep] = useState<Step>('address')
  const [payMethod, setPayMethod] = useState<PayMethod>('pix')
  const [mpLoaded, setMpLoaded] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if ((window as unknown as Record<string, unknown>).MercadoPago) { setMpLoaded(true); return }
    const script = document.createElement('script')
    script.src = 'https://sdk.mercadopago.com/js/v2'
    script.onload = () => setMpLoaded(true)
    script.onerror = () => console.error('Failed to load MercadoPago SDK')
    document.head.appendChild(script)
  }, [])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cepLoading, setCepLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const [orderNumber, setOrderNumber] = useState<string | null>(null)
  const [pixQr, setPixQr] = useState<{ code: string; img: string } | null>(null)
  const [boletoUrl, setBoletoUrl] = useState<string | null>(null)

  const [addr, setAddr] = useState<Addr>({
    name: '', email: user?.email || '', cpf: '', phone: '',
    cep: '', street: '', number: '', complement: '',
    neighborhood: '', city: '', state: '',
  })

  const [card, setCard] = useState<CardData>({
    number: '', holder: '', expMonth: '', expYear: '', cvv: '', installments: 1,
  })

  useEffect(() => {
    if (items.length === 0 && step !== 'done') router.push('/produtos')
  }, [items, step, router])

  const shipping = totalPrice >= SHIPPING_THRESHOLD ? 0 : SHIPPING_COST
  const total = totalPrice + shipping

  const lookupCep = useCallback(async (cep: string) => {
    const clean = cep.replace(/\D/g, '')
    if (clean.length !== 8) return
    setCepLoading(true)
    try {
      const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`)
      const data = await res.json()
      if (!data.erro) {
        setAddr(prev => ({
          ...prev,
          street: data.logradouro || prev.street,
          neighborhood: data.bairro || prev.neighborhood,
          city: data.localidade || prev.city,
          state: data.uf || prev.state,
        }))
      }
    } catch { /* silent */ }
    setCepLoading(false)
  }, [])

  const addrValid = !!(
    addr.name && addr.email && addr.cpf.length === 14 &&
    addr.cep.length === 9 && addr.street && addr.number && addr.city && addr.state
  )

  const cardValid = !!(
    card.number.replace(/\s/g, '').length === 16 &&
    card.holder && card.expMonth && card.expYear && card.cvv
  )

  const payValid = payMethod === 'card' ? cardValid : true

  const handlePay = async () => {
    setLoading(true)
    setError(null)
    try {
      let token: string | undefined
      let paymentMethodId: string | undefined

      if (payMethod === 'card') {
        if (!mpLoaded || !(window as unknown as Record<string, unknown>).MercadoPago) throw new Error('SDK não carregado. Recarregue a página.')
        const mp = new window.MercadoPago(process.env.NEXT_PUBLIC_MP_PUBLIC_KEY!)
        const result = await mp.createCardToken({
          cardNumber: card.number.replace(/\s/g, ''),
          cardholderName: card.holder,
          cardExpirationMonth: card.expMonth.padStart(2, '0'),
          cardExpirationYear: `20${card.expYear}`,
          securityCode: card.cvv,
          identificationType: 'CPF',
          identificationNumber: addr.cpf.replace(/\D/g, ''),
        })
        token = result.id
        paymentMethodId = detectBrand(card.number)
      }

      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentMethod: payMethod,
          token,
          paymentMethodId,
          installments: card.installments,
          payer: {
            email: addr.email,
            firstName: addr.name.split(' ')[0],
            lastName: addr.name.split(' ').slice(1).join(' ') || addr.name.split(' ')[0],
            cpf: addr.cpf,
          },
          items: items.map(i => ({
            name: i.product.name,
            brand: i.product.brand,
            size: i.size,
            quantity: i.quantity,
            price: i.product.price,
          })),
          total,
          userId: user?.id,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erro ao processar pagamento')

      setOrderNumber(data.orderNumber)
      if (data.qrCode) setPixQr({ code: data.qrCode, img: data.qrCodeBase64 })
      if (data.boletoUrl) setBoletoUrl(data.boletoUrl)

      clearCart()
      setStep('done')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao processar pagamento')
    } finally {
      setLoading(false)
    }
  }

  const fmt = (n: number) => `R$ ${n.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`

  return (
    <>
      <div className="min-h-screen bg-primary">
        {/* Header */}
        <div className="border-b border-gold/10">
          <div className="max-w-6xl mx-auto px-4 py-5 flex items-center justify-between">
            <Link href="/" className="text-gold font-semibold text-lg tracking-widest uppercase">
              Lund Select
            </Link>
            {step !== 'done' && (
              <div className="flex items-center gap-3 text-[10px] tracking-widest uppercase">
                <span className={step === 'address' ? 'text-gold' : 'text-offwhite/40'}>Entrega</span>
                <span className="text-offwhite/20">›</span>
                <span className={step === 'payment' ? 'text-gold' : 'text-offwhite/40'}>Pagamento</span>
              </div>
            )}
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-12">

          {/* LEFT — form */}
          <div>

            {/* ── STEP: ADDRESS ── */}
            {step === 'address' && (
              <div>
                <h1 className="text-offwhite text-xl font-light tracking-wide mb-8">Endereço de entrega</h1>

                <div className="grid gap-5">
                  <div>
                    <label className={labelCls}>Nome completo</label>
                    <input className={inputCls} placeholder="Seu nome" value={addr.name}
                      onChange={e => setAddr(p => ({ ...p, name: e.target.value }))} />
                  </div>

                  <div>
                    <label className={labelCls}>E-mail</label>
                    <input className={inputCls} type="email" placeholder="seu@email.com" value={addr.email}
                      onChange={e => setAddr(p => ({ ...p, email: e.target.value }))} />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>CPF</label>
                      <input className={inputCls} placeholder="000.000.000-00" value={addr.cpf}
                        onChange={e => setAddr(p => ({ ...p, cpf: maskCPF(e.target.value) }))} />
                    </div>
                    <div>
                      <label className={labelCls}>Telefone</label>
                      <input className={inputCls} placeholder="(00) 00000-0000" value={addr.phone}
                        onChange={e => setAddr(p => ({ ...p, phone: maskPhone(e.target.value) }))} />
                    </div>
                  </div>

                  <div>
                    <label className={labelCls}>CEP {cepLoading && <span className="text-gold/40">(buscando...)</span>}</label>
                    <input className={inputCls} placeholder="00000-000" value={addr.cep}
                      onChange={e => setAddr(p => ({ ...p, cep: maskCEP(e.target.value) }))}
                      onBlur={e => lookupCep(e.target.value)} />
                  </div>

                  <div>
                    <label className={labelCls}>Rua / Logradouro</label>
                    <input className={inputCls} placeholder="Rua das Flores" value={addr.street}
                      onChange={e => setAddr(p => ({ ...p, street: e.target.value }))} />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className={labelCls}>Número</label>
                      <input className={inputCls} placeholder="123" value={addr.number}
                        onChange={e => setAddr(p => ({ ...p, number: e.target.value }))} />
                    </div>
                    <div className="col-span-2">
                      <label className={labelCls}>Complemento</label>
                      <input className={inputCls} placeholder="Apto 4B (opcional)" value={addr.complement}
                        onChange={e => setAddr(p => ({ ...p, complement: e.target.value }))} />
                    </div>
                  </div>

                  <div>
                    <label className={labelCls}>Bairro</label>
                    <input className={inputCls} placeholder="Centro" value={addr.neighborhood}
                      onChange={e => setAddr(p => ({ ...p, neighborhood: e.target.value }))} />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2">
                      <label className={labelCls}>Cidade</label>
                      <input className={inputCls} placeholder="São Paulo" value={addr.city}
                        onChange={e => setAddr(p => ({ ...p, city: e.target.value }))} />
                    </div>
                    <div>
                      <label className={labelCls}>Estado</label>
                      <input className={inputCls} placeholder="SP" maxLength={2}
                        value={addr.state}
                        onChange={e => setAddr(p => ({ ...p, state: e.target.value.toUpperCase() }))} />
                    </div>
                  </div>

                  <button
                    onClick={() => setStep('payment')}
                    disabled={!addrValid}
                    className="w-full bg-gold text-primary py-4 text-xs tracking-[0.2em] uppercase transition-opacity disabled:opacity-30 hover:bg-gold/90 mt-2"
                  >
                    Continuar para pagamento
                  </button>
                </div>
              </div>
            )}

            {/* ── STEP: PAYMENT ── */}
            {step === 'payment' && (
              <div>
                <button onClick={() => setStep('address')} className="text-offwhite/40 hover:text-offwhite text-xs tracking-widest uppercase mb-6 flex items-center gap-2 transition-colors">
                  ‹ Voltar
                </button>
                <h1 className="text-offwhite text-xl font-light tracking-wide mb-8">Forma de pagamento</h1>

                {/* Method tabs */}
                <div className="flex gap-2 mb-8">
                  {(['pix', 'card', 'boleto'] as PayMethod[]).map(m => (
                    <button
                      key={m}
                      onClick={() => setPayMethod(m)}
                      className={`px-5 py-2.5 text-xs tracking-wider uppercase border transition-colors ${
                        payMethod === m
                          ? 'border-gold text-gold bg-gold/5'
                          : 'border-gold/20 text-offwhite/40 hover:border-gold/40 hover:text-offwhite/60'
                      }`}
                    >
                      {m === 'pix' ? 'Pix' : m === 'card' ? 'Cartão' : 'Boleto'}
                    </button>
                  ))}
                </div>

                {/* Pix */}
                {payMethod === 'pix' && (
                  <div className="bg-offwhite/3 border border-gold/10 p-6 space-y-3">
                    <p className="text-offwhite/80 text-sm">O QR code Pix será exibido após confirmar.</p>
                    <p className="text-offwhite/40 text-xs">Pagamento instantâneo — sem taxas adicionais.</p>
                  </div>
                )}

                {/* Card */}
                {payMethod === 'card' && (
                  <div className="grid gap-5">
                    <div>
                      <label className={labelCls}>Número do cartão</label>
                      <input className={inputCls} placeholder="0000 0000 0000 0000" value={card.number}
                        onChange={e => setCard(p => ({ ...p, number: maskCard(e.target.value) }))}
                        maxLength={19} inputMode="numeric" />
                    </div>
                    <div>
                      <label className={labelCls}>Nome no cartão</label>
                      <input className={inputCls} placeholder="NOME SOBRENOME" value={card.holder}
                        onChange={e => setCard(p => ({ ...p, holder: e.target.value.toUpperCase() }))} />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className={labelCls}>Mês</label>
                        <input className={inputCls} placeholder="MM" maxLength={2} value={card.expMonth}
                          onChange={e => setCard(p => ({ ...p, expMonth: e.target.value.replace(/\D/g, '').slice(0, 2) }))}
                          inputMode="numeric" />
                      </div>
                      <div>
                        <label className={labelCls}>Ano</label>
                        <input className={inputCls} placeholder="AA" maxLength={2} value={card.expYear}
                          onChange={e => setCard(p => ({ ...p, expYear: e.target.value.replace(/\D/g, '').slice(0, 2) }))}
                          inputMode="numeric" />
                      </div>
                      <div>
                        <label className={labelCls}>CVV</label>
                        <input className={inputCls} placeholder="123" maxLength={4} value={card.cvv}
                          onChange={e => setCard(p => ({ ...p, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) }))}
                          inputMode="numeric" />
                      </div>
                    </div>
                    <div>
                      <label className={labelCls}>Parcelamento</label>
                      <select className={inputCls + ' cursor-pointer'}
                        value={card.installments}
                        onChange={e => setCard(p => ({ ...p, installments: Number(e.target.value) }))}>
                        <option value={1}>1x de {fmt(total)} sem juros</option>
                        <option value={2}>2x de {fmt(total / 2)} sem juros</option>
                        <option value={3}>3x de {fmt(total / 3)} sem juros</option>
                        <option value={6}>6x de {fmt(total / 6)} sem juros</option>
                        <option value={12}>12x de {fmt(total / 12)}</option>
                      </select>
                    </div>
                    <p className="text-offwhite/30 text-xs">
                      Para teste use: 4111 1111 1111 1111, nome: APRO, venc: 11/30, CVV: 123
                    </p>
                  </div>
                )}

                {/* Boleto */}
                {payMethod === 'boleto' && (
                  <div className="bg-offwhite/3 border border-gold/10 p-6 space-y-3">
                    <p className="text-offwhite/80 text-sm">O boleto será gerado e enviado para seu e-mail.</p>
                    <p className="text-offwhite/40 text-xs">Prazo de pagamento: 3 dias úteis. O pedido é confirmado após a compensação.</p>
                  </div>
                )}

                {error && (
                  <p className="text-red-400 text-sm mt-4 border border-red-400/20 bg-red-400/5 px-4 py-3">{error}</p>
                )}

                <button
                  onClick={handlePay}
                  disabled={loading || !payValid}
                  className="w-full bg-gold text-primary py-4 text-xs tracking-[0.2em] uppercase transition-all disabled:opacity-30 hover:bg-gold/90 mt-6 flex items-center justify-center gap-3"
                >
                  {loading && (
                    <span className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                  )}
                  {loading ? 'Processando...' : 'Confirmar pagamento'}
                </button>
              </div>
            )}

            {/* ── STEP: DONE ── */}
            {step === 'done' && (
              <div className="py-8">
                {/* Pix */}
                {pixQr && (
                  <div className="text-center">
                    <div className="w-12 h-12 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-6">
                      <svg className="w-6 h-6 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                      </svg>
                    </div>
                    <h2 className="text-offwhite text-xl font-light mb-2">Pedido {orderNumber}</h2>
                    <p className="text-offwhite/50 text-sm mb-8">Escaneie o QR code ou copie o código Pix para pagar.</p>

                    {pixQr.img && (
                      <div className="inline-block p-4 bg-white mb-6">
                        <Image
                          src={`data:image/png;base64,${pixQr.img}`}
                          alt="QR Code Pix"
                          width={200}
                          height={200}
                          unoptimized
                        />
                      </div>
                    )}

                    <div className="bg-offwhite/5 border border-gold/20 p-4 mb-4 text-left">
                      <p className="text-offwhite/30 text-[10px] tracking-widest uppercase mb-2">Código Pix copia e cola</p>
                      <p className="text-offwhite/70 text-xs break-all font-mono">{pixQr.code}</p>
                    </div>
                    <button
                      onClick={() => { navigator.clipboard.writeText(pixQr.code); setCopied(true) }}
                      className="w-full border border-gold/40 text-gold py-3 text-xs tracking-widest uppercase hover:bg-gold/5 transition-colors mb-8"
                    >
                      {copied ? 'Copiado!' : 'Copiar código Pix'}
                    </button>
                  </div>
                )}

                {/* Boleto */}
                {boletoUrl && (
                  <div className="text-center">
                    <h2 className="text-offwhite text-xl font-light mb-2">Pedido {orderNumber}</h2>
                    <p className="text-offwhite/50 text-sm mb-8">Seu boleto foi gerado. Pague em até 3 dias úteis.</p>
                    <a
                      href={boletoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block bg-gold text-primary px-10 py-4 text-xs tracking-[0.2em] uppercase hover:bg-gold/90 transition-colors mb-8"
                    >
                      Abrir boleto
                    </a>
                  </div>
                )}

                {/* Card approved */}
                {!pixQr && !boletoUrl && (
                  <div className="text-center">
                    <div className="w-12 h-12 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-6">
                      <svg className="w-6 h-6 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    </div>
                    <h2 className="text-offwhite text-xl font-light mb-2">Pedido {orderNumber} confirmado!</h2>
                    <p className="text-offwhite/50 text-sm mb-8">Pagamento aprovado. Seu pedido está sendo preparado.</p>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3 mt-4">
                  {user && (
                    <Link href="/conta" className="flex-1 text-center border border-gold/40 text-gold py-3 text-xs tracking-widest uppercase hover:bg-gold/5 transition-colors">
                      Ver meus pedidos
                    </Link>
                  )}
                  <Link href="/produtos" className="flex-1 text-center bg-gold text-primary py-3 text-xs tracking-widest uppercase hover:bg-gold/90 transition-colors">
                    Continuar comprando
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT — order summary */}
          {step !== 'done' && (
            <div className="lg:border-l lg:border-gold/10 lg:pl-12">
              <h2 className="text-offwhite/50 text-[10px] tracking-[0.3em] uppercase mb-6">Resumo do pedido</h2>

              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={`${item.product.id}-${item.size}`} className="flex gap-3">
                    <div className="relative w-16 h-20 bg-offwhite/5 flex-shrink-0 overflow-hidden">
                      {item.product.image && (
                        <Image src={item.product.image} alt={item.product.name} fill className="object-cover" sizes="64px" />
                      )}
                      <span className="absolute -top-1.5 -right-1.5 bg-gold text-primary text-[9px] font-semibold rounded-full w-4 h-4 flex items-center justify-center">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-offwhite text-sm truncate">{item.product.name}</p>
                      <p className="text-offwhite/40 text-xs">{item.product.brand} · Tam. {item.size}</p>
                      <p className="text-gold text-sm mt-1">{fmt(item.product.price * item.quantity)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-gold/10 pt-5 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-offwhite/50">Subtotal</span>
                  <span className="text-offwhite">{fmt(totalPrice)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-offwhite/50">Frete</span>
                  <span className={shipping === 0 ? 'text-gold' : 'text-offwhite'}>
                    {shipping === 0 ? 'Grátis' : fmt(SHIPPING_COST)}
                  </span>
                </div>
                <div className="flex justify-between border-t border-gold/10 pt-3">
                  <span className="text-offwhite font-medium">Total</span>
                  <span className="text-gold font-medium text-lg">{fmt(total)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
