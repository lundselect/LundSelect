'use client'

import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function TrocarSenhaPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/trocar-senha/nova`,
    })

    setLoading(false)

    if (error) {
      setError('Não foi possível enviar o e-mail. Verifique o endereço e tente novamente.')
    } else {
      setSent(true)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="text-gold font-semibold text-xl tracking-widest uppercase">
            Lund Select
          </Link>
          <p className="text-offwhite/40 text-sm mt-3">Trocar senha</p>
        </div>

        {sent ? (
          <div className="text-center space-y-4">
            <div className="w-12 h-12 border border-gold/30 rounded-full flex items-center justify-center mx-auto">
              <span className="text-gold text-xl">✓</span>
            </div>
            <p className="text-offwhite font-light">E-mail enviado!</p>
            <p className="text-offwhite/40 text-sm leading-relaxed">
              Enviámos um link para <span className="text-offwhite/70">{email}</span>. Clique no link para criar uma nova senha.
            </p>
            <p className="text-offwhite/25 text-xs mt-4">Não recebeu? Verifique a pasta de spam.</p>
            <button
              onClick={() => { setSent(false); setEmail('') }}
              className="text-gold/60 text-xs tracking-widest uppercase hover:text-gold transition-colors mt-2 block mx-auto"
            >
              Tentar novamente
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-offwhite/50 text-xs tracking-widest uppercase mb-2">E-mail da conta</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                placeholder="seu@email.com"
                className="w-full bg-offwhite/5 border border-gold/20 text-offwhite placeholder-offwhite/20 px-4 py-3 text-sm focus:outline-none focus:border-gold/60 transition-colors"
              />
            </div>
            {error && <p className="text-red-400 text-xs">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gold text-primary py-4 text-xs tracking-[0.2em] uppercase hover:bg-gold/90 transition-colors disabled:opacity-50"
            >
              {loading ? 'Enviando...' : 'Enviar link'}
            </button>
            <p className="text-center">
              <Link href="/login" className="text-offwhite/30 text-xs hover:text-offwhite transition-colors">
                ← Voltar ao login
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  )
}
