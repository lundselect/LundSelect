'use client'

import { useState } from 'react'

const faqs = [
  {
    category: 'Pedidos & Entregas',
    items: [
      {
        q: 'Como funciona o processo de compra na Lund Select?',
        a: 'Você navega pela nossa curadoria, adiciona os produtos ao carrinho e finaliza o pedido. Dependendo da marca, você pode ser direcionada ao canal oficial da marca para concluir a compra ou comprar diretamente conosco.',
      },
      {
        q: 'Qual é o prazo de entrega?',
        a: 'O frete padrão leva de 5 a 10 dias úteis. O frete expresso chega em 2 a 3 dias úteis. Os envios são realizados de segunda a sexta.',
      },
      {
        q: 'Frete grátis está disponível?',
        a: 'Sim! Compras acima de R$ 249 têm frete grátis. O frete padrão é R$ 18,90 e o expresso é R$ 34,90.',
      },
      {
        q: 'Posso rastrear meu pedido?',
        a: 'Sim. Após o envio, você receberá um e-mail com o código de rastreamento. Você também pode acompanhar pelo e-mail ou entrando em contato com a nossa equipe.',
      },
    ],
  },
  {
    category: 'Trocas & Devoluções',
    items: [
      {
        q: 'Posso trocar um produto?',
        a: 'Sim, aceitamos trocas em até 30 dias após o recebimento. O produto deve estar sem uso, com etiquetas originais e na embalagem original. A primeira troca é gratuita.',
      },
      {
        q: 'Como faço para devolver um produto?',
        a: 'Devoluções são aceitas em até 7 dias (Código de Defesa do Consumidor). Entre em contato pelo e-mail oi@lundselect.com.br para iniciar o processo. O reembolso é feito em até 10 dias úteis.',
      },
      {
        q: 'O reembolso é feito de que forma?',
        a: 'O reembolso pode ser feito via PIX ou estorno no cartão de crédito, conforme a forma de pagamento original.',
      },
    ],
  },
  {
    category: 'Conta & Fidelidade',
    items: [
      {
        q: 'Como funciona o programa de fidelidade?',
        a: 'Cada compra gera pontos que evoluem seu nível: Membro, Prata, Ouro e Platina. Níveis mais altos trazem descontos, frete grátis e acesso VIP a lançamentos. Você pode acompanhar seus pontos na página "Minha Conta".',
      },
      {
        q: 'Preciso de conta para comprar?',
        a: 'Não é obrigatório. Mas com conta você acumula pontos, salva favoritos, gerencia endereços e acompanha seu histórico com mais facilidade.',
      },
      {
        q: 'Como altero minha senha?',
        a: 'Na página de login, clique em "Esqueci minha senha". Você receberá um e-mail com o link para criar uma nova senha.',
      },
    ],
  },
  {
    category: 'Marcas & Curadoria',
    items: [
      {
        q: 'Como as marcas são escolhidas?',
        a: 'Cada marca é avaliada individualmente por critérios de qualidade, identidade, propósito e originalidade. Priorizamos marcas independentes brasileiras, lideradas por mulheres, com produção nacional.',
      },
      {
        q: 'Minha marca pode fazer parte da Lund Select?',
        a: 'Sim! Acesse a página "Para marcas" e envie um e-mail para marcas@lundselect.com.br. Nossa equipe retornará em até 5 dias úteis.',
      },
      {
        q: 'As marcas vendem em outras plataformas?',
        a: 'Sim, nossas marcas parceiras são independentes e podem ter seus próprios canais. A Lund Select é uma vitrine curada — nosso valor está na descoberta e na seleção.',
      },
    ],
  },
]

export default function FAQAccordion() {
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({})

  const toggle = (key: string) => {
    setOpenItems((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <div className="space-y-12">
      {faqs.map((section) => (
        <div key={section.category}>
          <h2 className="text-gold text-xs tracking-[0.3em] uppercase mb-6 pb-3 border-b border-gold/20">
            {section.category}
          </h2>
          <div className="space-y-1">
            {section.items.map((item, i) => {
              const key = `${section.category}-${i}`
              const isOpen = openItems[key]
              return (
                <div key={key} className="border border-gold/10 hover:border-gold/20 transition-colors">
                  <button
                    onClick={() => toggle(key)}
                    className="w-full text-left px-6 py-4 flex items-center justify-between gap-4"
                  >
                    <span className="text-offwhite text-sm leading-snug">{item.q}</span>
                    <svg
                      className={`w-4 h-4 text-gold/40 flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                      fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-5">
                      <p className="text-offwhite/50 text-sm leading-relaxed">{item.a}</p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
