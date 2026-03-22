import Link from 'next/link'
import { Product } from '@/types'

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <Link href={`/produtos/${product.slug}`} className="group">
      <div className="aspect-[3/4] bg-offwhite/5 border border-gold/10 overflow-hidden mb-3 relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-gold/20 text-xs tracking-widest uppercase">{product.brand}</span>
        </div>
        <div className="absolute inset-0 bg-gold/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
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
