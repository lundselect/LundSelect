import { Metadata } from 'next'
import ContactForm from '@/components/ui/ContactForm'

export const metadata: Metadata = {
  title: 'Contato — Lund Select',
  description: 'Fale com a equipe Lund Select. Estamos aqui para ajudar.',
  alternates: { canonical: 'https://lundselect.com.br/contato' },
}

const contactJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ContactPage',
  name: 'Contato — Lund Select',
  url: 'https://lundselect.com.br/contato',
  description: 'Fale com a equipe Lund Select.',
  contactOption: 'TollFree',
  contactType: 'customer service',
  email: 'oi@lundselect.com.br',
  availableLanguage: 'Portuguese',
}

export default function ContatoPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(contactJsonLd) }} />
      <p className="text-gold/60 text-xs tracking-[0.3em] uppercase mb-4">Fale conosco</p>
      <h1 className="text-offwhite text-4xl font-light tracking-wide mb-4">Contato</h1>
      <p className="text-offwhite/50 text-sm leading-relaxed mb-12">Nossa equipe responde em até 1 dia útil.</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-16">
        {[
          { label: 'E-mail', value: 'oi@lundselect.com.br', href: 'mailto:oi@lundselect.com.br' },
          { label: 'WhatsApp', value: '+55 11 9 0000-0000', href: 'https://wa.me/5511900000000' },
          { label: 'Instagram', value: '@lundselect', href: 'https://instagram.com/lundselect' },
        ].map((item) => (
          <a key={item.label} href={item.href} target={item.href.startsWith('http') ? '_blank' : undefined} rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined} className="border border-gold/10 hover:border-gold/30 p-6 transition-colors group block">
            <p className="text-offwhite/30 text-xs tracking-widest uppercase mb-2">{item.label}</p>
            <p className="text-offwhite group-hover:text-gold text-sm transition-colors">{item.value}</p>
          </a>
        ))}
      </div>

      <ContactForm />
    </div>
  )
}
