import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Sobre nós — Lund Select',
  description: 'Conheça a Lund Select, a vitrine curada da moda feminina brasileira. Nossa história, missão e os valores que guiam nossa curadoria.',
  alternates: { canonical: 'https://lundselect.com.br/sobre' },
}

export default function SobrePage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <p className="text-gold/60 text-xs tracking-[0.3em] uppercase mb-4">Nossa história</p>
      <h1 className="text-offwhite text-4xl font-light tracking-wide mb-8">Sobre a Lund Select</h1>

      <div className="space-y-6 text-offwhite/60 text-sm leading-relaxed mb-16">
        <p>A Lund Select nasceu da crença de que a moda brasileira é uma das mais ricas e diversas do mundo — e merecia uma vitrine à sua altura.</p>
        <p>Reunimos marcas do Norte ao Sul: da alfaiataria paulistana ao bordado baiano, dos acessórios artesanais do Nordeste às peças leves do Rio. Cada marca é escolhida a dedo, com critérios de qualidade, identidade e propósito.</p>
        <p>Nossa curadoria prioriza marcas independentes lideradas por mulheres, com produção nacional e atenção ao impacto social e ambiental.</p>
      </div>

      {/* Values */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-gold/10 mb-16">
        {[
          {
            title: 'Curadoria',
            desc: 'Cada peça que entra na Lund Select passa por uma avaliação cuidadosa. Não somos um marketplace genérico — somos uma vitrine com ponto de vista.',
          },
          {
            title: 'Brasilidade',
            desc: 'Acreditamos no potencial criativo do Brasil. Cada marca que representamos carrega uma identidade genuinamente nacional.',
          },
          {
            title: 'Propósito',
            desc: 'Priorizamos marcas com produção consciente, lideradas por mulheres, que respeitam as pessoas e o planeta.',
          },
        ].map((item) => (
          <div key={item.title} className="bg-primary p-8">
            <h2 className="text-gold text-xs tracking-[0.3em] uppercase mb-3">{item.title}</h2>
            <p className="text-offwhite/50 text-sm leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div className="border border-gold/10 p-8 mb-16">
        <div className="grid grid-cols-3 gap-8 text-center">
          {[
            { value: '6+', label: 'Marcas parceiras' },
            { value: 'BR', label: 'Norte ao Sul' },
            { value: '100%', label: 'Produção nacional' },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="text-gold text-3xl font-light mb-1">{stat.value}</p>
              <p className="text-offwhite/30 text-xs tracking-widest uppercase">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <Link href="/marcas-parceiras" className="text-gold text-xs tracking-widest uppercase border border-gold/30 px-8 py-3 hover:border-gold transition-colors inline-block text-center">
          Conheça nossas marcas
        </Link>
        <Link href="/contato" className="text-offwhite/50 text-xs tracking-widest uppercase border border-offwhite/10 px-8 py-3 hover:border-offwhite/30 hover:text-offwhite transition-colors inline-block text-center">
          Falar conosco
        </Link>
      </div>
    </div>
  )
}
