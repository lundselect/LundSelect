'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useFavorites } from '@/contexts/FavoritesContext'
import { products } from '@/lib/data'

const quickLinks = [
  { label: 'Meus pedidos', icon: '📦', href: '#pedidos' },
  { label: 'Devoluções', icon: '↩️', href: '#devolucoes' },
  { label: 'Ajuda', icon: '💬', href: '#ajuda' },
  { label: 'Desconto estudantil', icon: '🎓', href: '#estudantil' },
  { label: 'Vale-presentes', icon: '🎁', href: '#vale' },
]

const accountSections = [
  { label: 'Meus dados', id: 'dados' },
  { label: 'Endereços', id: 'enderecos' },
  { label: 'Pagamento', id: 'pagamento' },
  { label: 'Preferências de contato', id: 'contato' },
  { label: 'Contas sociais', id: 'social' },
]

export default function ContaPage() {
  const { user, isLoading, logout } = useAuth()
  const { favoriteIds } = useFavorites()
  const router = useRouter()
  const [activeSection, setActiveSection] = useState('dados')

  useEffect(() => {
    if (!isLoading && !user) router.push('/login')
  }, [user, isLoading, router])

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

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Profile header */}
      <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center mb-12 pb-12 border-b border-gold/10">
        {/* Avatar — last favorited product or placeholder */}
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
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-12">
        {quickLinks.map((link) => (
          <Link
            key={link.label}
            href={link.href}
            className="border border-gold/10 hover:border-gold/30 p-4 flex flex-col gap-2 transition-colors group"
          >
            <span className="text-xl">{link.icon}</span>
            <span className="text-offwhite/60 group-hover:text-offwhite text-xs tracking-wide transition-colors">{link.label}</span>
          </Link>
        ))}
      </div>

      {/* Account sections */}
      <div className="flex flex-col sm:flex-row gap-8">
        {/* Sidebar */}
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

        {/* Content */}
        <div className="flex-1 border border-gold/10 p-6">
          {activeSection === 'dados' && (
            <div>
              <h2 className="text-offwhite text-lg font-light mb-6">Meus dados</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-offwhite/40 text-xs tracking-widest uppercase mb-2">Nome completo</label>
                  <input defaultValue={user.name} className="w-full bg-offwhite/5 border border-gold/20 text-offwhite px-4 py-3 text-sm focus:outline-none focus:border-gold/60 transition-colors" />
                </div>
                <div>
                  <label className="block text-offwhite/40 text-xs tracking-widest uppercase mb-2">E-mail</label>
                  <input defaultValue={user.email} type="email" className="w-full bg-offwhite/5 border border-gold/20 text-offwhite px-4 py-3 text-sm focus:outline-none focus:border-gold/60 transition-colors" />
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

          {activeSection === 'enderecos' && (
            <div>
              <h2 className="text-offwhite text-lg font-light mb-6">Endereços</h2>
              <div className="border border-dashed border-gold/20 p-8 text-center">
                <p className="text-offwhite/30 text-sm mb-4">Nenhum endereço cadastrado</p>
                <button className="text-gold text-xs tracking-widest uppercase border border-gold/30 px-6 py-2 hover:border-gold transition-colors">
                  Adicionar endereço
                </button>
              </div>
            </div>
          )}

          {activeSection === 'pagamento' && (
            <div>
              <h2 className="text-offwhite text-lg font-light mb-6">Pagamento</h2>
              <div className="border border-dashed border-gold/20 p-8 text-center">
                <p className="text-offwhite/30 text-sm mb-4">Nenhum método de pagamento salvo</p>
                <button className="text-gold text-xs tracking-widest uppercase border border-gold/30 px-6 py-2 hover:border-gold transition-colors">
                  Adicionar cartão
                </button>
              </div>
            </div>
          )}

          {activeSection === 'contato' && (
            <div>
              <h2 className="text-offwhite text-lg font-light mb-6">Preferências de contato</h2>
              <div className="space-y-4">
                {['Novidades e lançamentos', 'Promoções e Sale', 'Newsletter semanal'].map((pref) => (
                  <label key={pref} className="flex items-center gap-3 cursor-pointer group">
                    <input type="checkbox" className="accent-gold" />
                    <span className="text-offwhite/60 group-hover:text-offwhite text-sm transition-colors">{pref}</span>
                  </label>
                ))}
                <button className="bg-gold text-primary px-8 py-3 text-xs tracking-[0.2em] uppercase hover:bg-gold/90 transition-colors mt-2">
                  Salvar
                </button>
              </div>
            </div>
          )}

          {activeSection === 'social' && (
            <div>
              <h2 className="text-offwhite text-lg font-light mb-6">Contas sociais</h2>
              <div className="space-y-3">
                {['Google', 'Instagram', 'Facebook'].map((social) => (
                  <div key={social} className="flex items-center justify-between border border-gold/10 px-4 py-3">
                    <span className="text-offwhite/60 text-sm">{social}</span>
                    <button className="text-gold/50 hover:text-gold text-xs tracking-widest uppercase transition-colors">Conectar</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
