'use client'

import { useState } from 'react'

export default function NewsletterForm() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setStatus('loading')

    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (!res.ok) throw new Error()
      setStatus('success')
      setEmail('')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <p className="text-gold text-sm tracking-wide">
        ✓ Inscrita! Fique de olho na sua caixa de entrada.
      </p>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 w-full max-w-md mx-auto">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="seu@email.com"
        className="flex-1 bg-offwhite/5 border border-gold/20 text-offwhite placeholder-offwhite/20 px-4 py-3 text-sm focus:outline-none focus:border-gold/60 transition-colors"
      />
      <button
        type="submit"
        disabled={status === 'loading'}
        className="bg-gold text-primary px-8 py-3 text-xs tracking-[0.2em] uppercase hover:bg-gold/90 transition-colors disabled:opacity-50 whitespace-nowrap"
      >
        {status === 'loading' ? 'Enviando...' : 'Inscrever'}
      </button>
      {status === 'error' && (
        <p className="text-red-400 text-xs w-full">Não foi possível inscrever. Tente novamente.</p>
      )}
    </form>
  )
}
