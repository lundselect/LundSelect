'use client'

import Link from 'next/link'
import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { useCart } from '@/contexts/CartContext'
import { useFavorites } from '@/contexts/FavoritesContext'
import { useAuth } from '@/contexts/AuthContext'
import { useScrollPosition } from '@/hooks/useScrollPosition'

const navLinks = [
  { label: 'Novidades', href: '/produtos?categoria=novidades' },
  { label: 'Roupas', href: '/produtos?categoria=roupas' },
  { label: 'Acessórios', href: '/produtos?categoria=acessórios' },
  { label: 'Marcas', href: '/marcas-parceiras' },
  { label: 'Sale', href: '/produtos?categoria=sale' },
]

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()
  const scrollY = useScrollPosition()
  const { totalItems, openCart } = useCart()
  const { favoriteIds } = useFavorites()
  const { user } = useAuth()

  const scrolled = scrollY > 10

  return (
    <header className={`bg-primary sticky top-0 z-30 transition-all duration-200 ${scrolled ? 'border-b border-gold/20 shadow-sm' : 'border-b border-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="text-gold font-semibold text-xl tracking-widest uppercase">
            Lund Select
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive = pathname === link.href.split('?')[0]
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`text-xs tracking-wider uppercase transition-colors pb-0.5 ${
                    link.label === 'Sale'
                      ? 'text-gold hover:text-gold/80'
                      : isActive
                      ? 'text-offwhite border-b border-gold'
                      : 'text-offwhite/60 hover:text-offwhite'
                  }`}
                >
                  {link.label}
                </Link>
              )
            })}
          </nav>

          {/* Icons */}
          <div className="flex items-center gap-4">
            {/* Search */}
            <Link href="/produtos" aria-label="Buscar" className="text-offwhite/60 hover:text-gold transition-colors hidden sm:block">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </Link>

            {/* Wishlist */}
            <Link href="/favoritos" aria-label="Favoritos" className="relative text-offwhite/60 hover:text-gold transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </svg>
              {favoriteIds.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-gold text-primary text-[9px] font-semibold rounded-full w-4 h-4 flex items-center justify-center">
                  {favoriteIds.length > 9 ? '9+' : favoriteIds.length}
                </span>
              )}
            </Link>

            {/* Cart */}
            <button onClick={openCart} aria-label="Carrinho" className="relative text-offwhite/60 hover:text-gold transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" />
              </svg>
              {totalItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-gold text-primary text-[9px] font-semibold rounded-full w-4 h-4 flex items-center justify-center">
                  {totalItems > 9 ? '9+' : totalItems}
                </span>
              )}
            </button>

            {/* Account */}
            <Link href={user ? '/conta' : '/login'} aria-label="Conta" className="text-offwhite/60 hover:text-gold transition-colors hidden sm:block">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            </Link>

            {/* Mobile menu button */}
            <button
              className="md:hidden text-offwhite/60 hover:text-gold transition-colors"
              onClick={() => setMenuOpen(true)}
              aria-label="Menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile full-screen menu */}
      <div className={`fixed inset-0 z-50 bg-primary flex flex-col transition-transform duration-300 md:hidden ${menuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between px-4 h-16 border-b border-gold/10">
          <Link href="/" className="text-gold font-semibold text-xl tracking-widest uppercase" onClick={() => setMenuOpen(false)}>
            Lund Select
          </Link>
          <button onClick={() => setMenuOpen(false)} className="text-offwhite/60 hover:text-gold transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <nav className="flex flex-col px-8 py-10 gap-6 flex-1">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className={`text-2xl font-light tracking-wide transition-colors ${link.label === 'Sale' ? 'text-gold' : 'text-offwhite hover:text-gold'}`}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="px-8 py-8 border-t border-gold/10 flex gap-6">
          <Link href={user ? '/conta' : '/login'} className="text-offwhite/50 hover:text-gold text-sm tracking-widest uppercase transition-colors" onClick={() => setMenuOpen(false)}>
            {user ? 'Minha conta' : 'Entrar'}
          </Link>
          <Link href="/favoritos" className="text-offwhite/50 hover:text-gold text-sm tracking-widest uppercase transition-colors" onClick={() => setMenuOpen(false)}>
            Favoritos
          </Link>
        </div>
      </div>
    </header>
  )
}
