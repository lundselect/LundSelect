'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function CookieConsent() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem('lund_cookie_consent')
    if (!consent) {
      // Delay slightly so it doesn't flash on first paint
      const t = setTimeout(() => setVisible(true), 1500)
      return () => clearTimeout(t)
    }
  }, [])

  const accept = () => {
    localStorage.setItem('lund_cookie_consent', 'accepted')
    setVisible(false)
  }

  const decline = () => {
    localStorage.setItem('lund_cookie_consent', 'declined')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[150] bg-primary border-t border-gold/20 shadow-2xl animate-in slide-in-from-bottom duration-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex-1">
          <p className="text-offwhite text-sm font-light mb-1">Sua privacidade importa</p>
          <p className="text-offwhite/40 text-xs leading-relaxed">
            Usamos cookies essenciais para o funcionamento do site e cookies analíticos para melhorar sua experiência.
            Leia nossa{' '}
            <Link href="/privacidade" className="text-gold/70 hover:text-gold transition-colors underline underline-offset-2">
              Política de Privacidade
            </Link>
            .
          </p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <button
            onClick={decline}
            className="text-offwhite/40 hover:text-offwhite text-xs tracking-widest uppercase transition-colors px-4 py-2"
          >
            Recusar
          </button>
          <button
            onClick={accept}
            className="bg-gold text-primary text-xs tracking-[0.15em] uppercase px-6 py-2.5 hover:bg-gold/90 transition-colors"
          >
            Aceitar
          </button>
        </div>
      </div>
    </div>
  )
}
