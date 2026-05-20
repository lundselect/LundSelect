'use client'

import { useState } from 'react'

export default function ContactForm() {
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [mensagem, setMensagem] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nome.trim() || !email.trim() || !mensagem.trim()) return
    setSending(true)
    setError('')

    try {
      const res = await fetch('/api/ajuda', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: email,
          name: nome,
          subject: 'Contato via formulário',
          message: mensagem,
          category: null,
        }),
      })
      if (!res.ok) throw new Error('Erro ao enviar')
      setSent(true)
      setNome('')
      setEmail('')
      setMensagem('')
    } catch {
      setError('Não foi possível enviar. Tente novamente ou escreva para oi@lundselect.com.br')
    }
    setSending(false)
  }

  if (sent) {
    return (
      <div className="text-center py-12 space-y-3">
        <p className="text-gold text-2xl">✓</p>
        <p className="text-offwhite font-light">Mensagem enviada!</p>
        <p className="text-offwhite/40 text-sm">Nossa equipe responde em até 1 dia útil.</p>
        <button
          onClick={() => setSent(false)}
          className="text-gold/60 text-xs tracking-widest uppercase hover:text-gold transition-colors mt-4 block mx-auto"
        >
          Enviar outra mensagem
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-offwhite/40 text-xs tracking-widest uppercase mb-2">Nome</label>
          <input
            type="text"
            required
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="w-full bg-offwhite/5 border border-gold/20 text-offwhite placeholder-offwhite/20 px-4 py-3 text-sm focus:outline-none focus:border-gold/60 transition-colors"
            placeholder="Seu nome"
          />
        </div>
        <div>
          <label className="block text-offwhite/40 text-xs tracking-widest uppercase mb-2">E-mail</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-offwhite/5 border border-gold/20 text-offwhite placeholder-offwhite/20 px-4 py-3 text-sm focus:outline-none focus:border-gold/60 transition-colors"
            placeholder="seu@email.com"
          />
        </div>
      </div>
      <div>
        <label className="block text-offwhite/40 text-xs tracking-widest uppercase mb-2">Mensagem</label>
        <textarea
          rows={5}
          required
          value={mensagem}
          onChange={(e) => setMensagem(e.target.value)}
          className="w-full bg-offwhite/5 border border-gold/20 text-offwhite placeholder-offwhite/20 px-4 py-3 text-sm focus:outline-none focus:border-gold/60 transition-colors resize-none"
          placeholder="Como podemos ajudar?"
        />
      </div>
      {error && <p className="text-red-400 text-xs">{error}</p>}
      <button
        type="submit"
        disabled={sending}
        className="bg-gold text-primary px-10 py-4 text-xs tracking-[0.2em] uppercase hover:bg-gold/90 transition-colors disabled:opacity-50"
      >
        {sending ? 'Enviando...' : 'Enviar mensagem'}
      </button>
    </form>
  )
}
