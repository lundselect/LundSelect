import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Metadata } from 'next'
import { products, getProductBySlug } from '@/lib/data'
import ProductActions from './ProductActions'

interface Props {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = getProductBySlug(params.slug)
  if (!product) return { title: 'Produto não encontrado — Lund Select' }
  return {
    title: `${product.name} — ${product.brand} | Lund Select`,
    description: product.description || `${product.name} por ${product.brand}`,
    openGraph: {
      title: `${product.name} — ${product.brand}`,
      description: product.description || `${product.name} por ${product.brand}`,
      type: 'website',
    },
  }
}

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }))
}

export default function ProductDetailPage({ params }: Props) {
  const product = getProductBySlug(params.slug)
  if (!product) notFound()

  const related = products
    .filter((p) => p.slug !== product.slug && p.category === product.category)
    .slice(0, 4)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
        {/* Image */}
        <div className="relative aspect-[3/4] bg-offwhite/5 border border-gold/10 flex items-center justify-center">
          <span className="text-gold/20 text-sm tracking-widest uppercase">{product.brand}</span>
          {product.isNew && product.inStock !== false && (
            <span className="absolute top-4 left-4 bg-gold text-primary text-[9px] tracking-widest uppercase px-2 py-1">
              Novidade
            </span>
          )}
          {product.inStock === false && (
            <div className="absolute inset-0 bg-primary/60 flex items-center justify-center">
              <span className="text-offwhite/50 text-xs tracking-widest uppercase border border-offwhite/20 px-4 py-2">Esgotado</span>
            </div>
          )}
        </div>

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
              <Link key={p.id} href={`/produtos/${p.slug}`} className="group">
                <div className="aspect-[3/4] bg-offwhite/5 border border-gold/10 flex items-center justify-center mb-3 relative overflow-hidden">
                  <span className="text-gold/15 text-xs">{p.brand}</span>
                  <div className="absolute inset-0 bg-gold/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-offwhite/40 text-xs uppercase tracking-wider mb-1">{p.brand}</p>
                <p className="text-offwhite text-sm group-hover:text-gold transition-colors">{p.name}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
