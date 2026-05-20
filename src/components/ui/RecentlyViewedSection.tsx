'use client'

import { useEffect, useState } from 'react'
import { Product } from '@/types'
import { products as allProducts } from '@/lib/data'
import ProductCard from './ProductCard'

const KEY = 'lund_recently_viewed'

interface Props {
  excludeId?: string
}

export default function RecentlyViewedSection({ excludeId }: Props) {
  const [viewed, setViewed] = useState<Product[]>([])

  useEffect(() => {
    try {
      const stored = localStorage.getItem(KEY)
      if (!stored) return
      const ids: string[] = JSON.parse(stored)
      const products = ids
        .filter((id) => id !== excludeId)
        .map((id) => allProducts.find((p) => p.id === id))
        .filter((p): p is Product => p !== undefined)
        .slice(0, 4)
      setViewed(products)
    } catch {
      // ignore
    }
  }, [excludeId])

  if (viewed.length === 0) return null

  return (
    <div className="mt-24 border-t border-gold/10 pt-16">
      <h2 className="text-offwhite text-xl font-light tracking-wide mb-10">Vistos recentemente</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-10">
        {viewed.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  )
}
