import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Política de Privacidade — Lund Select',
  description: 'Saiba como a Lund Select coleta, usa e protege seus dados pessoais.',
}

const sections = [
  {
    title: '1. Quais dados coletamos',
    content: `Coletamos dados que você nos fornece diretamente ao criar uma conta, realizar um pedido ou entrar em contato conosco. Isso inclui nome, endereço de e-mail, endereço de entrega e informações de pagamento processadas com segurança por nossos parceiros.

Também coletamos dados de uso de forma automática, como páginas visitadas, produtos visualizados e interações com a plataforma, para melhorar a sua experiência.`,
  },
  {
    title: '2. Como usamos seus dados',
    content: `Utilizamos seus dados para processar pedidos e entregas, enviar comunicações relacionadas à sua conta, personalizar sua experiência de compra, melhorar nossos serviços e cumprir obrigações legais.

Não vendemos seus dados pessoais a terceiros.`,
  },
  {
    title: '3. Compartilhamento de dados',
    content: `Podemos compartilhar seus dados com parceiros de entrega, processadores de pagamento e ferramentas de suporte ao cliente estritamente para a execução dos serviços contratados. Todos os parceiros são obrigados a manter a confidencialidade dos seus dados.`,
  },
  {
    title: '4. Cookies',
    content: `Usamos cookies essenciais para manter sua sessão ativa e lembrar itens no carrinho. Também utilizamos cookies analíticos para entender como os usuários navegam no site. Você pode desativar cookies não essenciais nas configurações do seu navegador.`,
  },
  {
    title: '5. Seus direitos (LGPD)',
    content: `De acordo com a Lei Geral de Proteção de Dados (LGPD), você tem direito a acessar, corrigir ou excluir seus dados pessoais, solicitar a portabilidade dos seus dados e revogar o consentimento a qualquer momento.

Para exercer qualquer desses direitos, entre em contato pelo e-mail: oi@lundselect.com.br`,
  },
  {
    title: '6. Segurança',
    content: `Adotamos medidas técnicas e organizacionais para proteger seus dados contra acesso não autorizado, perda ou alteração. Todas as transmissões de dados são criptografadas via SSL.`,
  },
  {
    title: '7. Retenção de dados',
    content: `Mantemos seus dados pelo tempo necessário para fornecer nossos serviços e cumprir obrigações legais. Após o encerramento da sua conta, os dados são excluídos ou anonimizados dentro de 90 dias, salvo obrigação legal de retenção.`,
  },
  {
    title: '8. Alterações nesta política',
    content: `Podemos atualizar esta Política de Privacidade periodicamente. Notificaremos você sobre mudanças significativas por e-mail ou por um aviso destacado no site. O uso continuado dos nossos serviços após as mudanças implica aceitação da nova política.`,
  },
  {
    title: '9. Contato',
    content: `Dúvidas ou solicitações relacionadas à privacidade podem ser enviadas para: oi@lundselect.com.br`,
  },
]

export default function PrivacidadePage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <p className="text-gold/60 text-xs tracking-[0.3em] uppercase mb-4">Legal</p>
      <h1 className="text-offwhite text-4xl font-light tracking-wide mb-4">Política de Privacidade</h1>
      <p className="text-offwhite/30 text-xs mb-12">Última atualização: abril de 2025</p>

      <div className="space-y-10">
        {sections.map((section) => (
          <div key={section.title}>
            <h2 className="text-offwhite text-sm font-medium tracking-wide mb-3">{section.title}</h2>
            {section.content.split('\n\n').map((para, i) => (
              <p key={i} className="text-offwhite/50 text-sm leading-relaxed mb-3">{para}</p>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
