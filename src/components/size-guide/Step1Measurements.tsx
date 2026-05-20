'use client'

import { useState } from 'react'
import { Measurements } from '@/lib/size-guide/types'

interface Props {
  initial?: Partial<Measurements>
  onComplete: (measurements: Partial<Measurements>) => void
  onSkip: () => void
}

interface Field {
  key: keyof Measurements
  label: string
  tip: string
  required?: boolean
}

const FIELDS: Field[] = [
  { key: 'bust_cm',   label: 'Busto',   tip: 'Meça na parte mais larga do peito, passando pelas costas',    required: true },
  { key: 'waist_cm',  label: 'Cintura', tip: 'Parte mais fina do tronco, cerca de 2–3 cm acima do umbigo' },
  { key: 'hip_cm',    label: 'Quadril', tip: 'Parte mais larga dos quadris, fita paralela ao chão' },
  { key: 'height_cm', label: 'Altura',  tip: 'Sem sapatos',                                                  required: true },
  { key: 'inseam_cm', label: 'Entrepernas', tip: 'Da virilha até o tornozelo, ao longo da perna interna' },
]

export default function Step1Measurements({ initial, onComplete, onSkip }: Props) {
  const [values, setValues] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {}
    FIELDS.forEach(f => {
      const v = initial?.[f.key as keyof Measurements]
      if (typeof v === 'number') init[f.key] = String(v)
    })
    return init
  })
  const [openTip, setOpenTip] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const measurements: Partial<Measurements> = {}
    FIELDS.forEach(({ key }) => {
      const raw = values[key]
      if (raw && raw.trim()) {
        const n = parseFloat(raw)
        if (!isNaN(n) && n > 0) (measurements as any)[key] = n
      }
    })
    onComplete(measurements)
  }

  return (
    <div>
      <h2 className="text-offwhite text-xl font-light mb-2">Suas medidas</h2>
      <p className="text-offwhite/40 text-sm mb-6 leading-relaxed">
        Todas as medidas em centímetros. Cada campo tem uma dica de como medir.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {FIELDS.map(({ key, label, tip, required }) => (
          <div key={key}>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-offwhite/50 text-xs tracking-widest uppercase">
                {label}{required && <span className="text-gold/60 ml-1">*</span>}
              </label>
              <button
                type="button"
                onClick={() => setOpenTip(openTip === key ? null : key)}
                className="text-gold/40 text-xs hover:text-gold transition-colors"
              >
                Como medir?
              </button>
            </div>
            {openTip === key && (
              <p className="text-offwhite/30 text-xs mb-2 leading-relaxed border-l border-gold/20 pl-3">
                {tip}
              </p>
            )}
            <div className="relative">
              <input
                type="number"
                value={values[key] ?? ''}
                onChange={e => setValues(v => ({ ...v, [key]: e.target.value }))}
                placeholder="—"
                min={1}
                max={300}
                className="w-full bg-offwhite/5 border border-gold/20 text-offwhite placeholder-offwhite/20 px-4 py-3 text-sm focus:outline-none focus:border-gold/60 transition-colors pr-12"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-offwhite/25 text-xs">cm</span>
            </div>
          </div>
        ))}

        <div className="pt-4 flex flex-col sm:flex-row gap-3">
          <button
            type="submit"
            className="flex-1 bg-gold text-primary py-3.5 text-xs tracking-[0.2em] uppercase hover:bg-gold/90 transition-colors"
          >
            Continuar
          </button>
          <button
            type="button"
            onClick={onSkip}
            className="flex-1 border border-gold/20 text-offwhite/40 py-3.5 text-xs tracking-widest uppercase hover:text-offwhite hover:border-gold/40 transition-colors"
          >
            Pular esta etapa
          </button>
        </div>
      </form>
    </div>
  )
}
