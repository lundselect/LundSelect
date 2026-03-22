import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Frete & Trocas — Lund Select',
  description: 'Informações sobre frete, entrega, trocas e devoluções na Lund Select.',
}

const sections = [
  {
    title: 'Frete',
    items: [
      'Frete grátis em compras acima de R$ 249',
      'Frete padrão: R$ 18,90 — entrega em 5 a 10 dias úteis',
      'Frete expresso: R$ 34,90 — entrega em 2 a 3 dias úteis',
      'Envios realizados de segunda a sexta, em dias úteis',
    ],
  },
  {
    title: 'Trocas',
    items: [
      'Trocas aceitas em até 30 dias após o recebimento',
      'O produto deve estar sem uso, com etiquetas originais e na embalagem original',
      'Custos de envio para troca são por conta da cliente (primeira troca gratuita)',
      'Solicite a troca pelo e-mail atendimento@lundselect.com.br',
    ],
  },
  {
    title: 'Devoluções',
    items: [
      'Devoluções aceitas em até 7 dias (Código de Defesa do Consumidor)',
      'Reembolso realizado em até 10 dias úteis após recebimento do produto',
      'Reembolso via PIX ou estorno no cartão de crédito',
    ],
  },
]

export default function FreteTrocasPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <p className="text-gold/60 text-xs tracking-[0.3em] uppercase mb-4">Informações</p>
      <h1 className="text-offwhite text-4xl font-light tracking-wide mb-12">Frete & Trocas</h1>
      <div className="space-y-12">
        {sections.map((section) => (
          <div key={section.title}>
            <h2 className="text-gold text-sm tracking-widest uppercase mb-5 pb-3 border-b border-gold/20">{section.title}</h2>
            <ul className="space-y-3">
              {section.items.map((item, i) => (
                <li key={i} className="flex gap-3 text-offwhite/60 text-sm leading-relaxed">
                  <span className="text-gold/40 mt-0.5 flex-shrink-0">—</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}
