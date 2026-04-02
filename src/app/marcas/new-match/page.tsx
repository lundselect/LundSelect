'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { getBrands, getProducts } from '@/lib/queries'
import ProductsClient from '@/app/produtos/ProductsClient'
import { Brand, Product } from '@/types'

const SLIDES = [
  'https://newmatch.com.br/media/wysiwyg/home-new-macth/2026/marco/11/HOME_SHOP_NOW_BANNER_DESK_4_.jpg',
  'https://newmatch.com.br/media/wysiwyg/home-new-macth/2026/marco/11/BANNER_PRINCIPAL_DESKTOP_6_.jpg',
]

function HeroSlider() {
  const [current, setCurrent] = useState(0)

  const next = useCallback(() => setCurrent(c => (c + 1) % SLIDES.length), [])
  const prev = () => setCurrent(c => (c - 1 + SLIDES.length) % SLIDES.length)

  useEffect(() => {
    const timer = setInterval(next, 4500)
    return () => clearInterval(timer)
  }, [next])

  return (
    <div className="relative w-full overflow-hidden" style={{ aspectRatio: '16/5' }}>
      {SLIDES.map((src, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={src}
          src={src}
          alt={`New Match campaign ${i + 1}`}
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700"
          style={{ opacity: i === current ? 1 : 0 }}
        />
      ))}

      {/* Prev / Next arrows */}
      <button
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white w-9 h-9 flex items-center justify-center transition-colors"
        aria-label="Anterior"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white w-9 h-9 flex items-center justify-center transition-colors"
        aria-label="Próximo"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Dot indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${i === current ? 'bg-white w-4' : 'bg-white/50'}`}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  )
}

export default function NewMatchPage() {
  const [brands, setBrands] = useState<Brand[]>([])
  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => {
    Promise.all([getBrands(), getProducts()]).then(([b, p]) => {
      setBrands(b)
      setProducts(p)
    })
  }, [])

  return (
    <div>
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4">
        <nav className="flex items-center gap-2 text-xs text-offwhite/30">
          <Link href="/" className="hover:text-gold transition-colors">Início</Link>
          <span>/</span>
          <Link href="/marcas-parceiras" className="hover:text-gold transition-colors">Marcas</Link>
          <span>/</span>
          <span className="text-offwhite/50">New Match</span>
        </nav>
      </div>

      {/* Hero slider — full width, fixed aspect ratio */}
      <HeroSlider />

      {/* Brand description strip */}
      <div className="border-b border-gold/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-gold/50 text-xs tracking-[0.3em] uppercase mb-1">SP · Roupas</p>
            <h1 className="text-offwhite text-3xl font-light tracking-wide">New Match</h1>
          </div>
          <p className="text-offwhite/40 text-sm leading-relaxed max-w-md">
            Estilo urbano e sofisticação em cada coleção. Peças pensadas para a mulher que quer se sentir poderosa no dia a dia.
          </p>
        </div>
      </div>

      {/* Products with filter */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {products.length > 0 ? (
          <ProductsClient
            showPageHeader={false}
            noContainer
            initialBrand="new-match"
            brands={brands}
            products={products}
          />
        ) : (
          <div className="text-center py-24 space-y-4">
            <p className="text-offwhite/30 text-sm">Produtos em breve.</p>
            <Link href="/produtos" className="text-gold text-xs tracking-widest uppercase border border-gold/30 px-6 py-2 hover:border-gold transition-colors">
              Ver todos os produtos
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
