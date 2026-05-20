import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      <p className="text-gold/40 text-xs tracking-[0.5em] uppercase mb-6">404</p>
      <h1 className="text-offwhite text-4xl font-light tracking-wide mb-4">Página não encontrada</h1>
      <p className="text-offwhite/40 text-sm max-w-xs leading-relaxed mb-10">
        Essa página não existe ou foi removida. Que tal explorar nossas marcas e novidades?
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          href="/"
          className="border border-gold text-gold hover:bg-gold hover:text-primary px-10 py-3.5 text-xs tracking-[0.2em] uppercase transition-all duration-300"
        >
          Voltar ao início
        </Link>
        <Link
          href="/produtos"
          className="border border-offwhite/20 text-offwhite/60 hover:border-offwhite/50 hover:text-offwhite px-10 py-3.5 text-xs tracking-[0.2em] uppercase transition-all duration-300"
        >
          Ver produtos
        </Link>
      </div>
    </div>
  )
}
