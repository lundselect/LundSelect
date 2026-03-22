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
          </div>

          <div>
            <h3 className="text-offwhite text-xs tracking-widest uppercase mb-4">Navegue</h3>
            <ul className="space-y-3">
              {['Novidades', 'Roupas', 'Acessórios', 'Marcas', 'Sale'].map((item) => (
                <li key={item}>
                  <Link href={`/produtos?categoria=${item.toLowerCase()}`} className="text-offwhite/50 hover:text-gold text-sm transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-offwhite text-xs tracking-widest uppercase mb-4">Ajuda</h3>
            <ul className="space-y-3">
              {['Sobre nós', 'Para marcas', 'Frete & Trocas', 'Contato'].map((item) => (
                <li key={item}>
                  <Link href="#" className="text-offwhite/50 hover:text-gold text-sm transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-gold/10 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-offwhite/30 text-xs">© 2024 Lund Select. Todos os direitos reservados.</p>
          <p className="text-offwhite/30 text-xs tracking-wider">BRASIL INTEIRO. UMA SÓ VITRINE.</p>
        </div>
      </div>
    </footer>
  )
}
