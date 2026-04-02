'use client'

import { useState, useEffect, useCallback } from 'react'

const SLIDES = [
  'https://newmatch.com.br/media/wysiwyg/home-new-macth/2026/marco/11/BANNER_PRINCIPAL_DESKTOP_6_.jpg',
  'https://newmatch.com.br/media/wysiwyg/home-new-macth/2026/marco/11/BANNER_PRINCIPAL_DESKTOP_18_.jpg',
]

export default function NewMatchHero() {
  const [current, setCurrent] = useState(0)

  const next = useCallback(() => setCurrent(c => (c + 1) % SLIDES.length), [])
  const prev = () => setCurrent(c => (c - 1 + SLIDES.length) % SLIDES.length)

  useEffect(() => {
    const timer = setInterval(next, 4500)
    return () => clearInterval(timer)
  }, [next])

  return (
    <div className="relative w-full overflow-hidden" style={{ aspectRatio: '16/5' }}>
      {SLIDES.map((src, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={src}
          src={src}
          alt={`New Match campaign ${i + 1}`}
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700"
          style={{ opacity: i === current ? 1 : 0 }}
        />
      ))}

      <button
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white w-9 h-9 flex items-center justify-center transition-colors"
        aria-label="Anterior"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white w-9 h-9 flex items-center justify-center transition-colors"
        aria-label="Próximo"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-1.5 rounded-full transition-all duration-300 ${i === current ? 'bg-white w-4' : 'bg-white/50 w-1.5'}`}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
