import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Metadata } from 'next'
import { getBrands, getProducts, getBrandProductCounts } from '@/lib/queries'
import { brands as localBrands } from '@/lib/data'
import ProductsClient from '@/app/produtos/ProductsClient'

interface Props {
  params: { slug: string }
}

async function getBrandBySlug(slug: string) {
  const brands = await getBrands()
  return brands.find(b => b.slug === slug)
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const brand = await getBrandBySlug(params.slug)
  if (!brand) return { title: 'Marca não encontrada — Lund Select' }
  const canonical = `https://lundselect.com.br/marcas/${brand.slug}`
  const description = brand.description || `Conheça ${brand.name}, marca de ${brand.category} de ${brand.state}.`
  return {
    title: `${brand.name} — Lund Select`,
    description,
    alternates: { canonical },
    openGraph: {
      title: `${brand.name} — Lund Select`,
      description,
      url: canonical,
      type: 'website',
      ...(brand.logo ? { images: [{ url: `https://lundselect.com.br${brand.logo}`, alt: brand.name }] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: `${brand.name} — Lund Select`,
      description,
    },
  }
}

export function generateStaticParams() {
  return localBrands.map(b => ({ slug: b.slug }))
}

export default async function BrandPage({ params }: Props) {
  const [brand, brandList, allProducts, counts] = await Promise.all([
    getBrandBySlug(params.slug),
    getBrands(),
    getProducts(),
    getBrandProductCounts(),
  ])

  if (!brand) notFound()

  const brandProducts = allProducts.filter(p => p.brandSlug === params.slug)
  const productCount = counts[params.slug] ?? brandProducts.length

  return (
    <div>
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-0">
        <nav className="flex items-center gap-2 text-xs text-offwhite/30">
          <Link href="/" className="hover:text-gold transition-colors">Início</Link>
          <span>/</span>
          <Link href="/marcas" className="hover:text-gold transition-colors">Marcas</Link>
          <span>/</span>
          <span className="text-offwhite/50">{brand.name}</span>
        </nav>
      </div>

      {/* Brand hero */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="border border-gold/10 relative overflow-hidden">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(181,150,90,0.07)_0%,_transparent_60%)]" />

          <div className="relative px-8 sm:px-12 py-12 flex flex-col sm:flex-row sm:items-end justify-between gap-8">
            {/* Left: logo/name + meta */}
            <div>
              {brand.logo ? (
                <div className="relative h-14 w-48 mb-6">
                  <Image
                    src={brand.logo}
                    alt={brand.name}
                    fill
                    className="object-contain object-left"
                    sizes="192px"
                  />
                </div>
              ) : null}
              <div className="flex items-center gap-3 mb-3">
                <span className="text-gold/50 text-xs tracking-[0.3em] uppercase">{brand.state}</span>
                <span className="text-gold/20">·</span>
                <span className="text-gold/50 text-xs tracking-[0.3em] uppercase">{brand.category}</span>
              </div>
              <h1 className="text-offwhite text-4xl sm:text-5xl font-light tracking-wide">
                {brand.name}
              </h1>
            </div>

            {/* Right: description + product count */}
            <div className="sm:max-w-sm">
              {brand.description && (
                <p className="text-offwhite/40 text-sm leading-relaxed mb-6">
                  {brand.description}
                </p>
              )}
              <div className="flex items-center gap-1 text-offwhite/20 text-xs tracking-widest uppercase">
                <span className="text-gold text-lg font-light">{productCount}</span>
                <span className="ml-1">peça{productCount !== 1 ? 's' : ''} disponíve{productCount !== 1 ? 'is' : 'l'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {brandProducts.length === 0 ? (
          <div className="text-center py-24 border border-gold/10">
            <p className="text-offwhite/30 text-sm mb-2">Nenhum produto disponível ainda.</p>
            <p className="text-offwhite/20 text-xs">Em breve novas peças desta marca.</p>
          </div>
        ) : (
          <ProductsClient
            showPageHeader={false}
            noContainer
            initialBrand={params.slug}
            brands={brandList}
            products={allProducts}
          />
        )}
      </div>
    </div>
  )
}
