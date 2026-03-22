'use client'

import { useState } from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { products } from '@/lib/data'

interface Props {
  params: { slug: string }
}

export default function ProductDetailPage({ params }: Props) {
  const product = products.find((p) => p.slug === params.slug)
  if (!product) notFound()

  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [added, setAdded] = useState(false)

  const handleAddToCart = () => {
    if (!selectedSize) return
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-offwhite/30 mb-12">
        <Link href="/" className="hover:text-gold transition-colors">Início</Link>
        <span>/</span>
        <Link href="/produtos" className="hover:text-gold transition-colors">Produtos</Link>
        <span>/</span>
        <span className="text-offwhite/50">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
        {/* Image */}
        <div className="aspect-[3/4] bg-offwhite/5 border border-gold/10 flex items-center justify-center">
          <span className="text-gold/20 text-sm tracking-widest uppercase">{product.brand}</span>
        </div>

        {/* Info */}
        <div className="flex flex-col justify-center">
          <Link
            href={`/produtos?marca=${product.brandSlug}`}
            className="text-gold text-xs tracking-[0.3em] uppercase mb-3 hover:text-gold/70 transition-colors"
          >
            {product.brand}
          </Link>

          <h1 className="text-offwhite text-3xl sm:text-4xl font-light leading-snug mb-6">
            {product.name}
          </h1>

          <p className="text-gold text-2xl font-medium mb-10">
            R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>

          <div className="mb-8">
            <p className="text-offwhite/40 text-xs tracking-[0.3em] uppercase mb-4">Tamanho</p>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`w-12 h-12 text-sm border transition-all duration-200 ${
                    selectedSize === size
                      ? 'border-gold bg-gold text-primary'
                      : 'border-gold/20 text-offwhite/60 hover:border-gold/60 hover:text-offwhite'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
            {!selectedSize && (
              <p className="text-offwhite/30 text-xs mt-3">Selecione um tamanho</p>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={!selectedSize}
            className={`w-full py-4 text-sm tracking-[0.2em] uppercase transition-all duration-300 ${
              added
                ? 'bg-gold/20 border border-gold text-gold'
                : selectedSize
                ? 'bg-gold text-primary hover:bg-gold/90'
                : 'bg-offwhite/5 border border-gold/10 text-offwhite/20 cursor-not-allowed'
            }`}
          >
            {added ? 'Adicionado ✓' : 'Adicionar ao carrinho'}
          </button>

          <div className="mt-10 pt-10 border-t border-gold/10 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-offwhite/40">Categoria</span>
              <span className="text-offwhite/70">{product.category}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-offwhite/40">Marca</span>
              <span className="text-offwhite/70">{product.brand}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Related */}
      <div className="mt-24 border-t border-gold/10 pt-16">
        <h2 className="text-offwhite text-xl font-light tracking-wide mb-10">Você também pode gostar</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-10">
          {products
            .filter((p) => p.slug !== product.slug && p.category === product.category)
            .slice(0, 4)
            .map((p) => (
              <Link key={p.id} href={`/produtos/${p.slug}`} className="group">
                <div className="aspect-[3/4] bg-offwhite/5 border border-gold/10 flex items-center justify-center mb-3">
                  <span className="text-gold/15 text-xs">{p.brand}</span>
                </div>
                <p className="text-offwhite/40 text-xs uppercase tracking-wider mb-1">{p.brand}</p>
                <p className="text-offwhite text-sm group-hover:text-gold transition-colors">{p.name}</p>
              </Link>
            ))}
        </div>
      </div>
    </div>
  )
}
