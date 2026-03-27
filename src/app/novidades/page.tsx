'use client'

import { useState, useMemo } from 'react'
import { products } from '@/lib/data'
import ProductCard from '@/components/ui/ProductCard'
import PriceRangeFilter from '@/components/ui/PriceRangeFilter'

const FILTERS = [
  { label: 'Roupas', categories: ['Roupas', 'Blusas', 'Calças', 'Vestidos', 'Macacões', 'Beachwear', 'Resortwear'] },
  { label: 'Calçados', categories: ['Calçados', 'Sapatos', 'Sandálias', 'Tênis'] },
  { label: 'Roupas esportivas', categories: ['Esportivo', 'Fitness', 'Activewear'] },
  { label: 'Acessórios', categories: ['Acessórios', 'Bolsas', 'Cintos', 'Joias', 'Lenços & Echarpes'] },
  { label: 'Sale', categories: [] },
]

export default function NovidadesPage() {
  const newProducts = useMemo(() => products.filter(p => p.isNew), [])
  const minPrice = useMemo(() => Math.min(...newProducts.map(p => p.price)), [newProducts])
  const maxPrice = useMemo(() => Math.max(...newProducts.map(p => p.price)), [newProducts])

  const [activeFilter, setActiveFilter] = useState<string | null>(null)
  const [priceMin, setPriceMin] = useState(minPrice)
  const [priceMax, setPriceMax] = useState(maxPrice)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const filtered = useMemo(() => {
    let result = newProducts
    if (activeFilter === 'Sale') result = result.filter(p => p.onSale)
    else if (activeFilter) {
      const cats = FILTERS.find(f => f.label === activeFilter)?.categories ?? []
      result = result.filter(p => cats.map(c => c.toLowerCase()).includes(p.category.toLowerCase()))
    }
    return result.filter(p => p.price >= priceMin && p.price <= priceMax)
  }, [activeFilter, priceMin, priceMax, newProducts])

  const hasFilters = activeFilter !== null || priceMin > minPrice || priceMax < maxPrice

  const clearFilters = () => {
    setActiveFilter(null)
    setPriceMin(minPrice)
    setPriceMax(maxPrice)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10">
        <p className="text-gold/60 text-xs tracking-[0.3em] uppercase mb-2">Novidades</p>
        <div className="flex items-center justify-between">
          <h1 className="text-offwhite text-3xl font-light tracking-wide">Recém chegados</h1>
          <div className="flex items-center gap-4">
            <span className="text-offwhite/30 text-sm">{filtered.length} peças</span>
            <button
              className="lg:hidden text-offwhite/60 hover:text-gold text-xs tracking-widest uppercase border border-gold/20 px-4 py-2 transition-colors"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              Filtros
            </button>
          </div>
        </div>
      </div>

      <div className="flex gap-12">
        <aside className={`${sidebarOpen ? 'block' : 'hidden'} lg:block w-full lg:w-56 flex-shrink-0`}>
          <div className="sticky top-24 space-y-8">
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="text-gold/60 hover:text-gold text-xs tracking-widest uppercase transition-colors"
              >
                Limpar filtros ×
              </button>
            )}

            {/* Category */}
            <div>
              <h3 className="text-offwhite/40 text-xs tracking-[0.3em] uppercase mb-4">Categoria</h3>
              <ul className="space-y-3">
                <li>
                  <button
                    onClick={() => setActiveFilter(null)}
                    className={`text-sm transition-colors ${activeFilter === null ? 'text-gold' : 'text-offwhite/50 hover:text-offwhite'}`}
                  >
                    Todos
                  </button>
                </li>
                {FILTERS.map((f) => (
                  <li key={f.label}>
                    <button
                      onClick={() => setActiveFilter(activeFilter === f.label ? null : f.label)}
                      className={`text-sm transition-colors ${activeFilter === f.label ? 'text-gold' : 'text-offwhite/50 hover:text-offwhite'}`}
                    >
                      {f.label}
                    </button>
                  </li>
                ))}
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
        </aside>

        <div className="flex-1">
          {filtered.length === 0 ? (
            <div className="text-center py-24 space-y-4">
              <p className="text-offwhite/30 text-sm">Nenhuma peça encontrada nesta categoria.</p>
              <button
                onClick={clearFilters}
                className="text-gold text-xs tracking-widest uppercase border border-gold/30 px-6 py-2 hover:border-gold transition-colors"
              >
                Ver todas as novidades
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12">
              {filtered.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
