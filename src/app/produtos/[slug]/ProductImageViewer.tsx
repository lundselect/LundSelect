'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Product } from '@/types'
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed'

interface Props {
  product: Product
}

export default function ProductImageViewer({ product }: Props) {
  const { addViewed } = useRecentlyViewed()
  const [zoomed, setZoomed] = useState(false)

  // Register this product as viewed
  useEffect(() => {
    addViewed(product.id)
  }, [product.id, addViewed])

  return (
    <>
      {/* Product image with click-to-zoom */}
      <div
        className={`relative aspect-[3/4] bg-offwhite/5 border border-gold/10 overflow-hidden ${
          product.image && product.inStock !== false ? 'cursor-zoom-in' : ''
        }`}
        onClick={() => product.image && product.inStock !== false && setZoomed(true)}
      >
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-gold/20 text-sm tracking-widest uppercase">{product.brand}</span>
          </div>
        )}
        {product.isNew && product.inStock !== false && (
          <span className="absolute top-4 left-4 bg-gold text-primary text-[9px] tracking-widest uppercase px-2 py-1 z-10">
            Novidade
          </span>
        )}
        {product.inStock === false && (
          <div className="absolute inset-0 bg-primary/60 flex items-center justify-center z-10">
            <span className="text-offwhite/50 text-xs tracking-widest uppercase border border-offwhite/20 px-4 py-2">Esgotado</span>
          </div>
        )}
        {product.image && product.inStock !== false && (
          <div className="absolute bottom-3 right-3 bg-primary/60 backdrop-blur-sm text-offwhite/50 text-[10px] tracking-widest uppercase px-2 py-1 pointer-events-none">
            Clique para ampliar
          </div>
        )}
      </div>

      {/* Zoom overlay */}
      {zoomed && product.image && (
        <div
          className="fixed inset-0 z-[400] bg-black/90 backdrop-blur-sm flex items-center justify-center cursor-zoom-out p-4"
          onClick={() => setZoomed(false)}
        >
          <button
            onClick={() => setZoomed(false)}
            aria-label="Fechar zoom"
            className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center text-offwhite/60 hover:text-offwhite transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="relative w-full max-w-2xl aspect-[3/4]">
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-contain"
              sizes="100vw"
              priority
            />
          </div>
        </div>
      )}
    </>
  )
}
