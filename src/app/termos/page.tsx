import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Termos de Uso — Lund Select',
  description: 'Leia os Termos de Uso da plataforma Lund Select.',
}

const sections = [
  {
    title: '1. Aceitação dos termos',
    content: `Ao acessar ou usar a plataforma Lund Select, você concorda com estes Termos de Uso. Se não concordar com algum ponto, por favor não utilize nossos serviços.`,
  },
  {
    title: '2. Sobre a plataforma',
    content: `A Lund Select é uma vitrine curada de moda feminina brasileira que conecta consumidores a marcas parceiras. Atuamos como intermediários e facilitadores de descoberta de marcas — as transações de compra podem ser direcionadas para os canais próprios de cada marca parceira.`,
  },
  {
    title: '3. Conta de usuário',
    content: `Para acessar determinadas funcionalidades (favoritos, histórico, endereços), você precisará criar uma conta. Você é responsável por manter a confidencialidade das suas credenciais e por todas as atividades realizadas na sua conta.

Nos reservamos o direito de suspender contas que violem estes termos.`,
  },
  {
    title: '4. Uso permitido',
    content: `Você pode usar a plataforma apenas para fins pessoais e não comerciais. É proibido reproduzir, distribuir ou criar obras derivadas do conteúdo da plataforma sem autorização prévia por escrito.

Também é proibido utilizar bots, scrapers ou qualquer meio automatizado para acessar o conteúdo da plataforma.`,
  },
  {
    title: '5. Propriedade intelectual',
    content: `Todo o conteúdo da plataforma — incluindo textos, imagens, logotipos e design — é propriedade da Lund Select ou de seus parceiros e está protegido por leis de propriedade intelectual brasileiras e internacionais.`,
  },
  {
    title: '6. Marcas parceiras',
    content: `As marcas exibidas na plataforma são parceiras independentes. A Lund Select realiza curadoria e seleção, mas não se responsabiliza por problemas relacionados a produtos adquiridos diretamente nas lojas das marcas parceiras. Em caso de dúvidas sobre uma compra específica, entre em contato com a marca diretamente.`,
  },
  {
    title: '7. Limitação de responsabilidade',
    content: `A Lund Select não se responsabiliza por danos indiretos, incidentais ou consequentes decorrentes do uso ou da impossibilidade de uso da plataforma. Nossos serviços são fornecidos "como estão", sem garantias de qualquer tipo.`,
  },
  {
    title: '8. Modificações',
    content: `Podemos alterar estes Termos de Uso a qualquer momento. Notificaremos sobre mudanças significativas por e-mail ou aviso na plataforma. O uso continuado dos serviços após as alterações implica aceitação dos novos termos.`,
  },
  {
    title: '9. Lei aplicável',
    content: `Estes termos são regidos pela legislação brasileira. Quaisquer disputas serão resolvidas no foro da comarca de São Paulo, SP.`,
  },
  {
    title: '10. Contato',
    content: `Dúvidas sobre estes termos? Fale conosco: oi@lundselect.com.br`,
  },
]

export default function TermosPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <p className="text-gold/60 text-xs tracking-[0.3em] uppercase mb-4">Legal</p>
      <h1 className="text-offwhite text-4xl font-light tracking-wide mb-4">Termos de Uso</h1>
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
