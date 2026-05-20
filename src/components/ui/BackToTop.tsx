'use client'

import { useScrollPosition } from '@/hooks/useScrollPosition'

export default function BackToTop() {
  const scrollY = useScrollPosition()

  if (scrollY < 400) return null

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Voltar ao topo"
      className="fixed bottom-24 right-6 z-40 w-10 h-10 border border-gold/30 bg-primary hover:border-gold hover:text-gold text-offwhite/40 flex items-center justify-center transition-all duration-200 animate-in fade-in"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.5 15.75l7.5-7.5 7.5 7.5" />
      </svg>
    </button>
  )
}
