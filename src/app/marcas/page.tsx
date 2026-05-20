import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { getBrands, getBrandProductCounts } from '@/lib/queries'

export const metadata: Metadata = {
  title: 'Marcas — Lund Select',
  description: 'Conheça todas as marcas brasileiras independentes da Lund Select — de São Paulo ao Rio, do Nordeste ao Sul.',
  alternates: { canonical: 'https://lundselect.com.br/marcas' },
}

export default async function MarcasPage() {
  const [brands, counts] = await Promise.all([getBrands(), getBrandProductCounts()])

  const byState = brands.reduce<Record<string, typeof brands>>((acc, brand) => {
    const key = brand.state ?? 'Outros'
    acc[key] = [...(acc[key] ?? []), brand]
    return acc
  }, {})

  const stateOrder = ['SP', 'RJ', 'MG', 'RS', 'PR', 'BA', 'PE', 'CE', 'Outros']
  const sortedStates = Object.keys(byState).sort(
    (a, b) => (stateOrder.indexOf(a) === -1 ? 99 : stateOrder.indexOf(a)) -
               (stateOrder.indexOf(b) === -1 ? 99 : stateOrder.indexOf(b))
  )

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Header */}
      <div className="mb-16">
        <p className="text-gold/60 text-xs tracking-[0.4em] uppercase mb-4">Curadoria</p>
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <h1 className="text-offwhite text-4xl sm:text-5xl font-light tracking-wide">
            Marcas
          </h1>
          <p className="text-offwhite/40 text-sm max-w-sm leading-relaxed">
            Marcas femininas brasileiras selecionadas. Do Norte ao Sul.
          </p>
        </div>
        <div className="h-px bg-gold/10 mt-8" />
      </div>

      {/* Stats row */}
      <div className="flex gap-10 mb-16">
        <div>
          <p className="text-gold text-2xl font-light">{brands.length}</p>
          <p className="text-offwhite/30 text-xs tracking-widest uppercase mt-1">Marcas</p>
        </div>
        <div>
          <p className="text-gold text-2xl font-light">{sortedStates.length}</p>
          <p className="text-offwhite/30 text-xs tracking-widest uppercase mt-1">Estados</p>
        </div>
        <div>
          <p className="text-gold text-2xl font-light">
            {Object.values(counts).reduce((a, b) => a + b, 0)}
          </p>
          <p className="text-offwhite/30 text-xs tracking-widest uppercase mt-1">Produtos</p>
        </div>
      </div>

      {/* Brand grid — grouped by state */}
      {sortedStates.map(state => (
        <div key={state} className="mb-14">
          <div className="flex items-center gap-4 mb-6">
            <span className="text-gold/50 text-xs tracking-[0.3em] uppercase">{state}</span>
            <div className="flex-1 h-px bg-gold/10" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {byState[state].map(brand => {
              const count = counts[brand.slug] ?? 0
              return (
                <Link
                  key={brand.id}
                  href={`/marcas/${brand.slug}`}
                  className="group border border-gold/10 hover:border-gold/30 transition-all duration-200 p-6 flex flex-col justify-between min-h-[140px] relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_rgba(181,150,90,0.04)_0%,_transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <div className="relative">
                    {brand.logo ? (
                      <div className="relative h-10 w-full mb-4">
                        <Image
                          src={brand.logo}
                          alt={brand.name}
                          fill
                          className="object-contain object-left"
                          sizes="200px"
                        />
                      </div>
                    ) : (
                      <p className="text-offwhite group-hover:text-gold text-base font-light tracking-wide mb-4 transition-colors">
                        {brand.name}
                      </p>
                    )}
                    <p className="text-offwhite/30 text-xs">{brand.category}</p>
                  </div>

                  <div className="relative flex items-center justify-between mt-4">
                    <span className="text-offwhite/20 text-xs">
                      {count > 0 ? `${count} peça${count !== 1 ? 's' : ''}` : 'Em breve'}
                    </span>
                    <svg className="w-3.5 h-3.5 text-gold/0 group-hover:text-gold/60 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      ))}

      {/* CTA for new brands */}
      <div className="border border-gold/10 p-10 text-center mt-8">
        <p className="text-offwhite/40 text-xs tracking-[0.3em] uppercase mb-4">Para marcas</p>
        <h2 className="text-offwhite text-2xl font-light mb-3">Sua marca tem um lugar aqui</h2>
        <p className="text-offwhite/30 text-sm leading-relaxed max-w-sm mx-auto mb-6">
          Marcas brasileiras independentes com identidade e qualidade. Entre em contato.
        </p>
        <Link
          href="/marcas-parceiras"
          className="inline-block border border-gold/30 text-gold/80 hover:border-gold hover:text-gold px-8 py-3 text-xs tracking-[0.2em] uppercase transition-all duration-300"
        >
          Saiba mais
        </Link>
      </div>
    </div>
  )
}
