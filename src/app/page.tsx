import Link from 'next/link'
import { brands, products } from '@/lib/data'
import ProductCard from '@/components/ui/ProductCard'
import BrandCard from '@/components/ui/BrandCard'

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-center justify-center border-b border-gold/10 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(181,150,90,0.06)_0%,_transparent_70%)]" />
        <div className="text-center px-4 z-10">
          <p className="text-gold/60 text-xs tracking-[0.4em] uppercase mb-8">Moda Feminina Brasileira</p>
          <h1 className="text-offwhite text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-light leading-tight tracking-tight mb-8 max-w-4xl mx-auto">
            Brasil inteiro.<br />
            <span className="text-gold">Uma só vitrine.</span>
          </h1>
          <p className="text-offwhite/40 text-sm sm:text-base max-w-md mx-auto mb-12 leading-relaxed">
            As marcas mais criativas do país, curadas em um único destino.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/produtos"
              className="inline-block border border-gold text-gold hover:bg-gold hover:text-primary px-10 py-3.5 text-xs tracking-[0.2em] uppercase transition-all duration-300"
            >
              Explorar
            </Link>
            <Link
              href="/produtos?categoria=novidades"
              className="inline-block border border-offwhite/20 text-offwhite/60 hover:border-offwhite/50 hover:text-offwhite px-10 py-3.5 text-xs tracking-[0.2em] uppercase transition-all duration-300"
            >
              Novidades
            </Link>
          </div>
        </div>
        {/* Decorative lines */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <div className="w-px h-12 bg-gradient-to-b from-transparent to-gold/30" />
        </div>
      </section>

      {/* Featured Brands */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="flex items-center justify-between mb-12">
          <div>
            <p className="text-gold/60 text-xs tracking-[0.3em] uppercase mb-2">Curadoria</p>
            <h2 className="text-offwhite text-2xl font-light tracking-wide">Marcas em Destaque</h2>
          </div>
          <Link href="/produtos?view=marcas" className="text-offwhite/40 hover:text-gold text-xs tracking-widest uppercase transition-colors hidden sm:block">
            Ver todas →
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-px bg-gold/10">
          {brands.map((brand) => (
            <div key={brand.id} className="bg-primary">
              <BrandCard brand={brand} />
            </div>
          ))}
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-t border-gold/10" />
      </div>

      {/* New Arrivals */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="flex items-center justify-between mb-12">
          <div>
            <p className="text-gold/60 text-xs tracking-[0.3em] uppercase mb-2">Recém chegadas</p>
            <h2 className="text-offwhite text-2xl font-light tracking-wide">Novidades</h2>
          </div>
          <Link href="/produtos" className="text-offwhite/40 hover:text-gold text-xs tracking-widest uppercase transition-colors hidden sm:block">
            Ver tudo →
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Banner */}
      <section className="border-t border-b border-gold/10 py-20 px-4 text-center my-12">
        <p className="text-gold/40 text-xs tracking-[0.5em] uppercase mb-6">Para marcas brasileiras</p>
        <h2 className="text-offwhite text-3xl sm:text-4xl font-light tracking-wide mb-6 max-w-xl mx-auto">
          Sua marca merece uma vitrine à altura
        </h2>
        <Link href="#" className="inline-block border border-gold/40 text-gold/80 hover:border-gold hover:text-gold px-10 py-3.5 text-xs tracking-[0.2em] uppercase transition-all duration-300">
          Quero ser parceira
        </Link>
      </section>
    </>
  )
}
