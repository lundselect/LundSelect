import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Sobre nós — Lund Select',
  description: 'Conheça a Lund Select, a vitrine curada da moda feminina brasileira.',
}

export default function SobrePage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <p className="text-gold/60 text-xs tracking-[0.3em] uppercase mb-4">Nossa história</p>
      <h1 className="text-offwhite text-4xl font-light tracking-wide mb-8">Sobre a Lund Select</h1>
      <div className="space-y-6 text-offwhite/60 text-sm leading-relaxed">
        <p>A Lund Select nasceu da crença de que a moda brasileira é uma das mais ricas e diversas do mundo — e merecia uma vitrine à sua altura.</p>
        <p>Reunimos marcas do Norte ao Sul: da alfaiataria paulistana ao bordado baiano, dos acessórios artesanais do Nordeste às peças leves do Rio. Cada marca é escolhida a dedo, com critérios de qualidade, identidade e propósito.</p>
        <p>Nossa curadoria prioriza marcas independentes lideradas por mulheres, com produção nacional e atenção ao impacto social e ambiental.</p>
      </div>
      <div className="mt-12">
        <Link href="/marcas-parceiras" className="text-gold text-xs tracking-widest uppercase border border-gold/30 px-8 py-3 hover:border-gold transition-colors inline-block">
          Conheça nossas marcas
        </Link>
      </div>
    </div>
  )
}
