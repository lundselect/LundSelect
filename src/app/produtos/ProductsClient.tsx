'use client'

import { useState, useMemo } from 'react'
import { Brand, Product } from '@/types'
import ProductCard from '@/components/ui/ProductCard'

const priceRanges = [
  { label: 'Até R$ 200', min: 0, max: 200 },
  { label: 'R$ 200 – R$ 400', min: 200, max: 400 },
  { label: 'R$ 400 – R$ 600', min: 400, max: 600 },
  { label: 'Acima de R$ 600', min: 600, max: Infinity },
]

interface Props {
  initialCategory?: string
  initialBrand?: string
  brands: Brand[]
  products: Product[]
}

export default function ProductsClient({ initialCategory, initialBrand, brands, products }: Props) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    initialCategory ? decodeURIComponent(initialCategory) : null
  )
  const [selectedBrand, setSelectedBrand] = useState<string | null>(initialBrand || null)
  const [selectedPrice, setSelectedPrice] = useState<number | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const cat = selectedCategory?.toLowerCase()
      if (cat === 'novidades' && !p.isNew) return false
      if (cat === 'sale' && !p.onSale) return false
      if (cat && cat !== 'novidades' && cat !== 'sale' && p.category.toLowerCase() !== cat) return false
      if (selectedBrand && p.brandSlug !== selectedBrand) return false
      if (selectedPrice !== null) {
        const range = priceRanges[selectedPrice]
        if (p.price < range.min || p.price > range.max) return false
      }
      return true
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, selectedBrand, selectedPrice])

  const hasFilters = selectedCategory || selectedBrand || selectedPrice !== null

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10">
        <p className="text-gold/60 text-xs tracking-[0.3em] uppercase mb-2">Catálogo</p>
        <div className="flex items-center justify-between">
          <h1 className="text-offwhite text-3xl font-light tracking-wide">
            {selectedCategory ? decodeURIComponent(selectedCategory).charAt(0).toUpperCase() + decodeURIComponent(selectedCategory).slice(1) : 'Produtos'}
          </h1>
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
                {['Roupas', 'Acessórios', 'Novidades', 'Sale'].map((cat) => (
                  <li key={cat}>
                    <button
                      onClick={() => setSelectedCategory(selectedCategory?.toLowerCase() === cat.toLowerCase() ? null : cat)}
                      className={`text-sm transition-colors ${selectedCategory?.toLowerCase() === cat.toLowerCase() ? 'text-gold' : 'text-offwhite/50 hover:text-offwhite'}`}
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
            <div className="text-center py-24 space-y-4">
              <p className="text-offwhite/30 text-sm">Nenhuma peça encontrada com esses filtros.</p>
              <button
                onClick={() => { setSelectedCategory(null); setSelectedBrand(null); setSelectedPrice(null) }}
                className="text-gold text-xs tracking-widest uppercase border border-gold/30 px-6 py-2 hover:border-gold transition-colors"
              >
                Ver todos os produtos
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
