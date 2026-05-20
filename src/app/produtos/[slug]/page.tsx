import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Metadata } from 'next'
import { getProductBySlug, getProducts } from '@/lib/queries'
import { products } from '@/lib/data'
import ProductActions from './ProductActions'
import ProductCard from '@/components/ui/ProductCard'
import ProductImageViewer from './ProductImageViewer'
import RecentlyViewedSection from '@/components/ui/RecentlyViewedSection'
import RecommendedSizeBadge from '@/components/pdp/RecommendedSizeBadge'

interface Props {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProductBySlug(params.slug)
  if (!product) return { title: 'Produto não encontrado — Lund Select' }
  const canonical = `https://lundselect.com.br/produtos/${product.slug}`
  return {
    title: `${product.name} — ${product.brand} | Lund Select`,
    description: product.description || `${product.name} por ${product.brand}`,
    alternates: { canonical },
    openGraph: {
      title: `${product.name} — ${product.brand}`,
      description: product.description || `${product.name} por ${product.brand}`,
      url: canonical,
      type: 'website',
      ...(product.image ? { images: [{ url: product.image, alt: product.name }] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.name} — ${product.brand}`,
      description: product.description || `${product.name} por ${product.brand}`,
      ...(product.image ? { images: [product.image] } : {}),
    },
  }
}

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }))
}

export default async function ProductDetailPage({ params }: Props) {
  const [product, allProducts] = await Promise.all([
    getProductBySlug(params.slug),
    getProducts(),
  ])
  if (!product) notFound()

  const related = allProducts
    .filter((p) => p.slug !== product.slug && p.category === product.category)
    .slice(0, 4)

  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    brand: { '@type': 'Brand', name: product.brand },
    description: product.description || `${product.name} por ${product.brand}`,
    image: product.image ?? undefined,
    offers: {
      '@type': 'Offer',
      priceCurrency: 'BRL',
      price: product.price,
      availability: product.inStock === false ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock',
      url: `https://lundselect.com.br/produtos/${product.slug}`,
    },
  }

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Início', item: 'https://lundselect.com.br' },
      { '@type': 'ListItem', position: 2, name: 'Produtos', item: 'https://lundselect.com.br/produtos' },
      { '@type': 'ListItem', position: 3, name: product.brand, item: `https://lundselect.com.br/marcas/${product.brandSlug}` },
      { '@type': 'ListItem', position: 4, name: product.name, item: `https://lundselect.com.br/produtos/${product.slug}` },
    ],
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-offwhite/30 mb-12">
        <Link href="/" className="hover:text-gold transition-colors">Início</Link>
        <span>/</span>
        <Link href="/produtos" className="hover:text-gold transition-colors">Produtos</Link>
        <span>/</span>
        <Link href={`/marcas/${product.brandSlug}`} className="hover:text-gold transition-colors">{product.brand}</Link>
        <span>/</span>
        <span className="text-offwhite/50">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
        {/* Image with zoom + view tracking */}
        <ProductImageViewer product={product} />

        {/* Info */}
        <div className="flex flex-col justify-center">
          <Link
            href={`/marcas/${product.brandSlug}`}
            className="text-gold text-xs tracking-[0.3em] uppercase mb-3 hover:text-gold/70 transition-colors inline-block"
          >
            {product.brand}
          </Link>

          <h1 className="text-offwhite text-3xl sm:text-4xl font-light leading-snug mb-4">
            {product.name}
          </h1>

          {product.description && (
            <p className="text-offwhite/50 text-sm leading-relaxed mb-6">{product.description}</p>
          )}

          <p className="text-gold text-2xl font-medium mb-8">
            R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>

          <RecommendedSizeBadge product={product} />
          <ProductActions product={product} />

          <div className="mt-10 pt-10 border-t border-gold/10 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-offwhite/40">Categoria</span>
              <span className="text-offwhite/70">{product.category}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-offwhite/40">Marca</span>
              <Link href={`/marcas/${product.brandSlug}`} className="text-offwhite/70 hover:text-gold transition-colors">
                {product.brand}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <div className="mt-24 border-t border-gold/10 pt-16">
          <h2 className="text-offwhite text-xl font-light tracking-wide mb-10">Você também pode gostar</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-10">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}

      {/* Recently viewed */}
      <RecentlyViewedSection excludeId={product.id} />
    </div>
  )
}
