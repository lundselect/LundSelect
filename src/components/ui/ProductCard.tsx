'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Product } from '@/types'
import { useFavorites } from '@/contexts/FavoritesContext'

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const { toggleFavorite, isFavorite } = useFavorites()
  const favorited = isFavorite(product.id)

  return (
    <Link href={`/produtos/${product.slug}`} className="group block">
      <div className="aspect-[3/4] bg-offwhite/5 border border-gold/10 overflow-hidden mb-3 relative">
        {/* Image */}
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-gold/20 text-xs tracking-widest uppercase">{product.brand}</span>
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Badges */}
        {product.isNew && product.inStock !== false && (
          <span className="absolute top-2 left-2 bg-gold text-primary text-[9px] tracking-widest uppercase px-2 py-0.5 z-10">
            Novidade
          </span>
        )}
        {product.onSale && product.inStock !== false && (
          <span className="absolute top-2 left-2 bg-primary border border-gold text-gold text-[9px] tracking-widest uppercase px-2 py-0.5 z-10">
            Sale
          </span>
        )}

        {/* Out of stock overlay */}
        {product.inStock === false && (
          <div className="absolute inset-0 bg-primary/70 flex items-center justify-center z-10">
            <span className="text-offwhite/50 text-xs tracking-widest uppercase">Esgotado</span>
          </div>
        )}

        {/* Heart button */}
        <button
          aria-label={favorited ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleFavorite(product.id) }}
          className="absolute top-2 right-2 z-20 w-8 h-8 flex items-center justify-center bg-primary/60 hover:bg-primary/90 transition-colors"
        >
          <svg className={`w-4 h-4 transition-colors ${favorited ? 'text-gold fill-gold' : 'text-offwhite/60'}`} fill={favorited ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
          </svg>
        </button>
      </div>

      <div>
        <p className="text-offwhite/40 text-xs tracking-widest uppercase mb-1">{product.brand}</p>
        <p className="text-offwhite text-sm leading-snug mb-2 group-hover:text-gold transition-colors">{product.name}</p>
        <p className="text-gold text-sm font-medium">
          R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </p>
      </div>
    </Link>
  )
}
