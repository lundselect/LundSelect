'use client'

import Link from 'next/link'
import { useState } from 'react'
import { categories } from '@/lib/data'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="bg-primary border-b border-gold/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="text-gold font-semibold text-xl tracking-widest uppercase">
            Lund Select
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {categories.map((cat) => (
              <Link
                key={cat}
                href={cat === 'Sale' ? '/produtos?categoria=sale' : `/produtos?categoria=${cat.toLowerCase()}`}
                className="text-offwhite/70 hover:text-gold text-sm tracking-wider uppercase transition-colors"
              >
                {cat}
              </Link>
            ))}
          </nav>

          {/* Icons */}
          <div className="flex items-center gap-4">
            <button aria-label="Buscar" className="text-offwhite/70 hover:text-gold transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </button>
            <button aria-label="Carrinho" className="text-offwhite/70 hover:text-gold transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" />
              </svg>
            </button>
            {/* Mobile menu button */}
            <button
              className="md:hidden text-offwhite/70 hover:text-gold transition-colors"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {menuOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                }
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-gold/20 bg-primary">
          <nav className="flex flex-col px-4 py-4 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat}
                href={`/produtos?categoria=${cat.toLowerCase()}`}
                className="text-offwhite/70 hover:text-gold text-sm tracking-wider uppercase transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                {cat}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  )
}
