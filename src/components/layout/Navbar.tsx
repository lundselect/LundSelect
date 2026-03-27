'use client'

import Link from 'next/link'
import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { useCart } from '@/contexts/CartContext'
import { useFavorites } from '@/contexts/FavoritesContext'
import { useAuth } from '@/contexts/AuthContext'
import { useScrollPosition } from '@/hooks/useScrollPosition'

const megaMenus: Record<string, { columns: { title: string; links: { label: string; href: string }[] }[] }> = {
  Roupas: {
    columns: [
      {
        title: 'Categorias',
        links: [
          { label: 'Ver tudo', href: '/produtos' },
          { label: 'Vestidos', href: '/produtos?categoria=vestidos' },
          { label: 'Blusas', href: '/produtos?categoria=blusas' },
          { label: 'Calças', href: '/produtos?categoria=calcas' },
          { label: 'Shorts', href: '/produtos?categoria=shorts' },
          { label: 'Macacões', href: '/produtos?categoria=macacoes' },
          { label: 'Conjuntos', href: '/produtos?categoria=conjuntos' },
        ],
      },
      {
        title: 'Praia & Resort',
        links: [
          { label: 'Beachwear', href: '/produtos?categoria=beachwear' },
          { label: 'Resortwear', href: '/produtos?categoria=resortwear' },
          { label: 'Kimonos', href: '/produtos?categoria=kimonos' },
          { label: 'Saídas de praia', href: '/produtos?categoria=saidas-de-praia' },
          { label: 'Biquínis', href: '/produtos?categoria=biquinis' },
        ],
      },
      {
        title: 'Curadoria',
        links: [
          { label: 'Novidades', href: '/produtos?categoria=novidades' },
          { label: 'Sale', href: '/produtos?categoria=sale' },
          { label: 'Marcas parceiras', href: '/marcas-parceiras' },
        ],
      },
    ],
  },
  Novidades: {
    columns: [
      {
        title: 'Em destaque',
        links: [
          { label: 'Shop new arrivals', href: '/novidades' },
          { label: 'Mais vendidos', href: '/produtos?ordenar=mais-vendidos' },
          { label: 'Tendências', href: '/produtos?categoria=tendencias' },
        ],
      },
      {
        title: 'Por marca',
        links: [
          { label: 'Amalfi', href: '/marcas/amalfi' },
          { label: 'Ares', href: '/marcas/ares' },
          { label: 'Dress To', href: '/marcas/dress-to' },
          { label: 'Panô', href: '/marcas/pano' },
          { label: 'Sol Brand', href: '/marcas/sol-brand' },
        ],
      },
    ],
  },
  Acessórios: {
    columns: [
      {
        title: 'Categorias',
        links: [
          { label: 'Ver tudo', href: '/produtos?categoria=acessorios' },
          { label: 'Bolsas', href: '/produtos?categoria=bolsas' },
          { label: 'Óculos', href: '/produtos?categoria=oculos' },
          { label: 'Chapéus & Bonés', href: '/produtos?categoria=chapeus' },
          { label: 'Joias & Bijuterias', href: '/produtos?categoria=joias' },
          { label: 'Acessórios de cabelo', href: '/produtos?categoria=cabelo' },
          { label: 'Cintos', href: '/produtos?categoria=cintos' },
          { label: 'Lenços & Echarpes', href: '/produtos?categoria=lencos' },
        ],
      },
      {
        title: 'Em destaque',
        links: [
          { label: 'Novidades', href: '/produtos?categoria=acessorios&ordenar=novidades' },
          { label: 'Sale', href: '/produtos?categoria=acessorios&sale=true' },
        ],
      },
    ],
  },
  Marcas: {
    columns: [
      {
        title: 'Marcas parceiras',
        links: [
          { label: 'Ver todas', href: '/marcas-parceiras' },
          { label: 'Amalfi', href: '/marcas/amalfi' },
          { label: 'Ares', href: '/marcas/ares' },
          { label: 'Dress To', href: '/marcas/dress-to' },
          { label: 'Panô', href: '/marcas/pano' },
          { label: 'Sol Brand', href: '/marcas/sol-brand' },
        ],
      },
      {
        title: 'Por estado',
        links: [
          { label: 'São Paulo', href: '/marcas-parceiras?estado=SP' },
          { label: 'Rio de Janeiro', href: '/marcas-parceiras?estado=RJ' },
          { label: 'Minas Gerais', href: '/marcas-parceiras?estado=MG' },
        ],
      },
    ],
  },
}

const navLinks = [
  { label: 'Novidades', href: '/produtos?categoria=novidades' },
  { label: 'Roupas', href: '/produtos' },
  { label: 'Acessórios', href: '/produtos?categoria=acessorios' },
  { label: 'Marcas', href: '/marcas-parceiras' },
  { label: 'Sale', href: '/produtos?categoria=sale' },
]

// navLinks labels must match megaMenus keys exactly for dropdowns to work

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const pathname = usePathname()
  const scrollY = useScrollPosition()
  const { totalItems, openCart } = useCart()
  const { favoriteIds } = useFavorites()
  const { user } = useAuth()

  const scrolled = scrollY > 10
  const mega = activeDropdown ? megaMenus[activeDropdown] : null

  return (
    <>
      <header className={`bg-primary sticky top-0 z-40 transition-all duration-200 ${scrolled ? 'border-b border-gold/20 shadow-sm' : 'border-b border-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="text-gold font-semibold text-xl tracking-widest uppercase" onClick={() => setActiveDropdown(null)}>
              Lund Select
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-8 h-full">
              {navLinks.map((link) => {
                const isActive = pathname === link.href.split('?')[0]
                const hasMega = !!megaMenus[link.label]
                return (
                  <div
                    key={link.label}
                    className="h-full flex items-center"
                    onMouseEnter={() => setActiveDropdown(hasMega ? link.label : null)}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setActiveDropdown(null)}
                      className={`text-xs tracking-wider uppercase transition-colors ${
                        link.label === 'Sale'
                          ? 'text-gold hover:text-gold/80'
                          : activeDropdown === link.label
                          ? 'text-offwhite'
                          : isActive
                          ? 'text-offwhite border-b border-gold'
                          : 'text-offwhite/60 hover:text-offwhite'
                      }`}
                    >
                      {link.label}
                    </Link>
                  </div>
                )
              })}
            </nav>

            {/* Icons */}
            <div className="flex items-center gap-4" onMouseEnter={() => setActiveDropdown(null)}>
              <Link href="/produtos" aria-label="Buscar" className="text-offwhite/60 hover:text-gold transition-colors hidden sm:block">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              </Link>

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

              <Link href={user ? '/conta' : '/login'} aria-label="Conta" className="text-offwhite/60 hover:text-gold transition-colors hidden sm:block">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </Link>

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
      </header>

      {/* Mega dropdown panel */}
      {mega && (
        <>
          {/* Backdrop — closes dropdown when cursor leaves the dropdown area */}
          <div
            className="fixed inset-0 z-30"
            style={{ top: '64px' }}
            onMouseEnter={() => setActiveDropdown(null)}
            onClick={() => setActiveDropdown(null)}
          />

          {/* Dropdown panel */}
          <div
            className="fixed left-0 right-0 bg-primary border-b border-gold/20 shadow-2xl z-35"
            style={{ top: '64px', zIndex: 35 }}
          >
            <div
              className="max-w-7xl mx-auto px-8 py-8 flex gap-16"
              onMouseLeave={() => setActiveDropdown(null)}
            >
              {mega.columns.map((col) => (
                <div key={col.title}>
                  <p className="text-gold/60 text-[10px] tracking-[0.3em] uppercase mb-4">{col.title}</p>
                  <ul className="space-y-2.5">
                    {col.links.map((item) => (
                      <li key={item.label}>
                        <Link
                          href={item.href}
                          onClick={() => setActiveDropdown(null)}
                          className="text-offwhite/60 hover:text-offwhite text-sm tracking-wide transition-colors"
                        >
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

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
        <nav className="flex flex-col px-8 py-10 gap-6 flex-1 overflow-y-auto">
          {navLinks.map((link) => (
            <div key={link.label}>
              <Link
                href={link.href}
                className={`text-2xl font-light tracking-wide transition-colors ${link.label === 'Sale' ? 'text-gold' : 'text-offwhite hover:text-gold'}`}
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
              {megaMenus[link.label] && (
                <div className="mt-3 ml-2 flex flex-col gap-2">
                  {megaMenus[link.label].columns.flatMap((col) =>
                    col.links.slice(1).map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="text-offwhite/40 hover:text-offwhite text-sm tracking-wide transition-colors"
                        onClick={() => setMenuOpen(false)}
                      >
                        {item.label}
                      </Link>
                    ))
                  )}
                </div>
              )}
            </div>
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
    </>
  )
}
