'use client'

import { useRef } from 'react'

interface Props {
  min: number
  max: number
  valueMin: number
  valueMax: number
  onChange: (min: number, max: number) => void
}

const PRESETS = [
  { label: 'Até R$200', min: 0, max: 200 },
  { label: 'Até R$400', min: 0, max: 400 },
  { label: 'R$200 – R$400', min: 200, max: 400 },
  { label: 'R$400 – R$600', min: 400, max: 600 },
  { label: 'Acima de R$600', min: 600, max: Infinity },
]

function fmt(n: number) {
  return n === Infinity ? '∞' : `R$\u00a0${n.toLocaleString('pt-BR')}`
}

export default function PriceRangeFilter({ min, max, valueMin, valueMax, onChange }: Props) {
  const rangeRef = useRef<HTMLDivElement>(null)

  const pct = (v: number) => ((v - min) / (max - min)) * 100

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Math.min(Number(e.target.value), valueMax - 10)
    onChange(v, valueMax)
  }

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Math.max(Number(e.target.value), valueMin + 10)
    onChange(valueMin, v)
  }

  const activePreset = PRESETS.find(
    p => p.min === valueMin && (p.max === valueMax || (p.max === Infinity && valueMax === max))
  )

  return (
    <div className="space-y-5">
      {/* Preset buttons — shown first, right below PREÇO heading */}
      <div className="space-y-2">
        {PRESETS.map((p) => {
          const isActive = p === activePreset
          const effectiveMax = p.max === Infinity ? max : p.max
          return (
            <button
              key={p.label}
              onClick={() => onChange(p.min, effectiveMax)}
              className={`w-full text-left text-sm py-1 transition-colors ${
                isActive ? 'text-gold' : 'text-offwhite/50 hover:text-offwhite'
              }`}
            >
              {p.label}
            </button>
          )
        })}
      </div>

      {/* Divider */}
      <div className="h-px bg-gold/10" />

      {/* Current range display */}
      <div className="flex justify-between text-xs text-offwhite/40">
        <span className={valueMin > min ? 'text-gold' : ''}>{fmt(valueMin)}</span>
        <span className={valueMax < max ? 'text-gold' : ''}>{fmt(valueMax)}</span>
      </div>

      {/* Dual range slider */}
      <div ref={rangeRef} className="relative h-4 flex items-center">
        <div className="absolute inset-x-0 h-px bg-offwhite/15" />
        <div
          className="absolute h-px bg-gold"
          style={{ left: `${pct(valueMin)}%`, right: `${100 - pct(valueMax)}%` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={10}
          value={valueMin}
          onChange={handleMinChange}
          className="absolute w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gold [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-gold [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer"
        />
        <input
          type="range"
          min={min}
          max={max}
          step={10}
          value={valueMax}
          onChange={handleMaxChange}
          className="absolute w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gold [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-gold [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer"
        />
      </div>

      <div className="flex justify-between text-xs text-offwhite/25">
        <span>mín</span>
        <span>máx</span>
      </div>
    </div>
  )
}
