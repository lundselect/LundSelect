'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'

const CATEGORIES = [
  { id: 'entregas', label: 'Entregas', icon: '📦', description: 'Rastreamento, prazos e problemas de entrega' },
  { id: 'devolucoes', label: 'Devoluções e Reembolsos', icon: '↩️', description: 'Solicitar devolução ou acompanhar reembolso' },
  { id: 'pedidos', label: 'Problemas com pedido', icon: '🛍️', description: 'Itens faltando, pedido errado ou cancelamento' },
  { id: 'produtos', label: 'Problemas com produto', icon: '👗', description: 'Defeito, tamanho ou qualidade' },
  { id: 'pagamento', label: 'Pagamento e descontos', icon: '💳', description: 'Cobranças, cupons e pontos de fidelidade' },
  { id: 'tecnico', label: 'Problemas técnicos', icon: '⚙️', description: 'Dificuldades no site ou na conta' },
]

export default function AjudaPage() {
  const { user } = useAuth()
  const firstName = user?.name?.split(' ')[0] ?? 'cliente'

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleCategoryClick = (id: string) => {
    setSelectedCategory(id === selectedCategory ? null : id)
    const cat = CATEGORIES.find(c => c.id === id)
    if (cat && id !== selectedCategory) {
      setSubject(cat.label)
    } else {
      setSubject('')
    }
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return
    setSending(true)
    setError('')

    try {
      const res = await fetch('/api/ajuda', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: user?.email ?? 'cliente desconhecido',
          name: user?.name ?? 'Cliente',
          subject: subject || 'Mensagem via Ajuda',
          message,
          category: CATEGORIES.find(c => c.id === selectedCategory)?.label ?? null,
        }),
      })
      if (!res.ok) throw new Error('Erro ao enviar')
      setSent(true)
      setMessage('')
      setSubject('')
      setSelectedCategory(null)
    } catch {
      setError('Não foi possível enviar. Tente novamente ou escreva diretamente para lundselect@gmail.com')
    }
    setSending(false)
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

      {/* Greeting */}
      <div className="mb-12">
        <p className="text-gold/60 text-xs tracking-[0.3em] uppercase mb-2">Suporte</p>
        <h1 className="text-offwhite text-3xl font-light mb-3">
          Hej, {firstName} 👋
        </h1>
        <p className="text-offwhite/50 text-sm leading-relaxed">
          Como posso te ajudar hoje? Escolha a categoria que melhor descreve o seu problema ou escreva diretamente pelo formulário abaixo.
        </p>
      </div>

      {/* Categories */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-12">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => handleCategoryClick(cat.id)}
            className={`text-left p-4 border transition-colors group ${
              selectedCategory === cat.id
                ? 'border-gold/60 bg-gold/5'
                : 'border-gold/10 hover:border-gold/30'
            }`}
          >
            <span className="text-2xl block mb-2">{cat.icon}</span>
            <p className={`text-xs font-medium mb-1 transition-colors ${selectedCategory === cat.id ? 'text-gold' : 'text-offwhite/80 group-hover:text-offwhite'}`}>
              {cat.label}
            </p>
            <p className="text-offwhite/30 text-xs leading-snug">{cat.description}</p>
          </button>
        ))}
      </div>

      {/* Contact form */}
      <div className="border border-gold/10 p-6 sm:p-8">
        <h2 className="text-offwhite text-lg font-light mb-1">Fale conosco</h2>
        <p className="text-offwhite/40 text-xs mb-6">Respondemos em até 48 horas.</p>

        {sent ? (
          <div className="text-center py-8 space-y-3">
            <p className="text-gold text-xl">✓</p>
            <p className="text-offwhite font-light">Mensagem enviada!</p>
            <p className="text-offwhite/40 text-sm">Entraremos em contato em breve pelo seu e-mail.</p>
            <button
              onClick={() => setSent(false)}
              className="text-gold/60 text-xs tracking-widest uppercase hover:text-gold transition-colors mt-4 block mx-auto"
            >
              Enviar outra mensagem
            </button>
          </div>
        ) : (
          <form onSubmit={handleSend} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-offwhite/40 text-xs tracking-widest uppercase mb-2">De</label>
                <input
                  type="text"
                  readOnly
                  value={user ? `${user.name} <${user.email}>` : ''}
                  placeholder="Faça login para enviar"
                  className="w-full bg-offwhite/5 border border-gold/10 text-offwhite/60 px-4 py-3 text-sm cursor-default"
                />
              </div>
              <div>
                <label className="block text-offwhite/40 text-xs tracking-widest uppercase mb-2">Para</label>
                <input
                  type="text"
                  readOnly
                  value="lundselect@gmail.com"
                  className="w-full bg-offwhite/5 border border-gold/10 text-offwhite/60 px-4 py-3 text-sm cursor-default"
                />
              </div>
            </div>

            <div>
              <label className="block text-offwhite/40 text-xs tracking-widest uppercase mb-2">Assunto</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
                placeholder="Descreva brevemente o assunto"
                className="w-full bg-offwhite/5 border border-gold/20 text-offwhite placeholder-offwhite/20 px-4 py-3 text-sm focus:outline-none focus:border-gold/60 transition-colors"
              />
            </div>

            <div>
              <label className="block text-offwhite/40 text-xs tracking-widest uppercase mb-2">Mensagem</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                rows={6}
                placeholder="Descreva o seu problema com o máximo de detalhes possível..."
                className="w-full bg-offwhite/5 border border-gold/20 text-offwhite placeholder-offwhite/20 px-4 py-3 text-sm focus:outline-none focus:border-gold/60 transition-colors resize-none"
              />
            </div>

            {error && <p className="text-red-400 text-xs">{error}</p>}

            <div className="flex items-center justify-between pt-2">
              <p className="text-offwhite/20 text-xs">
                Ou escreva diretamente: <span className="text-offwhite/40">lundselect@gmail.com</span>
              </p>
              <button
                type="submit"
                disabled={sending || !user}
                className="bg-gold text-primary px-8 py-3 text-xs tracking-[0.2em] uppercase hover:bg-gold/90 transition-colors disabled:opacity-50"
              >
                {sending ? 'Enviando...' : 'Enviar'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
