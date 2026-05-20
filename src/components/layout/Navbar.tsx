'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useRef, useEffect, useCallback } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useCart } from '@/contexts/CartContext'
import { useFavorites } from '@/contexts/FavoritesContext'
import { useAuth } from '@/contexts/AuthContext'
import { useScrollPosition } from '@/hooks/useScrollPosition'
import { search, SearchResult } from '@/lib/queries'

type MegaLink = { label: string; href: string; featured?: boolean }
type MegaColumn = { title: string; links: MegaLink[] }
type MegaMenu = { columns: MegaColumn[] }

const megaMenus: Record<string, MegaMenu> = {
  Novidades: {
    columns: [
      {
        title: 'Por Produto',
        links: [
          { label: 'Ver tudo', href: '/novidades', featured: true },
          { label: 'Vestidos', href: '/produtos?categoria=vestidos' },
          { label: 'Roupas', href: '/produtos' },
          { label: 'Calçados', href: '/produtos?categoria=calcados' },
          { label: 'Acessórios', href: '/produtos?categoria=acessorios' },
          { label: 'Conjuntos', href: '/produtos?categoria=conjuntos' },
          { label: 'Beachwear', href: '/produtos?categoria=beachwear' },
        ],
      },
      {
        title: 'Destaques',
        links: [
          { label: 'Mais vendidos', href: '/produtos?ordenar=mais-vendidos', featured: true },
          { label: 'Tendências da semana', href: '/produtos?categoria=tendencias' },
          { label: 'Sale', href: '/produtos?sale=true' },
        ],
      },
      {
        title: 'Por Marca',
        links: [
          { label: 'Amalfi', href: '/marcas/amalfi' },
          { label: 'Ares', href: '/marcas/ares' },
          { label: 'Dress To', href: '/marcas/dress-to' },
          { label: 'New Match', href: '/marcas/new-match' },
          { label: 'Panô', href: '/marcas/pano' },
          { label: 'Sol Brand', href: '/marcas/sol-brand' },
        ],
      },
    ],
  },
  Roupas: {
    columns: [
      {
        title: 'Por Produto',
        links: [
          { label: 'Ver tudo em Roupas', href: '/produtos', featured: true },
          { label: 'Blusas', href: '/produtos?categoria=blusas' },
          { label: 'Calças', href: '/produtos?categoria=calcas' },
          { label: 'Shorts', href: '/produtos?categoria=shorts' },
          { label: 'Macacões', href: '/produtos?categoria=macacoes' },
          { label: 'Conjuntos', href: '/produtos?categoria=conjuntos' },
          { label: 'Kimonos', href: '/produtos?categoria=kimonos' },
          { label: 'Saídas de praia', href: '/produtos?categoria=saidas-de-praia' },
        ],
      },
      {
        title: 'Por Estilo',
        links: [
          { label: 'Casual', href: '/produtos?estilo=casual', featured: true },
          { label: 'Trabalho', href: '/produtos?estilo=trabalho' },
          { label: 'Festa & Eventos', href: '/produtos?estilo=festa' },
          { label: 'Praia & Resort', href: '/produtos?estilo=praia' },
          { label: 'Esportivo', href: '/produtos?estilo=esportivo' },
        ],
      },
      {
        title: 'Curadoria',
        links: [
          { label: 'Novidades', href: '/novidades', featured: true },
          { label: 'Sale', href: '/produtos?sale=true' },
          { label: 'Ver marcas', href: '/marcas' },
        ],
      },
    ],
  },
  Vestidos: {
    columns: [
      {
        title: 'Por Produto',
        links: [
          { label: 'Ver tudo em Vestidos', href: '/produtos?categoria=vestidos', featured: true },
          { label: 'Vestidos Casuais', href: '/produtos?categoria=vestidos-casuais' },
          { label: 'Vestidos de Festa', href: '/produtos?categoria=vestidos-festa' },
          { label: 'Vestidos Midi', href: '/produtos?categoria=vestidos-midi' },
          { label: 'Vestidos Longos', href: '/produtos?categoria=vestidos-longos' },
          { label: 'Minis', href: '/produtos?categoria=vestidos-mini' },
          { label: 'Saídas de praia', href: '/produtos?categoria=saidas-de-praia' },
        ],
      },
      {
        title: 'Por Estampa',
        links: [
          { label: 'Florais', href: '/produtos?categoria=vestidos&estampa=floral', featured: true },
          { label: 'Lisos', href: '/produtos?categoria=vestidos&estampa=liso' },
          { label: 'Animal print', href: '/produtos?categoria=vestidos&estampa=animal' },
          { label: 'Listras', href: '/produtos?categoria=vestidos&estampa=listras' },
          { label: 'Tie-dye', href: '/produtos?categoria=vestidos&estampa=tiedye' },
        ],
      },
      {
        title: 'Em Destaque',
        links: [
          { label: 'Novidades', href: '/novidades', featured: true },
          { label: 'Sale em vestidos', href: '/produtos?categoria=vestidos&sale=true' },
        ],
      },
    ],
  },
  Sapatos: {
    columns: [
      {
        title: 'Por Produto',
        links: [
          { label: 'Ver tudo em Calçados', href: '/produtos?categoria=calcados', featured: true },
          { label: 'Sandálias', href: '/produtos?categoria=sandalias' },
          { label: 'Tênis', href: '/produtos?categoria=tenis' },
          { label: 'Saltos', href: '/produtos?categoria=saltos' },
          { label: 'Rasteiras', href: '/produtos?categoria=rasteiras' },
          { label: 'Mocassins', href: '/produtos?categoria=mocassins' },
          { label: 'Botas', href: '/produtos?categoria=botas' },
          { label: 'Espadrilles', href: '/produtos?categoria=espadrilles' },
        ],
      },
      {
        title: 'Por Ocasião',
        links: [
          { label: 'Praia & Verão', href: '/produtos?categoria=calcados&ocasiao=praia', featured: true },
          { label: 'Trabalho', href: '/produtos?categoria=calcados&ocasiao=trabalho' },
          { label: 'Festa', href: '/produtos?categoria=calcados&ocasiao=festa' },
          { label: 'Casual', href: '/produtos?categoria=calcados&ocasiao=casual' },
        ],
      },
      {
        title: 'Por Marca',
        links: [
          { label: 'Ver todas as marcas', href: '/marcas', featured: true },
          { label: 'Amalfi', href: '/marcas/amalfi' },
          { label: 'Ares', href: '/marcas/ares' },
          { label: 'New Match', href: '/marcas/new-match' },
        ],
      },
    ],
  },
  Acessórios: {
    columns: [
      {
        title: 'Por Produto',
        links: [
          { label: 'Ver tudo em Acessórios', href: '/produtos?categoria=acessorios', featured: true },
          { label: 'Bolsas', href: '/produtos?categoria=bolsas' },
          { label: 'Óculos de sol', href: '/produtos?categoria=oculos' },
          { label: 'Joias & Bijuterias', href: '/produtos?categoria=joias' },
          { label: 'Chapéus & Bonés', href: '/produtos?categoria=chapeus' },
          { label: 'Cintos', href: '/produtos?categoria=cintos' },
          { label: 'Acessórios de cabelo', href: '/produtos?categoria=cabelo' },
          { label: 'Lenços & Echarpes', href: '/produtos?categoria=lencos' },
        ],
      },
      {
        title: 'Por Bolsas',
        links: [
          { label: 'Ver todas as Bolsas', href: '/produtos?categoria=bolsas', featured: true },
          { label: 'Clutches', href: '/produtos?categoria=clutches' },
          { label: 'Totes', href: '/produtos?categoria=totes' },
          { label: 'Mochilas', href: '/produtos?categoria=mochilas' },
          { label: 'Carteiras', href: '/produtos?categoria=carteiras' },
          { label: 'Mini bags', href: '/produtos?categoria=minibags' },
        ],
      },
      {
        title: 'Por Joias',
        links: [
          { label: 'Ver todas as Joias', href: '/produtos?categoria=joias', featured: true },
          { label: 'Colares', href: '/produtos?categoria=colares' },
          { label: 'Brincos', href: '/produtos?categoria=brincos' },
          { label: 'Pulseiras', href: '/produtos?categoria=pulseiras' },
          { label: 'Anéis', href: '/produtos?categoria=aneis' },
        ],
      },
    ],
  },
  Marcas: {
    columns: [
      {
        title: 'Top Marcas',
        links: [
          { label: 'Ver todas as marcas', href: '/marcas', featured: true },
          { label: 'Amalfi', href: '/marcas/amalfi' },
          { label: 'Ares', href: '/marcas/ares' },
          { label: 'Dress To', href: '/marcas/dress-to' },
          { label: 'New Match', href: '/marcas/new-match' },
          { label: 'Panô', href: '/marcas/pano' },
          { label: 'Sol Brand', href: '/marcas/sol-brand' },
        ],
      },
      {
        title: 'Por Estado',
        links: [
          { label: 'São Paulo', href: '/marcas?estado=SP', featured: true },
          { label: 'Rio de Janeiro', href: '/marcas?estado=RJ' },
          { label: 'Minas Gerais', href: '/marcas?estado=MG' },
        ],
      },
      {
        title: 'Descobrir',
        links: [
          { label: 'Marcas em destaque', href: '/marcas', featured: true },
          { label: 'Novas no catálogo', href: '/marcas?ordenar=novos' },
          { label: 'Quero ser parceira', href: '/parceria' },
        ],
      },
    ],
  },
}

const navLinks = [
  { label: 'Novidades', href: '/novidades' },
  { label: 'Roupas', href: '/produtos' },
  { label: 'Vestidos', href: '/produtos?categoria=vestidos' },
  { label: 'Sapatos', href: '/produtos?categoria=calcados' },
  { label: 'Acessórios', href: '/produtos?categoria=acessorios' },
  { label: 'Marcas', href: '/marcas' },
  { label: 'Sale', href: '/produtos?sale=true' },
  { label: 'Quiz ✦', href: '/quiz' },
]

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult | null>(null)
  const [searching, setSearching] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)
  const searchPanelRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()
  const router = useRouter()
  const scrollY = useScrollPosition()
  const { totalItems, openCart } = useCart()
  const { favoriteIds } = useFavorites()
  const { user } = useAuth()

  const scrolled = scrollY > 10
  const mega = activeDropdown ? megaMenus[activeDropdown] : null

  // Debounced live search
  useEffect(() => {
    if (!searchOpen) return
    if (searchQuery.trim().length < 2) {
      setSearchResults(null)
      setSearching(false)
      return
    }
    setSearching(true)
    const timer = setTimeout(async () => {
      const results = await search(searchQuery.trim())
      setSearchResults(results)
      setSearching(false)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery, searchOpen])

  // Close search on click outside
  useEffect(() => {
    if (!searchOpen) return
    const handler = (e: MouseEvent) => {
      if (searchPanelRef.current && !searchPanelRef.current.contains(e.target as Node)) {
        closeSearch()
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [searchOpen])

  const openSearch = useCallback(() => {
    setSearchOpen(true)
    setActiveDropdown(null)
    setTimeout(() => searchRef.current?.focus(), 50)
  }, [])

  const closeSearch = useCallback(() => {
    setSearchOpen(false)
    setSearchQuery('')
    setSearchResults(null)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/produtos?q=${encodeURIComponent(searchQuery.trim())}`)
      closeSearch()
    }
  }

  const handleResultClick = () => closeSearch()

  const hasResults = searchResults && (searchResults.products.length > 0 || searchResults.brands.length > 0)
  const showDropdown = searchOpen && searchQuery.trim().length >= 2

  return (
    <>
      <header className={`bg-primary sticky top-0 z-40 transition-all duration-200 ${scrolled ? 'border-b border-gold/20 shadow-sm' : 'border-b border-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="text-gold font-semibold text-xl tracking-widest uppercase flex-shrink-0" onClick={() => setActiveDropdown(null)}>
              Lund Select
            </Link>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-6 h-full">
              {navLinks.map((link) => {
                const isActive = pathname === link.href.split('?')[0]
                const hasMega = !!megaMenus[link.label]
                const isSale = link.label === 'Sale'
                const isQuiz = link.label.startsWith('Quiz')
                return (
                  <div
                    key={link.label}
                    className="h-full flex items-center"
                    onMouseEnter={() => setActiveDropdown(hasMega ? link.label : null)}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setActiveDropdown(null)}
                      className={`text-[11px] tracking-wider uppercase transition-colors whitespace-nowrap ${
                        isSale
                          ? 'text-gold hover:text-gold/80'
                          : isQuiz
                          ? 'text-gold/70 hover:text-gold'
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
              <button onClick={openSearch} aria-label="Buscar" className="text-offwhite/60 hover:text-gold transition-colors hidden sm:block">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              </button>

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
                className="lg:hidden text-offwhite/60 hover:text-gold transition-colors"
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

      {/* ASOS-style mega dropdown panel */}
      {mega && (
        <>
          {/* Invisible backdrop — closes on cursor leaving the whole area */}
          <div
            className="fixed inset-0 z-30"
            style={{ top: '64px' }}
            onMouseEnter={() => setActiveDropdown(null)}
            onClick={() => setActiveDropdown(null)}
          />

          {/* Mega panel */}
          <div
            className="fixed left-0 right-0 bg-primary border-b border-gold/20 shadow-2xl z-35"
            style={{ top: '64px', zIndex: 35 }}
            onMouseLeave={() => setActiveDropdown(null)}
          >
            <div className="max-w-7xl mx-auto px-8 py-10">
              <div className="flex gap-16">
                {mega.columns.map((col) => (
                  <div key={col.title} className="min-w-[160px]">
                    {/* Section header — ASOS style: small caps, spaced, muted gold */}
                    <p className="text-gold/50 text-[9px] tracking-[0.35em] uppercase mb-5 font-medium">
                      {col.title}
                    </p>
                    <ul className="space-y-0">
                      {col.links.map((item) => (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            onClick={() => setActiveDropdown(null)}
                            className={`block py-1.5 transition-colors tracking-wide ${
                              item.featured
                                ? 'text-offwhite hover:text-gold text-sm font-medium'
                                : 'text-offwhite/50 hover:text-offwhite text-sm'
                            }`}
                          >
                            {item.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}

                {/* Decorative right edge — thin gold rule */}
                <div className="hidden xl:block ml-auto self-stretch border-l border-gold/10" />
              </div>
            </div>
          </div>
        </>
      )}

      {/* Search panel */}
      {searchOpen && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40" onClick={closeSearch} />
          <div
            ref={searchPanelRef}
            className="fixed left-0 right-0 bg-primary border-b border-gold/20 shadow-2xl z-50"
            style={{ top: '64px' }}
          >
            {/* Input row */}
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto px-4 pt-5 pb-4 flex gap-3 items-center">
              <div className="relative flex-1">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-offwhite/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
                <input
                  ref={searchRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Escape' && closeSearch()}
                  placeholder="Buscar por produto ou marca..."
                  className="w-full bg-offwhite/5 border border-gold/20 text-offwhite placeholder-offwhite/20 pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-gold/50 transition-colors"
                />
                {searching && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
                )}
              </div>
              <button
                type="button"
                onClick={closeSearch}
                className="text-offwhite/30 hover:text-offwhite transition-colors"
                aria-label="Fechar"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </form>

            {/* Results dropdown */}
            {showDropdown && (
              <div className="max-w-2xl mx-auto px-4 pb-5">
                {!searching && !hasResults && (
                  <p className="text-offwhite/30 text-sm py-4 text-center">
                    Nenhum resultado para &ldquo;{searchQuery}&rdquo;
                  </p>
                )}

                {/* Brand results */}
                {searchResults && searchResults.brands.length > 0 && (
                  <div className="mb-4">
                    <p className="text-gold/50 text-[10px] tracking-[0.3em] uppercase mb-2">Marcas</p>
                    <div className="flex flex-col">
                      {searchResults.brands.map((brand) => (
                        <Link
                          key={brand.id}
                          href={`/marcas/${brand.slug}`}
                          onClick={handleResultClick}
                          className="flex items-center justify-between px-3 py-2.5 hover:bg-offwhite/5 transition-colors group"
                        >
                          <span className="text-offwhite text-sm group-hover:text-gold transition-colors">{brand.name}</span>
                          <span className="text-offwhite/30 text-xs">{brand.state} · {brand.category}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Product results */}
                {searchResults && searchResults.products.length > 0 && (
                  <div className="mb-4">
                    <p className="text-gold/50 text-[10px] tracking-[0.3em] uppercase mb-2">Produtos</p>
                    <div className="flex flex-col gap-1">
                      {searchResults.products.map((product) => (
                        <Link
                          key={product.id}
                          href={`/produtos/${product.slug}`}
                          onClick={handleResultClick}
                          className="flex items-center gap-3 px-3 py-2 hover:bg-offwhite/5 transition-colors group"
                        >
                          <div className="w-10 h-12 bg-offwhite/5 flex-shrink-0 relative overflow-hidden">
                            {product.image ? (
                              <Image src={product.image} alt={product.name} fill className="object-cover" sizes="40px" />
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-gold/20 text-[8px]">—</span>
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-offwhite text-sm group-hover:text-gold transition-colors truncate">{product.name}</p>
                            <p className="text-offwhite/30 text-xs">{product.brand}</p>
                          </div>
                          <p className="text-gold text-sm font-medium flex-shrink-0">
                            R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </p>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* See all link */}
                {hasResults && (
                  <Link
                    href={`/produtos?q=${encodeURIComponent(searchQuery.trim())}`}
                    onClick={handleResultClick}
                    className="block text-center text-gold/60 hover:text-gold text-xs tracking-widest uppercase transition-colors pt-3 border-t border-gold/10"
                  >
                    Ver todos os resultados para &ldquo;{searchQuery}&rdquo; →
                  </Link>
                )}
              </div>
            )}
          </div>
        </>
      )}

      {/* Mobile full-screen menu */}
      <div className={`fixed inset-0 z-50 bg-primary flex flex-col transition-transform duration-300 lg:hidden ${menuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
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

        <nav className="flex flex-col px-6 py-8 gap-1 flex-1 overflow-y-auto">
          {navLinks.map((link) => {
            const hasMega = !!megaMenus[link.label]
            const isExpanded = mobileExpanded === link.label
            const isSale = link.label === 'Sale'
            const isQuiz = link.label.startsWith('Quiz')
            return (
              <div key={link.label} className="border-b border-gold/10 last:border-0">
                <div className="flex items-center justify-between py-4">
                  <Link
                    href={link.href}
                    className={`text-lg font-light tracking-wide transition-colors ${
                      isSale || isQuiz ? 'text-gold' : 'text-offwhite hover:text-gold'
                    }`}
                    onClick={() => setMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                  {hasMega && (
                    <button
                      onClick={() => setMobileExpanded(isExpanded ? null : link.label)}
                      className="text-offwhite/40 hover:text-gold transition-colors p-1"
                      aria-label={isExpanded ? 'Fechar' : 'Expandir'}
                    >
                      <svg className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  )}
                </div>

                {/* Mobile mega sub-menu */}
                {hasMega && isExpanded && (
                  <div className="pb-4 pl-2">
                    {megaMenus[link.label].columns.map((col) => (
                      <div key={col.title} className="mb-4">
                        <p className="text-gold/40 text-[9px] tracking-[0.3em] uppercase mb-2">{col.title}</p>
                        <div className="flex flex-col gap-1">
                          {col.links.map((item) => (
                            <Link
                              key={item.href}
                              href={item.href}
                              className={`py-1 transition-colors text-sm ${
                                item.featured
                                  ? 'text-offwhite/80 hover:text-gold font-medium'
                                  : 'text-offwhite/40 hover:text-offwhite'
                              }`}
                              onClick={() => setMenuOpen(false)}
                            >
                              {item.label}
                            </Link>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </nav>

        <div className="px-6 py-6 border-t border-gold/10 flex gap-6">
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
