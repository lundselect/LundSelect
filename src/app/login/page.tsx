'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'

type Step = 'email' | 'login' | 'register'

export default function LoginPage() {
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { login, register } = useAuth()
  const router = useRouter()

  const handleEmailContinue = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    // Attempt login with dummy password to detect if account exists
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password: '___check___',
    })
    setLoading(false)
    if (!signInError || signInError.message === 'Invalid login credentials') {
      setStep('login')
    } else {
      setStep('register')
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const err = await login(email, password)
    setLoading(false)
    if (!err) router.push('/conta')
    else if (err.includes('Invalid login credentials')) {
      setError('Senha incorreta. Tente novamente.')
    } else {
      setError(err)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const err = await register(name, email, password)
    setLoading(false)
    if (!err) router.push('/conta')
    else setError(err)
  }

  const handleGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/conta` },
    })
  }

  const handleApple = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: { redirectTo: `${window.location.origin}/conta` },
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="text-gold font-semibold text-xl tracking-widest uppercase">
            Lund Select
          </Link>
          <p className="text-offwhite/40 text-sm mt-3">
            {step === 'email' && 'Entrar ou criar conta'}
            {step === 'login' && 'Bem-vinda de volta'}
            {step === 'register' && 'Criar sua conta'}
          </p>
        </div>

        {/* Email step */}
        {step === 'email' && (
          <div className="space-y-4">
            <form onSubmit={handleEmailContinue} className="space-y-4">
              <div>
                <label className="block text-offwhite/50 text-xs tracking-widest uppercase mb-2">E-mail</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                  className="w-full bg-offwhite/5 border border-gold/20 text-offwhite placeholder-offwhite/20 px-4 py-3 text-sm focus:outline-none focus:border-gold/60 transition-colors"
                  placeholder="seu@email.com"
                />
              </div>
              {error && <p className="text-red-400 text-xs">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gold text-primary py-4 text-xs tracking-[0.2em] uppercase hover:bg-gold/90 transition-colors disabled:opacity-50"
              >
                {loading ? 'Verificando...' : 'Continuar'}
              </button>
            </form>

            <div className="flex items-center gap-3 my-2">
              <div className="flex-1 h-px bg-gold/15" />
              <span className="text-offwhite/25 text-xs">ou</span>
              <div className="flex-1 h-px bg-gold/15" />
            </div>

            {/* Google */}
            <button
              onClick={handleGoogle}
              className="w-full border border-gold/20 text-offwhite/70 hover:text-offwhite hover:border-gold/40 py-3 text-xs tracking-widest uppercase transition-colors flex items-center justify-center gap-3"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continuar com Google
            </button>

            {/* Apple */}
            <button
              onClick={handleApple}
              className="w-full border border-gold/20 text-offwhite/70 hover:text-offwhite hover:border-gold/40 py-3 text-xs tracking-widest uppercase transition-colors flex items-center justify-center gap-3"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
              Continuar com Apple
            </button>
          </div>
        )}

        {/* Login step */}
        {step === 'login' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <button onClick={() => { setStep('email'); setError('') }} className="text-offwhite/30 hover:text-offwhite transition-colors text-xs">←</button>
              <p className="text-offwhite/40 text-xs">{email}</p>
            </div>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-offwhite/50 text-xs tracking-widest uppercase mb-2">Senha</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoFocus
                  className="w-full bg-offwhite/5 border border-gold/20 text-offwhite placeholder-offwhite/20 px-4 py-3 text-sm focus:outline-none focus:border-gold/60 transition-colors"
                  placeholder="••••••••"
                />
              </div>
              {error && (
                <div>
                  <p className="text-red-400 text-xs">{error}</p>
                  <button type="button" onClick={() => { setStep('register'); setError('') }} className="text-gold text-xs mt-1 hover:text-gold/70 transition-colors">
                    Não tem conta? Criar agora
                  </button>
                </div>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gold text-primary py-4 text-xs tracking-[0.2em] uppercase hover:bg-gold/90 transition-colors disabled:opacity-50"
              >
                {loading ? 'Entrando...' : 'Entrar'}
              </button>
            </form>
          </div>
        )}

        {/* Register step */}
        {step === 'register' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <button onClick={() => { setStep('email'); setError('') }} className="text-offwhite/30 hover:text-offwhite transition-colors text-xs">←</button>
              <p className="text-offwhite/40 text-xs">{email}</p>
            </div>
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-offwhite/50 text-xs tracking-widest uppercase mb-2">Nome</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoFocus
                  className="w-full bg-offwhite/5 border border-gold/20 text-offwhite placeholder-offwhite/20 px-4 py-3 text-sm focus:outline-none focus:border-gold/60 transition-colors"
                  placeholder="Seu nome"
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
            <p className="text-center text-offwhite/30 text-xs">
              Já tem conta?{' '}
              <button onClick={() => { setStep('login'); setError('') }} className="text-gold hover:text-gold/70 transition-colors">
                Entrar
              </button>
            </p>
          </div>
        )}

      </div>
    </div>
  )
}
