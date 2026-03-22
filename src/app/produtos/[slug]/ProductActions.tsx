'use client'

import { useState } from 'react'
import { Product } from '@/types'
import { useCart } from '@/contexts/CartContext'
import { useFavorites } from '@/contexts/FavoritesContext'

export default function ProductActions({ product }: { product: Product }) {
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const { addItem } = useCart()
  const { toggleFavorite, isFavorite } = useFavorites()
  const favorited = isFavorite(product.id)

  const handleAddToCart = () => {
    if (!selectedSize || product.inStock === false) return
    addItem(product, selectedSize)
  }

  return (
    <div>
      {/* Size selector */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <p className="text-offwhite/40 text-xs tracking-[0.3em] uppercase">Tamanho</p>
          <button className="text-gold/50 hover:text-gold text-xs underline transition-colors">
            Guia de tamanhos
          </button>
        </div>
        {product.sizes.length > 1 ? (
          <div className="flex flex-wrap gap-2">
            {product.sizes.map((size) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                disabled={product.inStock === false}
                className={`w-12 h-12 text-sm border transition-all duration-200 ${
                  product.inStock === false
                    ? 'border-gold/10 text-offwhite/20 cursor-not-allowed'
                    : selectedSize === size
                    ? 'border-gold bg-gold text-primary'
                    : 'border-gold/20 text-offwhite/60 hover:border-gold/60 hover:text-offwhite'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        ) : (
          <p className="text-offwhite/50 text-sm">Tamanho único</p>
        )}
        {product.sizes.length > 1 && !selectedSize && product.inStock !== false && (
          <p className="text-offwhite/30 text-xs mt-3">Selecione um tamanho para continuar</p>
        )}
      </div>

      {/* Add to cart + wishlist */}
      <div className="flex gap-3">
        <button
          onClick={handleAddToCart}
          disabled={product.inStock === false || (product.sizes.length > 1 && !selectedSize)}
          className={`flex-1 py-4 text-sm tracking-[0.2em] uppercase transition-all duration-300 ${
            product.inStock === false
              ? 'bg-offwhite/5 border border-gold/10 text-offwhite/20 cursor-not-allowed'
              : product.sizes.length > 1 && !selectedSize
              ? 'bg-offwhite/5 border border-gold/10 text-offwhite/20 cursor-not-allowed'
              : 'bg-gold text-primary hover:bg-gold/90'
          }`}
        >
          {product.inStock === false ? 'Esgotado' : 'Adicionar ao carrinho'}
        </button>
        <button
          onClick={() => toggleFavorite(product.id)}
          aria-label={favorited ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
          className={`w-14 border flex items-center justify-center transition-all duration-200 ${
            favorited ? 'border-gold bg-gold/10 text-gold' : 'border-gold/20 text-offwhite/40 hover:border-gold/60 hover:text-gold'
          }`}
        >
          <svg className="w-5 h-5" fill={favorited ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
          </svg>
        </button>
      </div>

      <p className="text-offwhite/30 text-xs mt-4 text-center">
        Frete grátis acima de R$ 249
      </p>
    </div>
  )
}
