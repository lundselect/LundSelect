import { Metadata } from 'next'
import Link from 'next/link'
import { brands } from '@/lib/data'

export const metadata: Metadata = {
  title: 'Para marcas — Lund Select',
  description: 'Faça parte da Lund Select. Saiba como ter sua marca na nossa vitrine.',
}

export default function MarcasParceirasPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <p className="text-gold/60 text-xs tracking-[0.3em] uppercase mb-4">Seja parceira</p>
      <h1 className="text-offwhite text-4xl font-light tracking-wide mb-4">Para marcas</h1>
      <p className="text-offwhite/50 text-sm leading-relaxed mb-16 max-w-xl">
        Sua marca tem identidade, qualidade e história? A Lund Select conecta marcas brasileiras independentes a clientes que valorizam o que é genuíno.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-gold/10 mb-16">
        {[
          { title: 'Curadoria', desc: 'Avaliamos cada marca individualmente. Não somos um marketplace genérico.' },
          { title: 'Alcance', desc: 'Chegue a clientes de todo o Brasil que buscam moda autoral e independente.' },
          { title: 'Simplicidade', desc: 'Processo de cadastro direto, sem burocracia. Foco no produto e na história.' },
        ].map((item) => (
          <div key={item.title} className="bg-primary p-8">
            <h3 className="text-gold text-sm tracking-widest uppercase mb-3">{item.title}</h3>
            <p className="text-offwhite/50 text-sm leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>

      <div className="border border-gold/20 p-8 text-center">
        <h2 className="text-offwhite text-xl font-light mb-4">Quero ser parceira</h2>
        <p className="text-offwhite/40 text-sm mb-6">Entre em contato pelo e-mail abaixo e nossa equipe retornará em até 5 dias úteis.</p>
        <a href="mailto:marcas@lundselect.com.br" className="text-gold text-sm hover:text-gold/70 transition-colors">
          marcas@lundselect.com.br
        </a>
      </div>

      <div className="mt-16">
        <h2 className="text-offwhite text-xl font-light mb-8">Marcas atuais</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {brands.map((brand) => (
            <Link key={brand.id} href={`/marcas/${brand.slug}`} className="border border-gold/10 hover:border-gold/30 transition-colors group flex items-center justify-center h-28 px-6">
              {brand.logo ? (
                <div style={{width: '160px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={brand.logo} alt={brand.name} style={{maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', mixBlendMode: 'multiply'}} />
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-offwhite/30 text-xs uppercase tracking-widest">{brand.state}</p>
                  <p className="text-offwhite group-hover:text-gold text-sm mt-1 transition-colors">{brand.name}</p>
                </div>
              )}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
