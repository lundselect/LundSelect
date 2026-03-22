import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Metadata } from 'next'
import { brands, getBrandBySlug, getProductsByBrand } from '@/lib/data'
import ProductCard from '@/components/ui/ProductCard'

interface Props {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const brand = getBrandBySlug(params.slug)
  if (!brand) return { title: 'Marca não encontrada — Lund Select' }
  return {
    title: `${brand.name} — Lund Select`,
    description: brand.description || `Conheça ${brand.name}, marca de ${brand.category} de ${brand.state}.`,
  }
}

export function generateStaticParams() {
  return brands.map((b) => ({ slug: b.slug }))
}

export default function BrandPage({ params }: Props) {
  const brand = getBrandBySlug(params.slug)
  if (!brand) notFound()

  const brandProducts = getProductsByBrand(params.slug)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-offwhite/30 mb-12">
        <Link href="/" className="hover:text-gold transition-colors">Início</Link>
        <span>/</span>
        <Link href="/marcas-parceiras" className="hover:text-gold transition-colors">Marcas</Link>
        <span>/</span>
        <span className="text-offwhite/50">{brand.name}</span>
      </nav>

      {/* Brand header */}
      <div className="border border-gold/10 p-8 sm:p-12 mb-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(181,150,90,0.04)_0%,_transparent_60%)]" />
        <div className="relative">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p className="text-gold/50 text-xs tracking-[0.3em] uppercase mb-3">{brand.state} · {brand.category}</p>
              <h1 className="text-offwhite text-4xl sm:text-5xl font-light tracking-wide">{brand.name}</h1>
            </div>
          </div>
          {brand.description && (
            <p className="text-offwhite/50 text-sm leading-relaxed mt-6 max-w-2xl">{brand.description}</p>
          )}
        </div>
      </div>

      {/* Products */}
      <div>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-offwhite text-xl font-light">
            Coleção <span className="text-offwhite/30 text-base ml-1">({brandProducts.length} peças)</span>
          </h2>
        </div>

        {brandProducts.length === 0 ? (
          <div className="border border-dashed border-gold/20 py-16 text-center">
            <p className="text-offwhite/30 text-sm mb-4">Nenhuma peça disponível no momento.</p>
            <Link href="/produtos" className="text-gold text-xs tracking-widest uppercase border border-gold/30 px-6 py-2 hover:border-gold transition-colors">
              Ver todos os produtos
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
            {brandProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
