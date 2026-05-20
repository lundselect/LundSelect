import { Metadata } from 'next'
import Link from 'next/link'
import FAQAccordion from './FAQAccordion'

export const metadata: Metadata = {
  title: 'Perguntas Frequentes — Lund Select',
  description: 'Tire suas dúvidas sobre pedidos, entregas, trocas, devoluções, marcas e seu programa de fidelidade.',
  alternates: { canonical: 'https://lundselect.com.br/faq' },
}

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'Qual é o prazo de entrega?', acceptedAnswer: { '@type': 'Answer', text: 'O frete padrão leva de 5 a 10 dias úteis. O frete expresso chega em 2 a 3 dias úteis.' } },
    { '@type': 'Question', name: 'Frete grátis está disponível?', acceptedAnswer: { '@type': 'Answer', text: 'Sim! Compras acima de R$ 249 têm frete grátis.' } },
    { '@type': 'Question', name: 'Posso trocar um produto?', acceptedAnswer: { '@type': 'Answer', text: 'Sim, aceitamos trocas em até 30 dias após o recebimento. O produto deve estar sem uso, com etiquetas originais.' } },
    { '@type': 'Question', name: 'Como funciona o programa de fidelidade?', acceptedAnswer: { '@type': 'Answer', text: 'Cada compra gera pontos que evoluem seu nível: Membro, Prata, Ouro e Platina. Níveis mais altos trazem descontos e benefícios exclusivos.' } },
    { '@type': 'Question', name: 'Como as marcas são escolhidas?', acceptedAnswer: { '@type': 'Answer', text: 'Cada marca é avaliada individualmente por critérios de qualidade, identidade, propósito e originalidade. Priorizamos marcas independentes brasileiras.' } },
  ],
}

export default function FAQPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <p className="text-gold/60 text-xs tracking-[0.3em] uppercase mb-4">Dúvidas frequentes</p>
      <h1 className="text-offwhite text-4xl font-light tracking-wide mb-12">FAQ</h1>

      <FAQAccordion />

      <div className="mt-16 border border-gold/10 p-8 text-center">
        <p className="text-offwhite/50 text-sm mb-4">Não encontrou o que precisava?</p>
        <Link
          href="/contato"
          className="inline-block border border-gold/40 text-gold/80 hover:border-gold hover:text-gold px-8 py-3 text-xs tracking-[0.2em] uppercase transition-all duration-300"
        >
          Falar com a equipe
        </Link>
      </div>
    </div>
  )
}
