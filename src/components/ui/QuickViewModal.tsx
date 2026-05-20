'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Product } from '@/types'
import { useCart } from '@/contexts/CartContext'
import { useFavorites } from '@/contexts/FavoritesContext'

interface QuickViewModalProps {
  product: Product
  onClose: () => void
}

export default function QuickViewModal({ product, onClose }: QuickViewModalProps) {
  const { addItem } = useCart()
  const { toggleFavorite, isFavorite } = useFavorites()
  const [selectedSize, setSelectedSize] = useState<string | null>(
    product.sizes.length === 1 ? product.sizes[0] : null
  )
  const [added, setAdded] = useState(false)
  const favorited = isFavorite(product.id)

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [onClose])

  const handleAddToCart = () => {
    if (!selectedSize) return
    addItem(product, selectedSize)
    setAdded(true)
    setTimeout(() => {
      setAdded(false)
      onClose()
    }, 1200)
  }

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative bg-primary border border-gold/20 w-full max-w-2xl max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col sm:flex-row"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Fechar"
          className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center text-offwhite/40 hover:text-offwhite transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Image */}
        <div className="relative w-full sm:w-[280px] aspect-[3/4] sm:aspect-auto sm:h-auto flex-shrink-0 bg-offwhite/5">
          {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 280px"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-gold/20 text-xs tracking-widest uppercase">{product.brand}</span>
            </div>
          )}
          {product.isNew && product.inStock !== false && (
            <span className="absolute top-3 left-3 bg-gold text-primary text-[9px] tracking-widest uppercase px-2 py-0.5">
              Novidade
            </span>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col flex-1 p-6 overflow-y-auto">
          <p className="text-offwhite/40 text-xs tracking-widest uppercase mb-2">{product.brand}</p>
          <h2 className="text-offwhite text-lg font-light leading-snug mb-3">{product.name}</h2>

          <div className="mb-4">
            <p className="text-gold text-xl font-medium">
              R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            {product.installments && (
              <p className="text-offwhite/40 text-xs mt-0.5">{product.installments}</p>
            )}
          </div>

          {product.description && (
            <p className="text-offwhite/50 text-sm leading-relaxed mb-5 line-clamp-3">{product.description}</p>
          )}

          {/* Sizes */}
          {product.sizes.length > 0 && product.inStock !== false && (
            <div className="mb-5">
              <p className="text-offwhite/40 text-xs tracking-widest uppercase mb-2">Tamanho</p>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`min-w-[40px] px-3 py-1.5 text-xs border transition-colors ${
                      selectedSize === size
                        ? 'border-gold bg-gold/10 text-gold'
                        : 'border-gold/20 text-offwhite/50 hover:border-gold/50 hover:text-offwhite'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="mt-auto flex flex-col gap-2">
            {product.inStock === false ? (
              <p className="text-offwhite/30 text-xs tracking-widest uppercase text-center py-3 border border-gold/10">
                Esgotado
              </p>
            ) : (
              <button
                onClick={handleAddToCart}
                disabled={!selectedSize || added}
                className={`w-full py-3 text-xs tracking-[0.15em] uppercase transition-all duration-200 ${
                  added
                    ? 'bg-gold/20 text-gold border border-gold'
                    : selectedSize
                    ? 'bg-gold text-primary hover:bg-gold/90'
                    : 'bg-offwhite/5 text-offwhite/30 border border-gold/10 cursor-not-allowed'
                }`}
              >
                {added ? '✓ Adicionado' : !selectedSize ? 'Selecione um tamanho' : 'Adicionar ao carrinho'}
              </button>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => toggleFavorite(product.id)}
                className={`flex-1 py-2.5 text-xs border tracking-widest uppercase transition-colors ${
                  favorited
                    ? 'border-gold text-gold'
                    : 'border-gold/20 text-offwhite/40 hover:border-gold/50 hover:text-offwhite/70'
                }`}
              >
                {favorited ? '♥ Favoritado' : '♡ Favoritar'}
              </button>
              <Link
                href={`/produtos/${product.slug}`}
                onClick={onClose}
                className="flex-1 py-2.5 text-xs border border-gold/20 text-offwhite/40 hover:text-offwhite hover:border-gold/50 tracking-widest uppercase transition-colors text-center"
              >
                Ver produto →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
