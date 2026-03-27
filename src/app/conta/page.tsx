'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useFavorites } from '@/contexts/FavoritesContext'
import { products } from '@/lib/data'
import { supabase } from '@/lib/supabase'
import AddressSection from './AddressSection'

const TIERS = [
  { name: 'Membro', min: 0, max: 499, multiplier: 1, color: 'text-offwhite/60', border: 'border-offwhite/20', benefits: ['1 ponto por R$1 gasto', 'Acesso antecipado a novidades'] },
  { name: 'Prata', min: 500, max: 1499, multiplier: 1.5, color: 'text-slate-300', border: 'border-slate-400/40', benefits: ['1,5 pontos por R$1 gasto', '5% de desconto em todas as compras', 'Frete grátis acima de R$500'] },
  { name: 'Ouro', min: 1500, max: 3999, multiplier: 2, color: 'text-gold', border: 'border-gold/40', benefits: ['2 pontos por R$1 gasto', '10% de desconto em todas as compras', 'Frete grátis', 'Acesso VIP a lançamentos'] },
  { name: 'Platina', min: 4000, max: Infinity, multiplier: 3, color: 'text-violet-300', border: 'border-violet-400/40', benefits: ['3 pontos por R$1 gasto', '15% de desconto em todas as compras', 'Frete grátis', 'Personal shopper', 'Acesso exclusivo a edições limitadas'] },
]

function getTier(points: number) {
  return TIERS.find(t => points >= t.min && points <= t.max) ?? TIERS[0]
}

interface LoyaltyTransaction {
  id: string
  points: number
  description: string
  created_at: string
}

function LoyaltySection({ userId }: { userId: string }) {
  const [transactions, setTransactions] = useState<LoyaltyTransaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('loyalty_transactions')
      .select('id, points, description, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setTransactions(data ?? [])
        setLoading(false)
      })
  }, [userId])

  const totalPoints = transactions.reduce((sum, t) => sum + t.points, 0)
  const tier = getTier(totalPoints)
  const nextTier = TIERS[TIERS.indexOf(tier) + 1]
  const progress = nextTier
    ? ((totalPoints - tier.min) / (nextTier.min - tier.min)) * 100
    : 100

  if (loading) return (
    <div className="flex justify-center py-12">
      <div className="w-4 h-4 border border-gold border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="space-y-8">
      {/* Points card */}
      <div className={`border ${tier.border} p-6`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <p className="text-offwhite/40 text-xs tracking-widest uppercase mb-1">Nível atual</p>
            <p className={`text-2xl font-light tracking-widest uppercase ${tier.color}`}>{tier.name}</p>
          </div>
          <div className="text-right">
            <p className="text-offwhite/40 text-xs tracking-widest uppercase mb-1">Pontos acumulados</p>
            <p className="text-offwhite text-3xl font-light">{totalPoints.toLocaleString('pt-BR')}</p>
          </div>
        </div>

        {nextTier && (
          <div>
            <div className="flex justify-between text-xs text-offwhite/30 mb-2">
              <span>{totalPoints.toLocaleString('pt-BR')} pts</span>
              <span>{nextTier.min.toLocaleString('pt-BR')} pts para {nextTier.name}</span>
            </div>
            <div className="h-1 bg-offwhite/10 w-full">
              <div
                className={`h-full transition-all duration-700 ${tier.name === 'Ouro' ? 'bg-gold' : tier.name === 'Platina' ? 'bg-violet-400' : tier.name === 'Prata' ? 'bg-slate-300' : 'bg-offwhite/40'}`}
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
            <p className="text-offwhite/30 text-xs mt-2">
              Faltam <span className="text-offwhite/60">{(nextTier.min - totalPoints).toLocaleString('pt-BR')} pontos</span> para {nextTier.name}
            </p>
          </div>
        )}
        {!nextTier && (
          <p className="text-violet-300/60 text-xs tracking-wide">Você está no nível máximo</p>
        )}
      </div>

      {/* Tier benefits */}
      <div>
        <h3 className="text-offwhite/40 text-xs tracking-widest uppercase mb-4">Seus benefícios</h3>
        <div className="space-y-2">
          {tier.benefits.map((benefit) => (
            <div key={benefit} className="flex items-center gap-3">
              <span className={`text-xs ${tier.color}`}>✓</span>
              <span className="text-offwhite/60 text-sm">{benefit}</span>
            </div>
          ))}
        </div>
      </div>

      {/* All tiers */}
      <div>
        <h3 className="text-offwhite/40 text-xs tracking-widest uppercase mb-4">Todos os níveis</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {TIERS.map((t) => (
            <div key={t.name} className={`border p-4 ${t.name === tier.name ? t.border + ' bg-offwhite/5' : 'border-gold/5'}`}>
              <p className={`text-sm font-light tracking-widest uppercase mb-1 ${t.name === tier.name ? t.color : 'text-offwhite/30'}`}>{t.name}</p>
              <p className="text-offwhite/20 text-xs">{t.min === 0 ? '0' : t.min.toLocaleString('pt-BR')}+ pts</p>
            </div>
          ))}
        </div>
      </div>

      {/* Transaction history */}
      <div>
        <h3 className="text-offwhite/40 text-xs tracking-widest uppercase mb-4">Histórico de pontos</h3>
        {transactions.length === 0 ? (
          <div className="border border-dashed border-gold/20 p-6 text-center">
            <p className="text-offwhite/30 text-sm">Nenhuma transação ainda</p>
          </div>
        ) : (
          <div className="space-y-2">
            {transactions.map((t) => (
              <div key={t.id} className="flex items-center justify-between border border-gold/10 px-4 py-3">
                <div>
                  <p className="text-offwhite/70 text-sm">{t.description}</p>
                  <p className="text-offwhite/30 text-xs mt-0.5">
                    {new Date(t.created_at).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <span className={`text-sm font-light ${t.points > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {t.points > 0 ? '+' : ''}{t.points.toLocaleString('pt-BR')} pts
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

interface OrderItem {
  id: string
  product_name: string
  brand: string
  size: string
  quantity: number
  price: number
}

interface Order {
  id: string
  order_number: string
  status: 'inprogress' | 'delivered'
  tracking_code: string | null
  total: number
  created_at: string
  items: OrderItem[]
  review: { product_rating: number; delivery_rating: number; comment: string } | null
  return_request: { status: string } | null
}

const quickLinks = [
  { label: 'Ajuda', icon: '💬', section: 'social', modal: null },
  { label: 'Trocar senha', icon: '🔑', section: 'dados', modal: null },
  { label: 'Avaliar site', icon: '★', section: null, modal: 'rate' },
  { label: 'Sugerir melhoria', icon: '💡', section: null, modal: 'feedback' },
]

const accountSections = [
  { label: 'Meus dados', id: 'dados' },
  { label: 'Endereços', id: 'enderecos' },
  { label: 'Meus pedidos', id: 'pedidos' },
  { label: 'Devoluções', id: 'devolucoes' },
  { label: 'Fidelidade', id: 'fidelidade' },
  { label: 'Método de pagamento', id: 'pagamento' },
  { label: 'Contas sociais', id: 'social' },
]

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0)
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          className="text-xl transition-colors"
        >
          <span className={(hovered || value) >= star ? 'text-gold' : 'text-offwhite/20'}>★</span>
        </button>
      ))}
    </div>
  )
}

function OrderCard({ order, userId }: { order: Order; userId: string }) {
  const [expanded, setExpanded] = useState(false)
  const [productRating, setProductRating] = useState(order.review?.product_rating ?? 0)
  const [deliveryRating, setDeliveryRating] = useState(order.review?.delivery_rating ?? 0)
  const [comment, setComment] = useState(order.review?.comment ?? '')
  const [submitted, setSubmitted] = useState(!!order.review)
  const [saving, setSaving] = useState(false)

  const formattedDate = new Date(order.created_at).toLocaleDateString('pt-BR', {
    day: 'numeric', month: 'short', year: 'numeric',
  })

  const handleSubmitReview = async () => {
    setSaving(true)
    await supabase.from('order_reviews').insert({
      order_id: order.id,
      user_id: userId,
      product_rating: productRating,
      delivery_rating: deliveryRating,
      comment,
    })
    setSaving(false)
    setSubmitted(true)
    setExpanded(false)
  }

  return (
    <div className="border border-gold/10 p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <p className="text-offwhite/40 text-xs tracking-widest uppercase mb-1">Pedido #{order.order_number}</p>
          <p className="text-offwhite/30 text-xs">{formattedDate}</p>
        </div>
        <span className={`self-start sm:self-auto px-3 py-1 text-xs tracking-widest uppercase border ${
          order.status === 'delivered'
            ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/5'
            : 'border-amber-500/30 text-amber-400 bg-amber-500/5'
        }`}>
          {order.status === 'delivered' ? 'Entregue' : 'Em andamento'}
        </span>
      </div>

      <div className="space-y-3">
        {order.items.map((item) => (
          <div key={item.id} className="flex gap-4">
            <div className="w-16 h-20 bg-offwhite/5 border border-gold/10 flex-shrink-0 flex items-center justify-center">
              <span className="text-gold/20 text-xs text-center px-1 leading-tight">{item.brand}</span>
            </div>
            <div className="flex-1">
              <p className="text-offwhite text-sm">{item.product_name}</p>
              <p className="text-offwhite/40 text-xs mt-1">{item.brand}</p>
              <p className="text-offwhite/30 text-xs mt-1">Tamanho: {item.size} · Qtd: {item.quantity}</p>
              <p className="text-gold text-sm mt-2">R$ {item.price.toLocaleString('pt-BR')}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-gold/10">
        <div>
          <p className="text-offwhite/30 text-xs">Total</p>
          <p className="text-offwhite text-sm font-light">R$ {order.total.toLocaleString('pt-BR')}</p>
        </div>
        {order.status === 'inprogress' && order.tracking_code && (
          <p className="text-offwhite/40 text-xs">
            Rastreio: <span className="text-gold font-mono">{order.tracking_code}</span>
          </p>
        )}
        {order.status === 'delivered' && !submitted && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-gold/60 hover:text-gold text-xs tracking-widest uppercase transition-colors"
          >
            {expanded ? 'Fechar' : 'Avaliar pedido'}
          </button>
        )}
        {submitted && (
          <p className="text-emerald-400 text-xs tracking-wide">Avaliação enviada</p>
        )}
      </div>

      {expanded && order.status === 'delivered' && !submitted && (
        <div className="pt-4 border-t border-gold/10 space-y-5">
          <div>
            <p className="text-offwhite/40 text-xs tracking-widest uppercase mb-2">Avalie o produto</p>
            <StarRating value={productRating} onChange={setProductRating} />
          </div>
          <div>
            <p className="text-offwhite/40 text-xs tracking-widest uppercase mb-2">Avalie a entrega</p>
            <StarRating value={deliveryRating} onChange={setDeliveryRating} />
          </div>
          <div>
            <p className="text-offwhite/40 text-xs tracking-widest uppercase mb-2">Comentário</p>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Conte sua experiência..."
              rows={3}
              className="w-full bg-offwhite/5 border border-gold/20 text-offwhite placeholder-offwhite/20 px-4 py-3 text-sm focus:outline-none focus:border-gold/60 transition-colors resize-none"
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleSubmitReview}
              disabled={saving || productRating === 0 || deliveryRating === 0}
              className="bg-gold text-primary px-6 py-2.5 text-xs tracking-[0.2em] uppercase hover:bg-gold/90 transition-colors disabled:opacity-40"
            >
              {saving ? 'Enviando...' : 'Enviar avaliação'}
            </button>
            <button
              onClick={() => setExpanded(false)}
              className="border border-gold/20 text-offwhite/40 hover:text-offwhite px-6 py-2.5 text-xs tracking-[0.2em] uppercase transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function ReturnCard({ order, userId }: { order: Order; userId: string }) {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [details, setDetails] = useState('')
  const [submitted, setSubmitted] = useState(!!order.return_request)
  const [saving, setSaving] = useState(false)

  const formattedDate = new Date(order.created_at).toLocaleDateString('pt-BR', {
    day: 'numeric', month: 'short', year: 'numeric',
  })

  const handleSubmit = async () => {
    setSaving(true)
    await supabase.from('order_returns').insert({
      order_id: order.id,
      user_id: userId,
      reason,
      details,
    })
    setSaving(false)
    setSubmitted(true)
    setOpen(false)
  }

  return (
    <div className="border border-gold/10 p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <p className="text-offwhite/40 text-xs tracking-widest uppercase mb-1">Pedido #{order.order_number}</p>
          <p className="text-offwhite/30 text-xs">{formattedDate}</p>
        </div>
        {submitted ? (
          <span className="text-amber-400 text-xs tracking-wide">
            Solicitação {order.return_request?.status === 'approved' ? 'aprovada' : 'enviada'}
          </span>
        ) : (
          <button
            onClick={() => setOpen(!open)}
            className="self-start sm:self-auto text-gold/60 hover:text-gold text-xs tracking-widest uppercase transition-colors"
          >
            {open ? 'Fechar' : 'Solicitar devolução'}
          </button>
        )}
      </div>

      <div className="space-y-2">
        {order.items.map((item) => (
          <div key={item.id} className="flex justify-between">
            <p className="text-offwhite/60 text-sm">{item.product_name} — {item.size}</p>
            <p className="text-offwhite/40 text-xs">R$ {item.price.toLocaleString('pt-BR')}</p>
          </div>
        ))}
      </div>

      {open && !submitted && (
        <div className="pt-4 border-t border-gold/10 space-y-4">
          <div>
            <p className="text-offwhite/40 text-xs tracking-widest uppercase mb-2">Motivo da devolução</p>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full bg-offwhite/5 border border-gold/20 text-offwhite px-4 py-3 text-sm focus:outline-none focus:border-gold/60 transition-colors"
            >
              <option value="" className="bg-primary">Selecione um motivo</option>
              <option value="size" className="bg-primary">Tamanho incorreto</option>
              <option value="quality" className="bg-primary">Qualidade abaixo do esperado</option>
              <option value="different" className="bg-primary">Produto diferente do anunciado</option>
              <option value="damaged" className="bg-primary">Produto com defeito</option>
              <option value="other" className="bg-primary">Outro</option>
            </select>
          </div>
          <textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder="Descreva o problema com mais detalhes..."
            rows={3}
            className="w-full bg-offwhite/5 border border-gold/20 text-offwhite placeholder-offwhite/20 px-4 py-3 text-sm focus:outline-none focus:border-gold/60 transition-colors resize-none"
          />
          <button
            onClick={handleSubmit}
            disabled={!reason || saving}
            className="bg-gold text-primary px-6 py-2.5 text-xs tracking-[0.2em] uppercase hover:bg-gold/90 transition-colors disabled:opacity-40"
          >
            {saving ? 'Enviando...' : 'Enviar solicitação'}
          </button>
        </div>
      )}
    </div>
  )
}

const socialProviders = [
  { key: 'google', label: 'Google', provider: 'google' },
  { key: 'facebook', label: 'Facebook', provider: 'facebook' },
  { key: 'instagram', label: 'Instagram', provider: 'facebook', note: 'via Facebook / Meta' },
]

function SocialAccounts() {
  const [identities, setIdentities] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [connecting, setConnecting] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const refreshIdentities = async () => {
    const { data } = await supabase.auth.getUser()
    const providers = (data.user?.identities ?? []).map((i: { provider: string }) => i.provider)
    setIdentities(providers)
    setLoading(false)
  }

  useEffect(() => {
    refreshIdentities()
    // Re-check when user returns from OAuth redirect
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      refreshIdentities()
    })
    return () => subscription.unsubscribe()
  }, [])

  const handleConnect = async (key: string, provider: string) => {
    setConnecting(key)
    setError(null)
    const { error } = await supabase.auth.linkIdentity({
      provider: provider as 'google' | 'facebook' | 'apple',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
    if (error) setError(error.message)
    setConnecting(null)
  }

  const handleDisconnect = async (provider: string) => {
    const { data } = await supabase.auth.getUser()
    const identity = (data.user?.identities ?? []).find((i: { provider: string }) => i.provider === provider)
    if (!identity) return
    await supabase.auth.unlinkIdentity(identity)
    setIdentities(prev => prev.filter(p => p !== provider))
  }

  if (loading) return (
    <div className="flex justify-center py-6">
      <div className="w-4 h-4 border border-gold border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="space-y-3">
      {error && <p className="text-red-400 text-xs mb-2">{error}</p>}
      {socialProviders.map((sp) => {
        const connected = identities.includes(sp.provider)
        return (
          <div key={sp.key} className="flex items-center justify-between border border-gold/10 px-4 py-3">
            <div>
              <p className="text-offwhite/60 text-sm">{sp.label}</p>
              {sp.note && <p className="text-offwhite/25 text-xs">{sp.note}</p>}
            </div>
            {connected ? (
              <div className="flex items-center gap-3">
                <span className="text-blue-400 text-xs tracking-wide">Conectado</span>
                <button
                  onClick={() => handleDisconnect(sp.provider)}
                  className="text-offwhite/20 hover:text-red-400 text-xs tracking-widest uppercase transition-colors"
                >
                  Desconectar
                </button>
              </div>
            ) : (
              <button
                onClick={() => handleConnect(sp.key, sp.provider)}
                disabled={connecting === sp.key}
                className="text-gold/50 hover:text-gold text-xs tracking-widest uppercase transition-colors disabled:opacity-40"
              >
                {connecting === sp.key ? 'Aguarde...' : 'Conectar'}
              </button>
            )}
          </div>
        )
      })}
      <p className="text-offwhite/20 text-xs pt-1">Ao conectar, você será redirecionada para o login da plataforma e voltará automaticamente.</p>
    </div>
  )
}

const notificationGroups = [
  {
    group: 'Loja',
    items: [
      { key: 'sale', label: 'Promoções e Sale' },
      { key: 'products', label: 'Novos produtos' },
      { key: 'brands', label: 'Novas marcas parceiras' },
    ],
  },
  {
    group: 'Minha conta',
    items: [
      { key: 'stock', label: 'Item favoritado de volta ao estoque' },
      { key: 'newsletter', label: 'Newsletter semanal' },
    ],
  },
]

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`relative w-11 h-6 flex-shrink-0 rounded-full transition-colors duration-300 ${on ? 'bg-gold' : 'bg-offwhite/10'}`}
    >
      <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300 ${on ? 'left-6' : 'left-1'}`} />
    </button>
  )
}

function NotificationToggles() {
  const [enabled, setEnabled] = useState<Record<string, boolean>>({
    stock: true, sale: true, products: true, brands: true, newsletter: true,
  })
  const [saved, setSaved] = useState(false)

  const toggle = (key: string) => {
    setEnabled(prev => ({ ...prev, [key]: !prev[key] }))
    setSaved(false)
  }

  return (
    <div className="space-y-6">
      {notificationGroups.map((group) => (
        <div key={group.group}>
          <p className="text-offwhite/25 text-xs tracking-widest uppercase mb-3">{group.group}</p>
          <div className="space-y-3">
            {group.items.map((item) => (
              <div key={item.key} className="flex items-center justify-between">
                <p className="text-offwhite/60 text-sm">{item.label}</p>
                <Toggle on={enabled[item.key]} onToggle={() => toggle(item.key)} />
              </div>
            ))}
          </div>
        </div>
      ))}
      <button
        onClick={() => setSaved(true)}
        className="bg-gold text-primary px-8 py-3 text-xs tracking-[0.2em] uppercase hover:bg-gold/90 transition-colors mt-2"
      >
        {saved ? 'Salvo' : 'Salvar'}
      </button>
    </div>
  )
}

export default function ContaPage() {
  const { user, isLoading, logout } = useAuth()
  const { favoriteIds } = useFavorites()
  const router = useRouter()
  const [activeSection, setActiveSection] = useState('dados')
  const [orders, setOrders] = useState<Order[]>([])
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [modal, setModal] = useState<'rate' | 'feedback' | null>(null)
  const [siteRating, setSiteRating] = useState(0)
  const [siteComment, setSiteComment] = useState('')
  const [feedbackText, setFeedbackText] = useState('')
  const [modalSubmitted, setModalSubmitted] = useState(false)

  useEffect(() => {
    if (!isLoading && !user) router.push('/login')
  }, [user, isLoading, router])

  useEffect(() => {
    if (!user) return
    setOrdersLoading(true)
    supabase
      .from('orders')
      .select(`
        id, order_number, status, tracking_code, total, created_at,
        order_items ( id, product_name, brand, size, quantity, price ),
        order_reviews ( product_rating, delivery_rating, comment ),
        order_returns ( status )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          setOrders(data.map((o: any) => ({
            ...o,
            items: o.order_items ?? [],
            review: o.order_reviews?.[0] ?? null,
            return_request: o.order_returns?.[0] ?? null,
          })))
        }
        setOrdersLoading(false)
      })
  }, [user])

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-4 h-4 border border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const lastFavorite = favoriteIds.length > 0
    ? products.find((p) => p.id === favoriteIds[favoriteIds.length - 1])
    : null

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  const deliveredOrders = orders.filter(o => o.status === 'delivered')

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Profile header */}
      <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center mb-12 pb-12 border-b border-gold/10">
        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-offwhite/5 border border-gold/20 flex items-center justify-center flex-shrink-0 relative overflow-hidden">
          {lastFavorite ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-gold/30 text-xs text-center px-2 leading-tight">{lastFavorite.name}</span>
            </div>
          ) : (
            <svg className="w-8 h-8 text-gold/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
          )}
        </div>
        <div>
          <h1 className="text-offwhite text-2xl font-light">Olá, {user.name.split(' ')[0]}</h1>
          <p className="text-offwhite/40 text-sm mt-1">{user.email}</p>
          {lastFavorite && (
            <p className="text-gold/50 text-xs mt-2 tracking-wider">Último salvo: {lastFavorite.name}</p>
          )}
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-12">
        {quickLinks.map((link) => (
          <button
            key={link.label}
            onClick={() => {
              if (link.modal) setModal(link.modal as 'rate' | 'feedback')
              else if (link.section) setActiveSection(link.section)
            }}
            className="border border-gold/10 hover:border-gold/30 p-4 flex flex-col gap-2 transition-colors group text-left"
          >
            <span className="text-xl">{link.icon}</span>
            <span className="text-offwhite/60 group-hover:text-offwhite text-xs tracking-wide transition-colors">{link.label}</span>
          </button>
        ))}
      </div>

      {/* Rate site modal */}
      {modal === 'rate' && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
          <div className="bg-primary border border-gold/20 p-8 w-full max-w-md">
            {modalSubmitted ? (
              <div className="text-center py-4">
                <p className="text-gold text-lg font-light mb-2">Obrigada!</p>
                <p className="text-offwhite/40 text-sm mb-6">Sua avaliação foi enviada.</p>
                <button onClick={() => { setModal(null); setModalSubmitted(false); setSiteRating(0); setSiteComment('') }} className="text-offwhite/40 text-xs tracking-widest uppercase hover:text-offwhite transition-colors">Fechar</button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-offwhite font-light">Avaliar site</h3>
                  <button onClick={() => setModal(null)} className="text-offwhite/30 hover:text-offwhite transition-colors text-xl leading-none">×</button>
                </div>
                <div className="space-y-5">
                  <div>
                    <p className="text-offwhite/40 text-xs tracking-widest uppercase mb-3">Como você avalia sua experiência?</p>
                    <StarRating value={siteRating} onChange={setSiteRating} />
                  </div>
                  <div>
                    <p className="text-offwhite/40 text-xs tracking-widest uppercase mb-2">Comentário</p>
                    <textarea
                      value={siteComment}
                      onChange={(e) => setSiteComment(e.target.value)}
                      placeholder="O que achou do site?"
                      rows={3}
                      className="w-full bg-offwhite/5 border border-gold/20 text-offwhite placeholder-offwhite/20 px-4 py-3 text-sm focus:outline-none focus:border-gold/60 transition-colors resize-none"
                    />
                  </div>
                  <button
                    disabled={siteRating === 0}
                    onClick={() => setModalSubmitted(true)}
                    className="w-full bg-gold text-primary py-3 text-xs tracking-[0.2em] uppercase hover:bg-gold/90 transition-colors disabled:opacity-40"
                  >
                    Enviar avaliação
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Feedback modal */}
      {modal === 'feedback' && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
          <div className="bg-primary border border-gold/20 p-8 w-full max-w-md">
            {modalSubmitted ? (
              <div className="text-center py-4">
                <p className="text-gold text-lg font-light mb-2">Obrigada pela sugestão!</p>
                <p className="text-offwhite/40 text-sm mb-6">Seu feedback nos ajuda a melhorar.</p>
                <button onClick={() => { setModal(null); setModalSubmitted(false); setFeedbackText('') }} className="text-offwhite/40 text-xs tracking-widest uppercase hover:text-offwhite transition-colors">Fechar</button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-offwhite font-light">Sugerir melhoria</h3>
                  <button onClick={() => setModal(null)} className="text-offwhite/30 hover:text-offwhite transition-colors text-xl leading-none">×</button>
                </div>
                <div className="space-y-5">
                  <div>
                    <p className="text-offwhite/40 text-xs tracking-widest uppercase mb-2">O que podemos melhorar?</p>
                    <textarea
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                      placeholder="Sua ideia ou sugestão..."
                      rows={5}
                      className="w-full bg-offwhite/5 border border-gold/20 text-offwhite placeholder-offwhite/20 px-4 py-3 text-sm focus:outline-none focus:border-gold/60 transition-colors resize-none"
                    />
                  </div>
                  <button
                    disabled={!feedbackText.trim()}
                    onClick={() => setModalSubmitted(true)}
                    className="w-full bg-gold text-primary py-3 text-xs tracking-[0.2em] uppercase hover:bg-gold/90 transition-colors disabled:opacity-40"
                  >
                    Enviar sugestão
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Account sections */}
      <div className="flex flex-col sm:flex-row gap-8">
        <aside className="sm:w-48 flex-shrink-0">
          <ul className="space-y-1">
            {accountSections.map((section) => (
              <li key={section.id}>
                <button
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full text-left px-3 py-2.5 text-sm transition-colors ${
                    activeSection === section.id
                      ? 'text-gold border-l border-gold pl-3'
                      : 'text-offwhite/50 hover:text-offwhite'
                  }`}
                >
                  {section.label}
                </button>
              </li>
            ))}
            <li>
              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2.5 text-sm text-offwhite/30 hover:text-red-400 transition-colors mt-4"
              >
                Sair
              </button>
            </li>
          </ul>
        </aside>

        <div className="flex-1 border border-gold/10 p-6">

          {activeSection === 'dados' && (
            <div>
              <h2 className="text-offwhite text-lg font-light mb-6">Meus dados</h2>
              <div className="space-y-4">
                {user.customerNumber && (
                  <div>
                    <label className="block text-offwhite/40 text-xs tracking-widest uppercase mb-2">Número de cliente</label>
                    <div className="w-full bg-offwhite/5 border border-gold/10 text-gold px-4 py-3 text-sm font-mono tracking-widest select-all cursor-text">
                      {user.customerNumber}
                    </div>
                    <p className="text-offwhite/20 text-xs mt-1">Use este número em caso de dúvidas ou trocas</p>
                  </div>
                )}
                <div>
                  <label className="block text-offwhite/40 text-xs tracking-widest uppercase mb-2">Nome completo</label>
                  <input defaultValue={user.name} className="w-full bg-offwhite/5 border border-gold/20 text-offwhite px-4 py-3 text-sm focus:outline-none focus:border-gold/60 transition-colors" />
                </div>
                <div>
                  <label className="block text-offwhite/40 text-xs tracking-widest uppercase mb-2">E-mail</label>
                  <input defaultValue={user.email} type="email" className="w-full bg-offwhite/5 border border-gold/20 text-offwhite px-4 py-3 text-sm focus:outline-none focus:border-gold/60 transition-colors" />
                </div>
                <div>
                  <label className="block text-offwhite/40 text-xs tracking-widest uppercase mb-2">Telefone</label>
                  <input type="tel" placeholder="+55 (11) 99999-9999" className="w-full bg-offwhite/5 border border-gold/20 text-offwhite placeholder-offwhite/20 px-4 py-3 text-sm focus:outline-none focus:border-gold/60 transition-colors" />
                  <p className="text-offwhite/20 text-xs mt-1">Para atualizações de entrega por SMS</p>
                </div>
                <div>
                  <label className="block text-offwhite/40 text-xs tracking-widest uppercase mb-2">Senha</label>
                  <input type="password" placeholder="••••••••" className="w-full bg-offwhite/5 border border-gold/20 text-offwhite placeholder-offwhite/20 px-4 py-3 text-sm focus:outline-none focus:border-gold/60 transition-colors" />
                </div>
                <button className="bg-gold text-primary px-8 py-3 text-xs tracking-[0.2em] uppercase hover:bg-gold/90 transition-colors">
                  Salvar
                </button>
              </div>
            </div>
          )}

          {activeSection === 'enderecos' && <AddressSection />}

          {activeSection === 'pedidos' && (
            <div>
              <h2 className="text-offwhite text-lg font-light mb-6">Meus pedidos</h2>
              {ordersLoading ? (
                <div className="flex justify-center py-12">
                  <div className="w-4 h-4 border border-gold border-t-transparent rounded-full animate-spin" />
                </div>
              ) : orders.length === 0 ? (
                <div className="border border-dashed border-gold/20 p-8 text-center">
                  <p className="text-offwhite/30 text-sm">Nenhum pedido encontrado</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <OrderCard key={order.id} order={order} userId={user.id} />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeSection === 'devolucoes' && (
            <div>
              <h2 className="text-offwhite text-lg font-light mb-2">Devoluções</h2>
              <p className="text-offwhite/30 text-xs mb-6">Apenas pedidos entregues podem ser devolvidos, dentro do prazo de 7 dias.</p>
              {ordersLoading ? (
                <div className="flex justify-center py-12">
                  <div className="w-4 h-4 border border-gold border-t-transparent rounded-full animate-spin" />
                </div>
              ) : deliveredOrders.length === 0 ? (
                <div className="border border-dashed border-gold/20 p-8 text-center">
                  <p className="text-offwhite/30 text-sm">Nenhum pedido elegível para devolução</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {deliveredOrders.map((order) => (
                    <ReturnCard key={order.id} order={order} userId={user.id} />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeSection === 'fidelidade' && (
            <div>
              <h2 className="text-offwhite text-lg font-light mb-6">Programa de fidelidade</h2>
              <LoyaltySection userId={user.id} />
            </div>
          )}

          {activeSection === 'pagamento' && (
            <div>
              <h2 className="text-offwhite text-lg font-light mb-6">Método de pagamento</h2>
              <div className="border border-dashed border-gold/20 p-8 text-center">
                <p className="text-offwhite/30 text-sm mb-4">Nenhum método de pagamento salvo</p>
                <button className="text-gold text-xs tracking-widest uppercase border border-gold/30 px-6 py-2 hover:border-gold transition-colors">
                  Adicionar cartão
                </button>
              </div>
            </div>
          )}

          {activeSection === 'social' && (
            <div className="space-y-10">
              <div>
                <h2 className="text-offwhite text-lg font-light mb-6">Contas sociais</h2>
                <SocialAccounts />
              </div>

              <div>
                <h3 className="text-offwhite text-base font-light mb-1">Notificações</h3>
                <p className="text-offwhite/30 text-xs mb-5">Escolha quando deseja ser avisada</p>
                <NotificationToggles />
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
