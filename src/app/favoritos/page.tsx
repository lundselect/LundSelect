'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useFavorites } from '@/contexts/FavoritesContext'
import { products, brands } from '@/lib/data'
import ProductCard from '@/components/ui/ProductCard'

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
      <div className="mb-10">
        <p className="text-gold/60 text-xs tracking-[0.3em] uppercase mb-2">Sua seleção</p>
        <h1 className="text-offwhite text-3xl font-light tracking-wide">Favoritos</h1>
      </div>

      {/* All saved */}
      <section className="mb-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-offwhite text-xl font-light">
            Todos os salvos
            {savedProducts.length > 0 && <span className="text-offwhite/30 text-base ml-2">({savedProducts.length})</span>}
          </h2>
        </div>

        {savedProducts.length === 0 ? (
          <div className="border border-dashed border-gold/20 py-16 text-center">
            <p className="text-offwhite/30 text-sm mb-4">Você ainda não salvou nenhum produto.</p>
            <Link href="/produtos" className="text-gold text-xs tracking-widest uppercase border border-gold/30 px-6 py-2 hover:border-gold transition-colors">
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

      {/* Custom lists */}
      <section className="mb-16 border-t border-gold/10 pt-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-offwhite text-xl font-light">Minhas listas</h2>
          <button
            onClick={() => setShowInput(!showInput)}
            className="text-gold text-xs tracking-widest uppercase border border-gold/30 px-4 py-2 hover:border-gold transition-colors"
          >
            + Nova lista
          </button>
        </div>

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
          </div>
        )}

        {lists.length === 0 ? (
          <div className="border border-dashed border-gold/20 py-12 text-center">
            <p className="text-offwhite/30 text-sm">Crie listas para organizar seus favoritos.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {lists.map((list) => {
              const listProducts = products.filter((p) => list.productIds.includes(p.id))
              return (
                <div key={list.id}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-offwhite font-medium">{list.name} <span className="text-offwhite/30 text-sm font-normal">({listProducts.length})</span></h3>
                    <button onClick={() => deleteList(list.id)} className="text-offwhite/20 hover:text-red-400 text-xs transition-colors">Excluir lista</button>
                  </div>
                  {listProducts.length === 0 ? (
                    <p className="text-offwhite/30 text-sm border border-dashed border-gold/10 py-6 text-center">Lista vazia — adicione produtos pelos corações.</p>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-8">
                      {listProducts.map((product) => (
                        <ProductCard key={product.id} product={product} />
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
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
                <Link href={`/marcas/${brand.slug}`} className={`block border p-4 text-center transition-colors ${fav ? 'border-gold bg-gold/5' : 'border-gold/10 hover:border-gold/30'}`}>
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
