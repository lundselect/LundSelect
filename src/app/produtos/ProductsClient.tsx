'use client'

import { useState, useMemo } from 'react'
import { Brand, Product } from '@/types'
import ProductCard from '@/components/ui/ProductCard'
import PriceRangeFilter from '@/components/ui/PriceRangeFilter'

interface Props {
  initialCategory?: string
  initialBrand?: string
  brands: Brand[]
  products: Product[]
}

export default function ProductsClient({ initialCategory, initialBrand, brands, products }: Props) {
  const minPrice = useMemo(() => Math.min(...products.map(p => p.price)), [products])
  const maxPrice = useMemo(() => Math.max(...products.map(p => p.price)), [products])

  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    initialCategory ? decodeURIComponent(initialCategory) : null
  )
  const [selectedBrand, setSelectedBrand] = useState<string | null>(initialBrand || null)
  const [priceMin, setPriceMin] = useState(minPrice)
  const [priceMax, setPriceMax] = useState(maxPrice)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [roupasOpen, setRoupasOpen] = useState(false)
  const [acessoriosOpen, setAcessoriosOpen] = useState(false)

  const CLOTHING_SUBCATS = ['Blusas', 'Calças', 'Vestidos', 'Macacões', 'Beachwear', 'Resortwear']
  const ACCESSORIES_SUBCATS = ['Bolsas', 'Joias', 'Chapéus', 'Beachwear']

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const cat = selectedCategory?.toLowerCase()
      if (cat === 'novidades' && !p.isNew) return false
      if (cat === 'sale' && !p.onSale) return false
      if (cat === 'roupas') {
        const allClothing = CLOTHING_SUBCATS.map(s => s.toLowerCase())
        if (!allClothing.includes(p.category.toLowerCase()) && p.category.toLowerCase() !== 'roupas') return false
      } else if (cat === 'acessórios') {
        const allAcc = ACCESSORIES_SUBCATS.map(s => s.toLowerCase())
        if (!allAcc.includes(p.category.toLowerCase()) && p.category.toLowerCase() !== 'acessórios') return false
      } else if (cat && cat !== 'novidades' && cat !== 'sale' && p.category.toLowerCase() !== cat) return false
      if (selectedBrand && p.brandSlug !== selectedBrand) return false
      if (p.price < priceMin || p.price > priceMax) return false
      return true
    })
  }, [selectedCategory, selectedBrand, priceMin, priceMax, products, CLOTHING_SUBCATS])

  const hasFilters = selectedCategory || selectedBrand || priceMin > minPrice || priceMax < maxPrice

  const clearFilters = () => {
    setSelectedCategory(null)
    setSelectedBrand(null)
    setPriceMin(minPrice)
    setPriceMax(maxPrice)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10">
        <p className="text-gold/60 text-xs tracking-[0.3em] uppercase mb-2">Catálogo</p>
        <div className="flex items-center justify-between">
          <h1 className="text-offwhite text-3xl font-light tracking-wide">
            {selectedCategory
              ? decodeURIComponent(selectedCategory).charAt(0).toUpperCase() + decodeURIComponent(selectedCategory).slice(1)
              : 'Produtos'}
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

                {/* Roupas with expandable subcategories */}
                <li>
                  <button
                    onClick={() => setRoupasOpen(!roupasOpen)}
                    className={`flex items-center gap-2 text-sm transition-colors w-full text-left ${roupasOpen || CLOTHING_SUBCATS.includes(selectedCategory ?? '') ? 'text-offwhite' : 'text-offwhite/50 hover:text-offwhite'}`}
                  >
                    <span>Roupas</span>
                    <svg
                      className={`w-3 h-3 transition-transform duration-200 flex-shrink-0 ${roupasOpen ? 'rotate-180' : ''}`}
                      fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {roupasOpen && (
                    <ul className="mt-3 space-y-3">
                      {CLOTHING_SUBCATS.map((sub) => (
                        <li key={sub}>
                          <button
                            onClick={() => setSelectedCategory(selectedCategory === sub ? null : sub)}
                            className={`text-sm transition-colors pl-2 ${selectedCategory === sub ? 'text-gold' : 'text-offwhite/40 hover:text-offwhite'}`}
                          >
                            {sub}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>

                {/* Acessórios with expandable subcategories */}
                <li>
                  <button
                    onClick={() => setAcessoriosOpen(!acessoriosOpen)}
                    className={`flex items-center gap-2 text-sm transition-colors w-full text-left ${acessoriosOpen || ACCESSORIES_SUBCATS.includes(selectedCategory ?? '') ? 'text-offwhite' : 'text-offwhite/50 hover:text-offwhite'}`}
                  >
                    <span>Acessórios</span>
                    <svg
                      className={`w-3 h-3 transition-transform duration-200 flex-shrink-0 ${acessoriosOpen ? 'rotate-180' : ''}`}
                      fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {acessoriosOpen && (
                    <ul className="mt-3 space-y-3">
                      {ACCESSORIES_SUBCATS.map((sub) => (
                        <li key={sub}>
                          <button
                            onClick={() => setSelectedCategory(selectedCategory === sub ? null : sub)}
                            className={`text-sm transition-colors pl-2 ${selectedCategory === sub ? 'text-gold' : 'text-offwhite/40 hover:text-offwhite'}`}
                          >
                            {sub}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>

                {/* Novidades & Sale */}
                {['Novidades', 'Sale'].map((cat) => (
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
