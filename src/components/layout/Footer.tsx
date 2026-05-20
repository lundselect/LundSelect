import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-primary border-t border-gold/20 mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-2">
            <span className="text-gold font-semibold text-xl tracking-widest uppercase">Lund Select</span>
            <p className="mt-4 text-offwhite/50 text-sm leading-relaxed max-w-xs">
              Uma vitrine curada para a moda feminina brasileira. Do Norte ao Sul, as melhores marcas em um só lugar.
            </p>
            {/* Social */}
            <div className="mt-6 flex items-center gap-4">
              <a
                href="https://instagram.com/lundselect"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram da Lund Select"
                className="text-offwhite/30 hover:text-gold transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
              <a
                href="mailto:oi@lundselect.com.br"
                aria-label="E-mail da Lund Select"
                className="text-offwhite/30 hover:text-gold transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-offwhite text-xs tracking-widest uppercase mb-4">Navegue</h3>
            <ul className="space-y-3">
              {[
                { label: 'Novidades', href: '/novidades' },
                { label: 'Roupas', href: '/produtos' },
                { label: 'Acessórios', href: '/produtos?categoria=acessorios' },
                { label: 'Marcas', href: '/marcas-parceiras' },
                { label: 'Sale', href: '/produtos?categoria=sale' },
              ].map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="text-offwhite/50 hover:text-gold text-sm transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-offwhite text-xs tracking-widest uppercase mb-4">Ajuda</h3>
            <ul className="space-y-3">
              {[
                { label: 'Sobre nós', href: '/sobre' },
                { label: 'Para marcas', href: '/marcas-parceiras' },
                { label: 'Frete & Trocas', href: '/frete-trocas' },
                { label: 'Guia de Tamanhos', href: '/guia-de-tamanhos' },
                { label: 'FAQ', href: '/faq' },
                { label: 'Ajuda & Suporte', href: '/ajuda' },
                { label: 'Contato', href: '/contato' },
              ].map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="text-offwhite/50 hover:text-gold text-sm transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-gold/10 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-offwhite/30 text-xs">© {new Date().getFullYear()} Lund Select. Todos os direitos reservados.</p>
          <div className="flex items-center gap-6">
            <Link href="/privacidade" className="text-offwhite/30 hover:text-offwhite/60 text-xs transition-colors">Privacidade</Link>
            <Link href="/termos" className="text-offwhite/30 hover:text-offwhite/60 text-xs transition-colors">Termos</Link>
            <p className="text-offwhite/30 text-xs tracking-wider hidden sm:block">BRASIL INTEIRO. UMA SÓ VITRINE.</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
