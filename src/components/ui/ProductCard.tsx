'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Product } from '@/types'
import { useFavorites } from '@/contexts/FavoritesContext'
import { useCart } from '@/contexts/CartContext'

interface ProductCardProps {
  product: Product
}

function ListPopover({ productId, onClose }: { productId: string; onClose: () => void }) {
  const { lists, addToList, removeFromList, createList } = useFavorites()
  const [newName, setNewName] = useState('')
  const [showInput, setShowInput] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [onClose])

  function isInList(listId: string) {
    return lists.find((l) => l.id === listId)?.productIds.includes(productId) ?? false
  }

  function toggle(listId: string) {
    if (isInList(listId)) removeFromList(listId, productId)
    else addToList(listId, productId)
  }

  function handleCreate() {
    if (!newName.trim()) return
    createList(newName.trim())
    setNewName('')
    setShowInput(false)
  }

  return (
    <div
      ref={ref}
      className="absolute bottom-full right-0 mb-1 w-44 bg-primary border border-gold/20 shadow-xl z-50"
      onClick={(e) => e.preventDefault()}
    >
      {lists.length === 0 && !showInput && (
        <p className="text-offwhite/30 text-xs px-3 py-2">Nenhuma lista ainda.</p>
      )}
      <div className="max-h-36 overflow-y-auto">
        {lists.map((list) => (
          <label
            key={list.id}
            className="flex items-center gap-2 px-3 py-2 hover:bg-offwhite/5 cursor-pointer"
            onClick={(e) => e.stopPropagation()}
          >
            <input
              type="checkbox"
              checked={isInList(list.id)}
              onChange={() => toggle(list.id)}
              className="accent-gold w-3 h-3"
            />
            <span className="text-offwhite/70 text-xs truncate">{list.name}</span>
          </label>
        ))}
      </div>
      <div className="border-t border-gold/10 p-2">
        {showInput ? (
          <div className="flex gap-1">
            <input
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              placeholder="Nome da lista"
              className="flex-1 bg-offwhite/5 border border-gold/20 text-offwhite text-xs px-2 py-1 focus:outline-none focus:border-gold/60 placeholder-offwhite/20"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              onClick={(e) => { e.stopPropagation(); handleCreate() }}
              className="text-gold text-xs px-2 hover:text-gold/70"
            >
              OK
            </button>
          </div>
        ) : (
          <button
            onClick={(e) => { e.stopPropagation(); setShowInput(true) }}
            className="text-gold/60 hover:text-gold text-xs tracking-widest uppercase transition-colors w-full text-left"
          >
            + Nova lista
          </button>
        )}
      </div>
    </div>
  )
}

export default function ProductCard({ product }: ProductCardProps) {
  const { toggleFavorite, isFavorite } = useFavorites()
  const { addItem } = useCart()
  const [hovered, setHovered] = useState(false)
  const [imageFlipped, setImageFlipped] = useState(false)
  const [showListPopover, setShowListPopover] = useState(false)
  const [addedSize, setAddedSize] = useState<string | null>(null)

  const favorited = isFavorite(product.id)
  const allImages = product.images?.length ? product.images : product.image ? [product.image] : []
  const hasHoverImage = allImages.length > 1
  const showSecondImage = hasHoverImage && (hovered || imageFlipped)

  // "Novo" badge: date-based within 14 days, fallback to isNew flag
  const isNewProduct = product.createdAt
    ? Date.now() - new Date(product.createdAt).getTime() < 14 * 24 * 60 * 60 * 1000
    : product.isNew

  // Stock
  const stockBySize = product.stockBySize ?? {}
  const hasStockData = Object.keys(stockBySize).length > 0
  const totalStock = hasStockData
    ? Object.values(stockBySize).reduce((a, b) => a + b, 0)
    : product.inStock !== false ? 999 : 0
  const lowStock = totalStock > 0 && totalStock <= 2

  const handleQuickAdd = (e: React.MouseEvent, size: string) => {
    e.preventDefault()
    e.stopPropagation()
    if (hasStockData && (stockBySize[size] ?? 0) === 0) return
    addItem(product, size)
    setAddedSize(size)
    setTimeout(() => setAddedSize(null), 1500)
  }

  // Mobile: first tap on image flips to second image, second tap navigates
  const handleImageTap = (e: React.MouseEvent) => {
    if (!hasHoverImage) return
    const isTouch = window.matchMedia('(hover: none)').matches
    if (!isTouch) return
    if (!imageFlipped) {
      e.preventDefault()
      setImageFlipped(true)
    }
    // second tap falls through to Link navigation
  }

  return (
    <div className="relative">
      <Link
        href={`/produtos/${product.slug}`}
        className="group block"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => { setHovered(false); setImageFlipped(false) }}
      >
        {/* Image container */}
        <div
          className="aspect-[3/4] bg-offwhite/5 border border-gold/10 overflow-visible mb-3 relative"
          onClick={handleImageTap}
        >
          {/* Primary image */}
          <div className="absolute inset-0 overflow-hidden">
            {allImages[0] ? (
              <Image
                src={allImages[0]}
                alt={product.name}
                fill
                className={`object-cover transition-opacity duration-500 ${showSecondImage ? 'opacity-0' : 'opacity-100'}`}
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-gold/20 text-xs tracking-widest uppercase">{product.brand}</span>
              </div>
            )}

            {/* Hover / second image */}
            {hasHoverImage && (
              <Image
                src={allImages[1]}
                alt={`${product.name} — vista alternativa`}
                fill
                className={`object-cover transition-opacity duration-500 ${showSecondImage ? 'opacity-100' : 'opacity-0'}`}
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
            )}

            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
            {isNewProduct && product.inStock !== false && (
              <span className="bg-gold text-primary text-[9px] tracking-widest uppercase px-2 py-0.5">
                Novo
              </span>
            )}
            {product.onSale && product.inStock !== false && (
              <span className="bg-primary border border-gold text-gold text-[9px] tracking-widest uppercase px-2 py-0.5">
                Sale
              </span>
            )}
            {lowStock && (
              <span className="bg-primary/80 border border-gold/40 text-gold text-[9px] tracking-widest uppercase px-2 py-0.5">
                Apenas {totalStock} restante{totalStock > 1 ? 's' : ''}
              </span>
            )}
          </div>

          {/* Out of stock overlay */}
          {product.inStock === false && (
            <div className="absolute inset-0 bg-primary/70 flex items-center justify-center z-10">
              <span className="text-offwhite/50 text-xs tracking-widest uppercase">Esgotado</span>
            </div>
          )}

          {/* Top-right actions: heart + list */}
          <div className="absolute top-2 right-2 z-20 flex flex-col gap-1">
            <button
              aria-label={favorited ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleFavorite(product.id) }}
              className="w-8 h-8 flex items-center justify-center bg-primary/60 hover:bg-primary/90 transition-colors"
            >
              <svg
                className={`w-4 h-4 transition-colors ${favorited ? 'text-gold fill-gold' : 'text-offwhite/60'}`}
                fill={favorited ? 'currentColor' : 'none'}
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </svg>
            </button>

            <div className="relative">
              <button
                aria-label="Salvar em lista"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowListPopover((v) => !v) }}
                className="w-8 h-8 flex items-center justify-center bg-primary/60 hover:bg-primary/90 transition-colors opacity-0 group-hover:opacity-100"
              >
                <svg className="w-4 h-4 text-offwhite/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
                </svg>
              </button>
              {showListPopover && (
                <ListPopover productId={product.id} onClose={() => setShowListPopover(false)} />
              )}
            </div>
          </div>

          {/* Quick add size strip — shown on hover, hidden when out of stock */}
          {product.inStock !== false && product.sizes.length > 0 && (
            <div className="absolute bottom-0 left-0 right-0 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <div className="flex border-t border-gold/10">
                {product.sizes.map((size) => {
                  const outOfStock = hasStockData && (stockBySize[size] ?? 0) === 0
                  const wasAdded = addedSize === size
                  return (
                    <button
                      key={size}
                      onClick={(e) => handleQuickAdd(e, size)}
                      disabled={outOfStock}
                      className={`flex-1 py-2.5 text-[10px] tracking-widest uppercase transition-all duration-150 border-r border-gold/10 last:border-r-0 ${
                        wasAdded
                          ? 'bg-gold text-primary'
                          : outOfStock
                          ? 'bg-primary/60 text-offwhite/20 cursor-not-allowed line-through'
                          : 'bg-primary/80 hover:bg-gold hover:text-primary text-offwhite/70'
                      }`}
                    >
                      {wasAdded ? '✓' : size}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <p className="text-offwhite/40 text-xs tracking-widest uppercase mb-1">{product.brand}</p>
          <p className="text-offwhite text-sm leading-snug mb-2 group-hover:text-gold transition-colors">{product.name}</p>
          <p className="text-gold text-sm font-medium">
            R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          {product.installments && (
            <p className="text-offwhite/40 text-xs mt-0.5">{product.installments}</p>
          )}
        </div>
      </Link>
    </div>
  )
}
