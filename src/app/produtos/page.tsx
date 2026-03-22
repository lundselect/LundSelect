'use client'

import { useState, useMemo } from 'react'
import { products, brands } from '@/lib/data'
import ProductCard from '@/components/ui/ProductCard'

const priceRanges = [
  { label: 'Até R$ 200', min: 0, max: 200 },
  { label: 'R$ 200 – R$ 400', min: 200, max: 400 },
  { label: 'R$ 400 – R$ 600', min: 400, max: 600 },
  { label: 'Acima de R$ 600', min: 600, max: Infinity },
]

const categories = ['Roupas', 'Acessórios']

export default function ProdutosPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null)
  const [selectedPrice, setSelectedPrice] = useState<number | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (selectedCategory && p.category !== selectedCategory) return false
      if (selectedBrand && p.brandSlug !== selectedBrand) return false
      if (selectedPrice !== null) {
        const range = priceRanges[selectedPrice]
        if (p.price < range.min || p.price > range.max) return false
      }
      return true
    })
  }, [selectedCategory, selectedBrand, selectedPrice])

  const hasFilters = selectedCategory || selectedBrand || selectedPrice !== null

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-10">
        <p className="text-gold/60 text-xs tracking-[0.3em] uppercase mb-2">Catálogo</p>
        <div className="flex items-center justify-between">
          <h1 className="text-offwhite text-3xl font-light tracking-wide">Produtos</h1>
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
        {/* Sidebar */}
        <aside className={`${sidebarOpen ? 'block' : 'hidden'} lg:block w-full lg:w-56 flex-shrink-0`}>
          <div className="sticky top-24 space-y-8">
            {hasFilters && (
              <button
                onClick={() => { setSelectedCategory(null); setSelectedBrand(null); setSelectedPrice(null) }}
                className="text-gold/60 hover:text-gold text-xs tracking-widest uppercase transition-colors"
              >
                Limpar filtros ×
              </button>
            )}

            {/* Category */}
            <div>
              <h3 className="text-offwhite/40 text-xs tracking-[0.3em] uppercase mb-4">Categoria</h3>
              <ul className="space-y-3">
                {categories.map((cat) => (
                  <li key={cat}>
                    <button
                      onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
                      className={`text-sm transition-colors ${selectedCategory === cat ? 'text-gold' : 'text-offwhite/50 hover:text-offwhite'}`}
                    >
                      {cat}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Brand */}
            <div>
              <h3 className="text-offwhite/40 text-xs tracking-[0.3em] uppercase mb-4">Marca</h3>
              <ul className="space-y-3">
                {brands.map((brand) => (
                  <li key={brand.id}>
                    <button
                      onClick={() => setSelectedBrand(selectedBrand === brand.slug ? null : brand.slug)}
                      className={`text-sm transition-colors ${selectedBrand === brand.slug ? 'text-gold' : 'text-offwhite/50 hover:text-offwhite'}`}
                    >
                      {brand.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Price */}
            <div>
              <h3 className="text-offwhite/40 text-xs tracking-[0.3em] uppercase mb-4">Preço</h3>
              <ul className="space-y-3">
                {priceRanges.map((range, i) => (
                  <li key={i}>
                    <button
                      onClick={() => setSelectedPrice(selectedPrice === i ? null : i)}
                      className={`text-sm transition-colors ${selectedPrice === i ? 'text-gold' : 'text-offwhite/50 hover:text-offwhite'}`}
                    >
                      {range.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </aside>

        {/* Grid */}
        <div className="flex-1">
          {filtered.length === 0 ? (
            <div className="text-center py-24">
              <p className="text-offwhite/30 text-sm">Nenhum produto encontrado com esses filtros.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12">
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
