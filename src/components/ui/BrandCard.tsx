import Link from 'next/link'
import Image from 'next/image'
import { Brand } from '@/types'

interface BrandCardProps {
  brand: Brand
}

export default function BrandCard({ brand }: BrandCardProps) {
  return (
    <Link href={`/marcas/${brand.slug}`} className="group">
      <div className="aspect-square border border-gold/10 bg-offwhite/5 flex flex-col items-center justify-center gap-2 hover:border-gold/40 transition-colors duration-300">
        {brand.logo ? (
          <div className="relative w-3/4 h-1/2">
            <Image
              src={brand.logo}
              alt={brand.name}
              fill
              className="object-contain"
              sizes="(max-width: 640px) 33vw, (max-width: 1024px) 16vw, 12vw"
            />
          </div>
        ) : (
          <>
            <span className="text-offwhite/20 text-xs tracking-widest uppercase">{brand.state}</span>
            <span className="text-offwhite text-base font-medium tracking-wide group-hover:text-gold transition-colors">{brand.name}</span>
            <span className="text-offwhite/30 text-xs tracking-widest uppercase">{brand.category}</span>
          </>
        )}
      </div>
    </Link>
  )
}
