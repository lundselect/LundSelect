'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      <p className="text-gold/40 text-xs tracking-[0.5em] uppercase mb-6">Erro</p>
      <h1 className="text-offwhite text-4xl font-light tracking-wide mb-4">Algo deu errado</h1>
      <p className="text-offwhite/40 text-sm max-w-xs leading-relaxed mb-10">
        Ocorreu um erro inesperado. Tente novamente ou volte para a página inicial.
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={reset}
          className="border border-gold text-gold hover:bg-gold hover:text-primary px-10 py-3.5 text-xs tracking-[0.2em] uppercase transition-all duration-300"
        >
          Tentar novamente
        </button>
        <Link
          href="/"
          className="border border-offwhite/20 text-offwhite/60 hover:border-offwhite/50 hover:text-offwhite px-10 py-3.5 text-xs tracking-[0.2em] uppercase transition-all duration-300"
        >
          Voltar ao início
        </Link>
      </div>
    </div>
  )
}
