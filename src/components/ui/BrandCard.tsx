import Link from 'next/link'
import { Brand } from '@/types'

interface BrandCardProps {
  brand: Brand
}

export default function BrandCard({ brand }: BrandCardProps) {
  return (
    <Link href={`/produtos?marca=${brand.slug}`} className="group">
      <div className="aspect-square border border-gold/10 bg-offwhite/5 flex flex-col items-center justify-center gap-2 hover:border-gold/40 transition-colors duration-300">
        <span className="text-offwhite/20 text-xs tracking-widest uppercase">{brand.state}</span>
        <span className="text-offwhite text-base font-medium tracking-wide group-hover:text-gold transition-colors">{brand.name}</span>
        <span className="text-offwhite/30 text-xs tracking-widest uppercase">{brand.category}</span>
      </div>
    </Link>
  )
}
