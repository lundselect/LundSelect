import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contato — Lund Select',
  description: 'Fale com a equipe Lund Select. Estamos aqui para ajudar.',
}

export default function ContatoPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <p className="text-gold/60 text-xs tracking-[0.3em] uppercase mb-4">Fale conosco</p>
      <h1 className="text-offwhite text-4xl font-light tracking-wide mb-4">Contato</h1>
      <p className="text-offwhite/50 text-sm leading-relaxed mb-12">Nossa equipe responde em até 1 dia útil.</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-16">
        {[
          { label: 'E-mail', value: 'oi@lundselect.com.br', href: 'mailto:oi@lundselect.com.br' },
          { label: 'WhatsApp', value: '+55 11 9 0000-0000', href: 'https://wa.me/5511900000000' },
          { label: 'Instagram', value: '@lundselect', href: '#' },
        ].map((item) => (
          <a key={item.label} href={item.href} className="border border-gold/10 hover:border-gold/30 p-6 transition-colors group block">
            <p className="text-offwhite/30 text-xs tracking-widest uppercase mb-2">{item.label}</p>
            <p className="text-offwhite group-hover:text-gold text-sm transition-colors">{item.value}</p>
          </a>
        ))}
      </div>

      <form className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-offwhite/40 text-xs tracking-widest uppercase mb-2">Nome</label>
            <input type="text" className="w-full bg-offwhite/5 border border-gold/20 text-offwhite placeholder-offwhite/20 px-4 py-3 text-sm focus:outline-none focus:border-gold/60 transition-colors" placeholder="Seu nome" />
          </div>
          <div>
            <label className="block text-offwhite/40 text-xs tracking-widest uppercase mb-2">E-mail</label>
            <input type="email" className="w-full bg-offwhite/5 border border-gold/20 text-offwhite placeholder-offwhite/20 px-4 py-3 text-sm focus:outline-none focus:border-gold/60 transition-colors" placeholder="seu@email.com" />
          </div>
        </div>
        <div>
          <label className="block text-offwhite/40 text-xs tracking-widest uppercase mb-2">Mensagem</label>
          <textarea rows={5} className="w-full bg-offwhite/5 border border-gold/20 text-offwhite placeholder-offwhite/20 px-4 py-3 text-sm focus:outline-none focus:border-gold/60 transition-colors resize-none" placeholder="Como podemos ajudar?" />
        </div>
        <button type="submit" className="bg-gold text-primary px-10 py-4 text-xs tracking-[0.2em] uppercase hover:bg-gold/90 transition-colors">
          Enviar mensagem
        </button>
      </form>
    </div>
  )
}
