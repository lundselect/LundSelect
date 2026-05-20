'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

const messages = [
  { text: 'Frete grátis em compras acima de R$ 249', link: null },
  { text: 'Parcele em até 12x sem juros', link: null },
  { text: 'Novidades toda semana — confira as últimas chegadas', link: '/novidades' },
  { text: 'Marcas independentes brasileiras. Do Norte ao Sul.', link: '/marcas-parceiras' },
]

export default function AnnouncementBar() {
  const [current, setCurrent] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    if (typeof window !== 'undefined' && sessionStorage.getItem('ann_dismissed')) {
      setVisible(false)
      return
    }
    const interval = setInterval(() => {
      setCurrent((c) => (c + 1) % messages.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  if (!visible) return null

  const msg = messages[current]

  return (
    <div className="bg-gold/10 border-b border-gold/20 relative">
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-center gap-3">
        <p className="text-offwhite/70 text-xs tracking-wider text-center transition-all duration-500">
          {msg.link ? (
            <Link href={msg.link} className="hover:text-gold transition-colors">
              {msg.text} →
            </Link>
          ) : (
            msg.text
          )}
        </p>
        <button
          onClick={() => {
            setVisible(false)
            sessionStorage.setItem('ann_dismissed', '1')
          }}
          className="absolute right-4 text-offwhite/30 hover:text-offwhite/60 transition-colors"
          aria-label="Fechar"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  )
}
