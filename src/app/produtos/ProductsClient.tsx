'use client'

import { useState, useMemo } from 'react'
import { Brand, Product } from '@/types'
import ProductCard from '@/components/ui/ProductCard'
import PriceRangeFilter from '@/components/ui/PriceRangeFilter'

const CLOTHING_SUBCATS = ['Blusas', 'Calças', 'Vestidos', 'Macacões', 'Beachwear', 'Resortwear']
const ACCESSORIES_SUBCATS = ['Bolsas', 'Joias', 'Chapéus', 'Beachwear']
const SHOES_SUBCATS = ['Saltos', 'Rasteiras', 'Sandálias', 'Tênis', 'Botas', 'Mocassins', 'Mules']

type SortKey = 'newest' | 'price-asc' | 'price-desc' | 'az'

interface Props {
  initialCategory?: string
  initialBrand?: string
  initialSearch?: string
  brands: Brand[]
  products: Product[]
  heading?: string
  subheading?: string
  showPageHeader?: boolean
  noContainer?: boolean
}

function norm(s: string) {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

function Chip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 bg-gold/10 border border-gold/30 text-gold text-xs tracking-wide px-2.5 py-1">
      {label}
      <button onClick={onRemove} aria-label={`Remover filtro ${label}`} className="text-gold/60 hover:text-gold transition-colors leading-none">
        ×
      </button>
    </span>
  )
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg className={`w-3 h-3 transition-transform duration-200 flex-shrink-0 ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  )
}

export default function ProductsClient({
  initialCategory, initialBrand, initialSearch,
  brands, products,
  heading, subheading,
  showPageHeader = true, noContainer = false,
}: Props) {
  const minPrice = useMemo(() => Math.floor(Math.min(...products.map(p => p.price))), [products])
  const maxPrice = useMemo(() => Math.ceil(Math.max(...products.map(p => p.price))), [products])

  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    initialCategory ? decodeURIComponent(initialCategory) : null
  )
  const [selectedBrands, setSelectedBrands] = useState<string[]>(
    initialBrand ? [initialBrand] : []
  )
  const [searchText, setSearchText] = useState(initialSearch ?? '')
  const [priceMin, setPriceMin] = useState(minPrice)
  const [priceMax, setPriceMax] = useState(maxPrice)
  const [sortBy, setSortBy] = useState<SortKey>('newest')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [roupasOpen, setRoupasOpen] = useState(true)
  const [acessoriosOpen, setAcessoriosOpen] = useState(false)
  const [sapatosOpen, setSapatosOpen] = useState(false)

  // Brand counts based on full product list
  const brandCounts = useMemo(() => {
    const map: Record<string, number> = {}
    products.forEach(p => { map[p.brandSlug] = (map[p.brandSlug] ?? 0) + 1 })
    return map
  }, [products])

  const toggleBrand = (slug: string) => {
    setSelectedBrands(prev =>
      prev.includes(slug) ? prev.filter(s => s !== slug) : [...prev, slug]
    )
  }

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const cat = selectedCategory ? norm(selectedCategory) : null

      if (cat) {
        if (cat === 'novidades') {
          if (!p.isNew) return false
        } else if (cat === 'sale') {
          if (!p.onSale) return false
        } else if (cat === 'roupas') {
          const all = [...CLOTHING_SUBCATS, 'Roupas'].map(norm)
          if (!all.includes(norm(p.category))) return false
        } else if (cat === 'acessorios') {
          const all = [...ACCESSORIES_SUBCATS, 'Acessórios'].map(norm)
          if (!all.includes(norm(p.category))) return false
        } else if (cat === 'sapatos') {
          const all = [...SHOES_SUBCATS, 'Sapatos', 'Calçados'].map(norm)
          if (!all.includes(norm(p.category))) return false
        } else {
          if (norm(p.category) !== cat) return false
        }
      }

      if (selectedBrands.length > 0 && !selectedBrands.includes(p.brandSlug)) return false
      if (p.price < priceMin || p.price > priceMax) return false
      if (searchText.trim()) {
        const q = norm(searchText)
        if (!norm(p.name).includes(q) && !norm(p.brand).includes(q)) return false
      }
      return true
    })
  }, [selectedCategory, selectedBrands, priceMin, priceMax, searchText, products])

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price
      if (sortBy === 'price-desc') return b.price - a.price
      if (sortBy === 'az') return a.name.localeCompare(b.name, 'pt-BR')
      // newest: by createdAt desc, fallback keeps original order
      if (sortBy === 'newest') {
        if (a.createdAt && b.createdAt) return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        if (a.createdAt) return -1
        if (b.createdAt) return 1
      }
      return 0
    })
  }, [filtered, sortBy])

  const priceActive = priceMin > minPrice || priceMax < maxPrice
  const hasFilters = selectedCategory || selectedBrands.length > 0 || priceActive || searchText.trim()

  const clearFilters = () => {
    setSelectedCategory(null)
    setSelectedBrands([])
    setSearchText('')
    setPriceMin(minPrice)
    setPriceMax(maxPrice)
  }

  const selectSub = (sub: string) => setSelectedCategory(selectedCategory === sub ? null : sub)
  const isActive = (cat: string) => selectedCategory?.toLowerCase() === cat.toLowerCase()

  const SidebarContent = (
    <div className="space-y-8">
      {/* Category */}
      <div>
        <h3 className="text-offwhite/40 text-xs tracking-[0.3em] uppercase mb-4">Categoria</h3>
        <ul className="space-y-3">
          {/* Roupas */}
          <li>
            <button
              onClick={() => setRoupasOpen(!roupasOpen)}
              className={`flex items-center gap-2 text-sm w-full text-left transition-colors ${
                roupasOpen || CLOTHING_SUBCATS.includes(selectedCategory ?? '') ? 'text-offwhite' : 'text-offwhite/50 hover:text-offwhite'
              }`}
            >
              <span>Roupas</span>
              <ChevronIcon open={roupasOpen} />
            </button>
            {roupasOpen && (
              <ul className="mt-3 space-y-3">
                {CLOTHING_SUBCATS.map((sub) => (
                  <li key={sub}>
                    <button
                      onClick={() => selectSub(sub)}
                      className={`text-sm pl-2 transition-colors ${selectedCategory === sub ? 'text-gold' : 'text-offwhite/40 hover:text-offwhite'}`}
                    >
                      {sub}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </li>

          {/* Acessórios */}
          <li>
            <button
              onClick={() => setAcessoriosOpen(!acessoriosOpen)}
              className={`flex items-center gap-2 text-sm w-full text-left transition-colors ${
                acessoriosOpen || ACCESSORIES_SUBCATS.includes(selectedCategory ?? '') ? 'text-offwhite' : 'text-offwhite/50 hover:text-offwhite'
              }`}
            >
              <span>Acessórios</span>
              <ChevronIcon open={acessoriosOpen} />
            </button>
            {acessoriosOpen && (
              <ul className="mt-3 space-y-3">
                {ACCESSORIES_SUBCATS.map((sub) => (
                  <li key={sub}>
                    <button
                      onClick={() => selectSub(sub)}
                      className={`text-sm pl-2 transition-colors ${selectedCategory === sub ? 'text-gold' : 'text-offwhite/40 hover:text-offwhite'}`}
                    >
                      {sub}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </li>

          {/* Sapatos */}
          <li>
            <button
              onClick={() => setSapatosOpen(!sapatosOpen)}
              className={`flex items-center gap-2 text-sm w-full text-left transition-colors ${
                sapatosOpen || SHOES_SUBCATS.includes(selectedCategory ?? '') ? 'text-offwhite' : 'text-offwhite/50 hover:text-offwhite'
              }`}
            >
              <span>Sapatos</span>
              <ChevronIcon open={sapatosOpen} />
            </button>
            {sapatosOpen && (
              <ul className="mt-3 space-y-3">
                {SHOES_SUBCATS.map((sub) => (
                  <li key={sub}>
                    <button
                      onClick={() => selectSub(sub)}
                      className={`text-sm pl-2 transition-colors ${selectedCategory === sub ? 'text-gold' : 'text-offwhite/40 hover:text-offwhite'}`}
                    >
                      {sub}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </li>

          {/* Novidades & Sale */}
          {(['Novidades', 'Sale'] as const).map((cat) => (
            <li key={cat}>
              <button
                onClick={() => setSelectedCategory(isActive(cat) ? null : cat)}
                className={`text-sm transition-colors ${isActive(cat) ? 'text-gold' : 'text-offwhite/50 hover:text-offwhite'}`}
              >
                {cat}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Brands — multi-select checkboxes with counts */}
      <div>
        <h3 className="text-offwhite/40 text-xs tracking-[0.3em] uppercase mb-4">Marca</h3>
        <ul className="space-y-2.5">
          {brands.map((brand) => {
            const checked = selectedBrands.includes(brand.slug)
            const count = brandCounts[brand.slug] ?? 0
            return (
              <li key={brand.id}>
                <label className="flex items-center justify-between gap-2 cursor-pointer group">
                  <div className="flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleBrand(brand.slug)}
                      className="appearance-none w-3.5 h-3.5 border border-gold/30 checked:bg-gold checked:border-gold transition-colors cursor-pointer flex-shrink-0"
                    />
                    <span className={`text-sm transition-colors ${checked ? 'text-gold' : 'text-offwhite/50 group-hover:text-offwhite'}`}>
                      {brand.name}
                    </span>
                  </div>
                  <span className="text-offwhite/20 text-xs">({count})</span>
                </label>
              </li>
            )
          })}
        </ul>
      </div>

      {/* Price */}
      <div>
        <h3 className="text-offwhite/40 text-xs tracking-[0.3em] uppercase mb-4">Preço</h3>
        <PriceRangeFilter
          min={minPrice}
          max={maxPrice}
          valueMin={priceMin}
          valueMax={priceMax}
          onChange={(mn, mx) => { setPriceMin(mn); setPriceMax(mx) }}
        />
      </div>
    </div>
  )

  return (
    <div className={noContainer ? '' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12'}>
      {/* Page header */}
      {showPageHeader && (
        <div className="mb-8">
          <p className="text-gold/60 text-xs tracking-[0.3em] uppercase mb-2">{subheading ?? 'Catálogo'}</p>
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-offwhite text-3xl font-light tracking-wide">
              {heading ?? (selectedCategory
                ? selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)
                : 'Produtos')}
            </h1>
            <div className="relative max-w-xs hidden sm:block">
              <input
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Buscar..."
                className="w-full bg-offwhite/5 border border-gold/20 text-offwhite placeholder-offwhite/20 pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-gold/60 transition-colors"
              />
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-offwhite/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </div>
          </div>
        </div>
      )}

      {/* Toolbar: count + sort + mobile filter button */}
      <div className="flex items-center justify-between mb-5 gap-4">
        <div className="flex items-center gap-3">
          <button
            className="lg:hidden text-offwhite/60 hover:text-gold text-xs tracking-widest uppercase border border-gold/20 px-4 py-2 transition-colors flex items-center gap-2"
            onClick={() => setSidebarOpen(true)}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
            </svg>
            Filtros {(selectedBrands.length + (selectedCategory ? 1 : 0) + (priceActive ? 1 : 0)) > 0 && (
              <span className="bg-gold text-primary text-[9px] font-semibold rounded-full w-4 h-4 flex items-center justify-center">
                {selectedBrands.length + (selectedCategory ? 1 : 0) + (priceActive ? 1 : 0)}
              </span>
            )}
          </button>
          <span className="text-offwhite/30 text-sm">
            Mostrando {sorted.length} de {products.length}
          </span>
        </div>

        {/* Sort */}
        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortKey)}
            className="appearance-none bg-offwhite/5 border border-gold/20 text-offwhite/60 text-xs tracking-wide pl-3 pr-8 py-2 focus:outline-none focus:border-gold/50 transition-colors cursor-pointer hover:text-offwhite"
          >
            <option value="newest">Mais recentes</option>
            <option value="price-asc">Menor preço</option>
            <option value="price-desc">Maior preço</option>
            <option value="az">A–Z</option>
          </select>
          <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-offwhite/30 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Active filter chips */}
      {hasFilters && (
        <div className="flex flex-wrap items-center gap-2 mb-6">
          {selectedCategory && (
            <Chip
              label={selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}
              onRemove={() => setSelectedCategory(null)}
            />
          )}
          {selectedBrands.map(slug => {
            const brand = brands.find(b => b.slug === slug)
            return brand ? (
              <Chip key={slug} label={brand.name} onRemove={() => toggleBrand(slug)} />
            ) : null
          })}
          {priceActive && (
            <Chip
              label={`R$${priceMin.toLocaleString('pt-BR')} – R$${priceMax.toLocaleString('pt-BR')}`}
              onRemove={() => { setPriceMin(minPrice); setPriceMax(maxPrice) }}
            />
          )}
          {searchText.trim() && (
            <Chip label={`"${searchText}"`} onRemove={() => setSearchText('')} />
          )}
          <button
            onClick={clearFilters}
            className="text-xs text-offwhite/30 hover:text-gold tracking-widest uppercase transition-colors ml-1"
          >
            Limpar tudo
          </button>
        </div>
      )}

      <div className="flex gap-10">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block w-52 flex-shrink-0">
          <div className="sticky top-24">
            {SidebarContent}
          </div>
        </aside>

        {/* Grid */}
        <div className="flex-1 min-w-0">
          {sorted.length === 0 ? (
            <div className="text-center py-24 space-y-4">
              <p className="text-offwhite/30 text-sm">Nenhuma peça encontrada com esses filtros.</p>
              <button
                onClick={clearFilters}
                className="text-gold text-xs tracking-widest uppercase border border-gold/30 px-6 py-2 hover:border-gold transition-colors"
              >
                Ver todos os produtos
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12">
              {sorted.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile sidebar drawer */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/60 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="fixed top-0 left-0 bottom-0 w-72 bg-primary border-r border-gold/20 z-50 overflow-y-auto lg:hidden animate-in slide-in-from-left duration-300">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gold/10">
              <h2 className="text-offwhite text-sm tracking-[0.2em] uppercase">Filtros</h2>
              <button
                onClick={() => setSidebarOpen(false)}
                className="text-offwhite/40 hover:text-offwhite transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="px-6 py-6">
              {SidebarContent}
            </div>
            <div className="sticky bottom-0 px-6 py-4 bg-primary border-t border-gold/10">
              <button
                onClick={() => setSidebarOpen(false)}
                className="w-full bg-gold text-primary py-3 text-xs tracking-[0.2em] uppercase hover:bg-gold/90 transition-colors"
              >
                Ver {sorted.length} resultado{sorted.length !== 1 ? 's' : ''}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
