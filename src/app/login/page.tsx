'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const ok = await login(email, password)
    setLoading(false)
    if (ok) router.push('/conta')
    else setError('E-mail ou senha inválidos. Tente novamente.')
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <Link href="/" className="text-gold font-semibold text-xl tracking-widest uppercase">
            Lund Select
          </Link>
          <h1 className="text-offwhite text-2xl font-light mt-6 mb-2">Entrar</h1>
          <p className="text-offwhite/40 text-sm">Bem-vinda de volta</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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
              className="w-full bg-offwhite/5 border border-gold/20 text-offwhite placeholder-offwhite/20 px-4 py-3 text-sm focus:outline-none focus:border-gold/60 transition-colors"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-red-400 text-xs">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gold text-primary py-4 text-xs tracking-[0.2em] uppercase hover:bg-gold/90 transition-colors disabled:opacity-50"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className="text-center text-offwhite/40 text-sm mt-6">
          Não tem conta?{' '}
          <Link href="/cadastro" className="text-gold hover:text-gold/70 transition-colors">
            Cadastre-se
          </Link>
        </p>
      </div>
    </div>
  )
}
