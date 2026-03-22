'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

export default function CadastroPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const err = await register(name, email, password)
    setLoading(false)
    if (!err) router.push('/conta')
    else setError(err)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <Link href="/" className="text-gold font-semibold text-xl tracking-widest uppercase">
            Lund Select
          </Link>
          <h1 className="text-offwhite text-2xl font-light mt-6 mb-2">Criar conta</h1>
          <p className="text-offwhite/40 text-sm">Junte-se à Lund Select</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-offwhite/50 text-xs tracking-widest uppercase mb-2">Nome</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full bg-offwhite/5 border border-gold/20 text-offwhite placeholder-offwhite/20 px-4 py-3 text-sm focus:outline-none focus:border-gold/60 transition-colors"
              placeholder="Seu nome"
            />
          </div>
          <div>
            <label className="block text-offwhite/50 text-xs tracking-widest uppercase mb-2">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-offwhite/5 border border-gold/20 text-offwhite placeholder-offwhite/20 px-4 py-3 text-sm focus:outline-none focus:border-gold/60 transition-colors"
              placeholder="seu@email.com"
            />
          </div>
          <div>
            <label className="block text-offwhite/50 text-xs tracking-widest uppercase mb-2">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full bg-offwhite/5 border border-gold/20 text-offwhite placeholder-offwhite/20 px-4 py-3 text-sm focus:outline-none focus:border-gold/60 transition-colors"
              placeholder="Mínimo 6 caracteres"
            />
          </div>

          {error && <p className="text-red-400 text-xs">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gold text-primary py-4 text-xs tracking-[0.2em] uppercase hover:bg-gold/90 transition-colors disabled:opacity-50"
          >
            {loading ? 'Criando conta...' : 'Criar conta'}
          </button>
        </form>

        <p className="text-center text-offwhite/40 text-sm mt-6">
          Já tem conta?{' '}
          <Link href="/login" className="text-gold hover:text-gold/70 transition-colors">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  )
}
