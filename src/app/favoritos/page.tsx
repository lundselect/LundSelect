'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useFavorites } from '@/contexts/FavoritesContext'
import { products, brands } from '@/lib/data'
import { Product } from '@/types'
import ProductCard from '@/components/ui/ProductCard'

function BoardCard({
  name,
  items,
  itemCount,
  isMain,
  onDelete,
}: {
  name: string
  items: Product[]
  itemCount: number
  isMain?: boolean
  onDelete?: () => void
}) {
  const main = items[0]
  const thumbs = items.slice(1, 4)

  return (
    <div className="group">
      {/* Card image area */}
      <div className="aspect-[4/3] flex gap-0.5 mb-3 overflow-hidden border border-gold/10">
        {/* Main large image */}
        <div className="flex-1 relative bg-offwhite/5">
          {main?.image ? (
            <Image src={main.image} alt={main.name} fill className="object-cover" sizes="33vw" />
          ) : isMain ? (
            <div className="absolute inset-0 bg-gold/10 flex items-center justify-center">
              <svg className="w-12 h-12 text-gold/40 fill-gold/20" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </svg>
            </div>
          ) : (
            <div className="absolute inset-0 bg-offwhite/3 flex items-center justify-center">
              <svg className="w-8 h-8 text-gold/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" />
              </svg>
            </div>
          )}
        </div>

        {/* Thumbnails stack */}
        <div className="w-1/4 flex flex-col gap-0.5">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex-1 relative bg-offwhite/5">
              {thumbs[i]?.image ? (
                <Image src={thumbs[i].image!} alt={thumbs[i].name} fill className="object-cover" sizes="10vw" />
              ) : null}
            </div>
          ))}
        </div>
      </div>

      {/* Card info */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-offwhite text-sm font-medium">{name}</p>
          <p className="text-offwhite/40 text-xs mt-0.5">{itemCount} {itemCount === 1 ? 'item' : 'itens'}</p>
        </div>
        {onDelete && (
          <button
            onClick={onDelete}
            className="text-offwhite/20 hover:text-red-400 text-xs transition-colors opacity-0 group-hover:opacity-100"
          >
            Excluir
          </button>
        )}
      </div>
    </div>
  )
}

export default function FavoritosPage() {
  const { favoriteIds, lists, favoriteBrands, createList, deleteList, toggleBrand } = useFavorites()
  const [newListName, setNewListName] = useState('')
  const [showInput, setShowInput] = useState(false)

  const savedProducts = products.filter((p) => favoriteIds.includes(p.id))
  const favBrands = brands.filter((b) => favoriteBrands.includes(b.slug))

  const handleCreateList = () => {
    if (newListName.trim()) {
      createList(newListName.trim())
      setNewListName('')
      setShowInput(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="flex items-end justify-between mb-10">
        <div>
          <p className="text-gold/60 text-xs tracking-[0.3em] uppercase mb-2">Sua seleção</p>
          <h1 className="text-offwhite text-3xl font-light tracking-wide">Favoritos</h1>
        </div>
        <button
          onClick={() => setShowInput(!showInput)}
          className="text-gold text-xs tracking-widest uppercase border border-gold/30 px-4 py-2 hover:border-gold transition-colors"
        >
          + Criar lista
        </button>
      </div>

      {/* New list input */}
      {showInput && (
        <div className="flex gap-3 mb-8">
          <input
            type="text"
            value={newListName}
            onChange={(e) => setNewListName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreateList()}
            placeholder="Nome da lista..."
            className="flex-1 bg-offwhite/5 border border-gold/20 text-offwhite placeholder-offwhite/20 px-4 py-3 text-sm focus:outline-none focus:border-gold/60 transition-colors"
            autoFocus
          />
          <button onClick={handleCreateList} className="bg-gold text-primary px-6 py-3 text-xs tracking-widest uppercase hover:bg-gold/90 transition-colors">
            Criar
          </button>
          <button onClick={() => setShowInput(false)} className="text-offwhite/40 hover:text-offwhite text-xs tracking-widest uppercase transition-colors px-4">
            Cancelar
          </button>
        </div>
      )}

      {/* Boards grid */}
      <section className="mb-16">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-6">
          {/* Main favorites board */}
          <BoardCard
            name="Todos os salvos"
            items={savedProducts}
            itemCount={savedProducts.length}
            isMain
          />

          {/* Custom lists */}
          {lists.map((list) => {
            const listProducts = products.filter((p) => list.productIds.includes(p.id))
            return (
              <BoardCard
                key={list.id}
                name={list.name}
                items={listProducts}
                itemCount={listProducts.length}
                onDelete={() => deleteList(list.id)}
              />
            )
          })}
        </div>
      </section>

      {/* Saved items grid */}
      <section className="border-t border-gold/10 pt-12 mb-16">
        <h2 className="text-offwhite text-xl font-light mb-8">
          Itens salvos
          {savedProducts.length > 0 && (
            <span className="text-offwhite/30 text-base ml-2">({savedProducts.length})</span>
          )}
        </h2>

        {savedProducts.length === 0 ? (
          <div className="border border-dashed border-gold/20 py-16 text-center">
            <p className="text-offwhite/30 text-sm mb-4">Você ainda não salvou nenhum produto.</p>
            <Link
              href="/produtos"
              className="text-gold text-xs tracking-widest uppercase border border-gold/30 px-6 py-2 hover:border-gold transition-colors"
            >
              Explorar produtos
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
            {savedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Favorite brands */}
      <section className="border-t border-gold/10 pt-12">
        <h2 className="text-offwhite text-xl font-light mb-8">Marcas favoritas</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          {brands.map((brand) => {
            const fav = favoriteBrands.includes(brand.slug)
            return (
              <div key={brand.id} className="relative">
                <Link
                  href={`/marcas/${brand.slug}`}
                  className={`block border p-4 text-center transition-colors ${fav ? 'border-gold bg-gold/5' : 'border-gold/10 hover:border-gold/30'}`}
                >
                  <p className="text-offwhite/40 text-[10px] uppercase tracking-widest mb-1">{brand.state}</p>
                  <p className={`text-sm font-medium ${fav ? 'text-gold' : 'text-offwhite'}`}>{brand.name}</p>
                </Link>
                <button
                  onClick={() => toggleBrand(brand.slug)}
                  className="absolute top-2 right-2"
                  aria-label={fav ? 'Remover das favoritas' : 'Favoritar marca'}
                >
                  <svg className={`w-3.5 h-3.5 ${fav ? 'text-gold fill-gold' : 'text-offwhite/20'}`} fill={fav ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                  </svg>
                </button>
              </div>
            )
          })}
        </div>
        {favBrands.length === 0 && (
          <p className="text-offwhite/30 text-sm text-center">Clique no coração de uma marca para salvá-la aqui.</p>
        )}
      </section>
    </div>
  )
}
