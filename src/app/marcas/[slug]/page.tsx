import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Metadata } from 'next'
import { brands, getBrandBySlug } from '@/lib/data'
import { getBrands, getProducts } from '@/lib/queries'
import ProductsClient from '@/app/produtos/ProductsClient'
import NewMatchHero from './NewMatchHero'

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

export default async function BrandPage({ params }: Props) {
  const brand = getBrandBySlug(params.slug)
  if (!brand) notFound()

  const [brandList, allProducts] = await Promise.all([getBrands(), getProducts()])

  // New Match gets a custom hero slider layout
  if (params.slug === 'new-match') {
    return (
      <div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4">
          <nav className="flex items-center gap-2 text-xs text-offwhite/30">
            <Link href="/" className="hover:text-gold transition-colors">Início</Link>
            <span>/</span>
            <Link href="/marcas-parceiras" className="hover:text-gold transition-colors">Marcas</Link>
            <span>/</span>
            <span className="text-offwhite/50">New Match</span>
          </nav>
        </div>

        <NewMatchHero />

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

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <ProductsClient
            showPageHeader={false}
            noContainer
            initialBrand="new-match"
            brands={brandList}
            products={allProducts}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <nav className="flex items-center gap-2 text-xs text-offwhite/30 mb-12">
        <Link href="/" className="hover:text-gold transition-colors">Início</Link>
        <span>/</span>
        <Link href="/marcas-parceiras" className="hover:text-gold transition-colors">Marcas</Link>
        <span>/</span>
        <span className="text-offwhite/50">{brand.name}</span>
      </nav>

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

      <ProductsClient
        showPageHeader={false}
        noContainer
        initialBrand={params.slug}
        brands={brandList}
        products={allProducts}
      />
    </div>
  )
}
