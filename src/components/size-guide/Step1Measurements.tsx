'use client'

import { useState, useMemo } from 'react'
import { Measurements } from '@/lib/size-guide/types'

// ── Size classification ────────────────────────────────────────────────────
type SizeName = 'PP' | 'P' | 'M' | 'G' | 'GG' | 'XG'

const SIZE_BANDS: { size: SizeName; bust: [number,number]; waist: [number,number]; hip: [number,number] }[] = [
  { size: 'PP', bust: [82,  86],  waist: [64, 68], hip: [90,  94]  },
  { size: 'P',  bust: [88,  92],  waist: [70, 74], hip: [96,  100] },
  { size: 'M',  bust: [94,  98],  waist: [76, 80], hip: [102, 106] },
  { size: 'G',  bust: [100, 104], waist: [82, 86], hip: [108, 112] },
  { size: 'GG', bust: [106, 110], waist: [88, 92], hip: [114, 118] },
  { size: 'XG', bust: [112, 116], waist: [94, 98], hip: [120, 124] },
]

function classifySize(bust: number, waist: number, hip: number): SizeName {
  let best: SizeName = 'M', bestScore = Infinity
  for (const b of SIZE_BANDS) {
    const s = Math.abs(bust - (b.bust[0]  + b.bust[1])  / 2)
            + Math.abs(waist - (b.waist[0] + b.waist[1]) / 2)
            + Math.abs(hip  - (b.hip[0]   + b.hip[1])   / 2)
    if (s < bestScore) { bestScore = s; best = b.size }
  }
  return best
}

// ── Parametric silhouette ──────────────────────────────────────────────────
const clamp  = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v))
const r1     = (n: number) => Math.round(n * 10) / 10

// Brazilian reference defaults (urban SP, IBGE/SENAI)
const REF = { bust: 92, waist: 74, hip: 99, height: 162, inseam: 76 }

interface Paths {
  torso: string; rArm: string; lArm: string; rLeg: string; lLeg: string
  bustY: number; waistY: number; hipY: number; thighY: number
  cx: number; bHW: number; wHW: number; hHW: number
  inseamTop: number; ankleY: number
}

function buildSilhouette(
  bust: number, waist: number, hip: number,
  heightCm: number, inseamCm: number,
): Paths {
  const cx   = 100
  const b    = clamp(bust,     76, 120)
  const w    = clamp(waist,    58, 104)
  const h    = clamp(hip,      84, 128)
  const hc   = clamp(heightCm, 145, 185)
  const ins  = clamp(inseamCm, 60,  90)

  // Half-widths — tuned so reference (92/74/99) looks natural in a 200px-wide viewBox
  const bHW  = r1(b * 0.435)   // 92→40
  const wHW  = r1(w * 0.370)   // 74→27
  const hHW  = r1(h * 0.440)   // 99→44
  const shHW = r1(bHW * 0.86)
  const nHW  = 9

  // Fixed Y skeleton; only leg section scales with height/inseam
  const nY    = 48
  const shY   = 68
  const bustY = 122
  const waistY= 190
  const hipY  = 240
  const crY   = 270
  const thighY= r1(crY + 38)

  const legScale = hc / 162
  const legLen   = r1(190 * legScale)
  const inseamLen= r1(ins * (legLen / 76))   // scale inseam to SVG
  const ankleY   = r1(crY + legLen)
  const kneeY    = r1(crY + legLen * 0.52)

  // ── Torso ──
  const torso = [
    `M ${cx+nHW},${nY}`,
    `C ${cx+nHW+8},${nY+5}   ${cx+shHW},${shY-6}     ${cx+shHW},${shY}`,
    `C ${cx+shHW+4},${shY+22} ${cx+bHW},${bustY-14}  ${cx+bHW},${bustY}`,
    `C ${cx+bHW},${bustY+28}  ${cx+wHW+7},${waistY-24} ${cx+wHW},${waistY}`,
    `C ${cx+wHW},${waistY+18} ${cx+hHW-2},${hipY-20}  ${cx+hHW},${hipY}`,
    `C ${cx+hHW},${hipY+12}   ${cx+22},${crY}          ${cx+16},${crY}`,
    `L ${cx-16},${crY}`,
    `C ${cx-22},${crY}          ${cx-hHW},${hipY+12}   ${cx-hHW},${hipY}`,
    `C ${cx-hHW+2},${hipY-20}  ${cx-wHW},${waistY+18}  ${cx-wHW},${waistY}`,
    `C ${cx-wHW-7},${waistY-24} ${cx-bHW},${bustY+28}  ${cx-bHW},${bustY}`,
    `C ${cx-bHW},${bustY-14}   ${cx-shHW-4},${shY+22}  ${cx-shHW},${shY}`,
    `C ${cx-shHW},${shY-6}     ${cx-nHW-8},${nY+5}     ${cx-nHW},${nY}`,
    'Z',
  ].join(' ')

  // ── Arms ──
  const eX = r1(shHW + 14); const eY = r1((shY + waistY) / 2 - 8)
  const wX = r1(shHW + 10); const wYa= r1(waistY - 8); const aW = 9
  const rArm = [
    `M ${cx+shHW-2},${shY}`,
    `C ${cx+eX},${eY-28} ${cx+eX+1},${eY} ${cx+wX},${wYa}`,
    `L ${cx+wX-aW},${wYa}`,
    `C ${cx+eX-aW},${eY} ${cx+eX-aW-1},${eY-28} ${cx+shHW-aW},${shY}`,
    'Z',
  ].join(' ')
  const lArm = [
    `M ${cx-shHW+2},${shY}`,
    `C ${cx-eX},${eY-28} ${cx-eX-1},${eY} ${cx-wX},${wYa}`,
    `L ${cx-wX+aW},${wYa}`,
    `C ${cx-eX+aW},${eY} ${cx-eX+aW+1},${eY-28} ${cx-shHW+aW},${shY}`,
    'Z',
  ].join(' ')

  // ── Legs ──
  const rLeg = [
    `M ${cx+16},${crY}`,
    `C ${cx+19},${crY+35} ${cx+18},${kneeY-20} ${cx+17},${kneeY}`,
    `C ${cx+17},${kneeY+15} ${cx+14},${ankleY-30} ${cx+13},${ankleY}`,
    `L ${cx+2},${ankleY}`,
    `C ${cx+2},${ankleY-30} ${cx+4},${kneeY+15} ${cx+4},${kneeY}`,
    `C ${cx+4},${kneeY-20} ${cx+6},${crY+35} ${cx+6},${crY}`,
    'Z',
  ].join(' ')
  const lLeg = [
    `M ${cx-16},${crY}`,
    `C ${cx-19},${crY+35} ${cx-18},${kneeY-20} ${cx-17},${kneeY}`,
    `C ${cx-17},${kneeY+15} ${cx-14},${ankleY-30} ${cx-13},${ankleY}`,
    `L ${cx-2},${ankleY}`,
    `C ${cx-2},${ankleY-30} ${cx-4},${kneeY+15} ${cx-4},${kneeY}`,
    `C ${cx-4},${kneeY-20} ${cx-6},${crY+35} ${cx-6},${crY}`,
    'Z',
  ].join(' ')

  return {
    torso, rArm, lArm, rLeg, lLeg,
    bustY, waistY, hipY, thighY,
    cx, bHW, wHW, hHW,
    inseamTop: crY, ankleY,
  }
}

// ── Avatar SVG ─────────────────────────────────────────────────────────────
interface AvatarProps {
  bust: number; waist: number; hip: number
  height: number; inseam: number
  hasData: boolean
}

function BodyAvatar({ bust, waist, hip, height, inseam, hasData }: AvatarProps) {
  const p  = useMemo(
    () => buildSilhouette(bust, waist, hip, height, inseam),
    [bust, waist, hip, height, inseam]
  )
  const T  = { transition: 'd 0.4s cubic-bezier(0.34,1.1,0.64,1)' } as React.CSSProperties
  const f  = 'rgba(210,180,140,0.10)'
  const st = 'rgba(210,180,140,0.32)'

  // Measurement line paths (use <path> so they also animate with d-transition)
  const mLine = (y: number, hw: number) =>
    `M ${p.cx - hw - 7},${y} L ${p.cx + hw + 7},${y}`
  const mTick = (y: number, x: number) =>
    `M ${x},${y - 4} L ${x},${y + 4}`

  // Vertical height line (center of body)
  const heightLinePath = `M ${p.cx},28 L ${p.cx},${p.ankleY}`
  // Inseam line (right side of right leg, inner)
  const inseamLinePath = `M ${p.cx + 14},${p.inseamTop} L ${p.cx + 14},${p.ankleY}`

  // Measurement line data
  const mLines = [
    { y: p.bustY,  hw: p.bHW,  color: 'rgba(181,150,90,0.80)', label: hasData ? `${Math.round(bust)}` : '' },
    { y: p.waistY, hw: p.wHW,  color: 'rgba(100,180,130,0.75)', label: hasData ? `${Math.round(waist)}` : '' },
    { y: p.hipY,   hw: p.hHW,  color: 'rgba(181,150,90,0.60)', label: hasData ? `${Math.round(hip)}` : '' },
    { y: p.thighY, hw: p.hHW * 0.70, color: 'rgba(181,150,90,0.35)', label: '' },
  ]

  return (
    <svg
      viewBox="0 0 200 510"
      preserveAspectRatio="xMidYMin meet"
      fill="none"
      aria-hidden="true"
      className="w-full h-full"
    >
      {/* Head */}
      <ellipse cx={p.cx} cy={28} rx={14} ry={20} fill={f} stroke={st} strokeWidth="1" />

      {/* Arms (behind torso) */}
      <path d={p.rArm} fill={f} stroke={st} strokeWidth="0.9" style={T} />
      <path d={p.lArm} fill={f} stroke={st} strokeWidth="0.9" style={T} />

      {/* Torso */}
      <path d={p.torso} fill={f} stroke={st} strokeWidth="1.2" style={T} />

      {/* Legs */}
      <path d={p.rLeg} fill={f} stroke={st} strokeWidth="0.9" style={T} />
      <path d={p.lLeg} fill={f} stroke={st} strokeWidth="0.9" style={T} />

      {/* Vertical height reference line */}
      <path
        d={heightLinePath}
        stroke="rgba(181,150,90,0.18)"
        strokeWidth="0.6"
        strokeDasharray="4 3"
        style={T}
      />

      {/* Inseam reference line */}
      {inseam > 0 && (
        <path
          d={inseamLinePath}
          stroke="rgba(181,150,90,0.25)"
          strokeWidth="0.7"
          strokeDasharray="3 2"
          style={T}
        />
      )}

      {/* Horizontal measurement lines */}
      {mLines.map(({ y, hw, color, label }, i) => (
        <g key={i}>
          <path d={mLine(y, hw)} stroke={color} strokeWidth="0.9" strokeDasharray="3 2" style={T} />
          <path d={mTick(y, p.cx - hw - 7)} stroke={color} strokeWidth="1" style={T} />
          <path d={mTick(y, p.cx + hw + 7)} stroke={color} strokeWidth="1" style={T} />
          {label && (
            <text
              x={p.cx + hw + 12}
              y={y + 3}
              fill={color}
              fontSize="7.5"
              fontFamily="ui-monospace, monospace"
            >
              {label}
            </text>
          )}
        </g>
      ))}

      {/* Height label */}
      {hasData && height > 0 && (
        <text
          x={p.cx + 4}
          y={28}
          fill="rgba(181,150,90,0.40)"
          fontSize="7"
          fontFamily="ui-monospace, monospace"
        >
          {Math.round(height)}cm
        </text>
      )}
    </svg>
  )
}

// ── Form fields ────────────────────────────────────────────────────────────
interface Field {
  key: keyof Measurements
  label: string
  tip: string
  required?: boolean
  min: number
  max: number
}

const FIELDS: Field[] = [
  { key: 'bust_cm',    label: 'Busto',        tip: 'Meça na parte mais larga do peito, passando pelas costas',    required: true, min: 60, max: 130 },
  { key: 'waist_cm',  label: 'Cintura',      tip: 'Parte mais fina do tronco, cerca de 2–3 cm acima do umbigo',              min: 50, max: 120 },
  { key: 'hip_cm',    label: 'Quadril',      tip: 'Parte mais larga dos quadris, fita paralela ao chão',                     min: 70, max: 140 },
  { key: 'height_cm', label: 'Altura',       tip: 'Sem sapatos, encostada em uma parede',                         required: true, min: 140, max: 200 },
  { key: 'inseam_cm', label: 'Entrepernas',  tip: 'Da virilha até o tornozelo, ao longo da perna interna',                   min: 55,  max: 100 },
]

// ── Component ──────────────────────────────────────────────────────────────
interface Props {
  initial?: Partial<Measurements>
  onComplete: (measurements: Partial<Measurements>) => void
  onSkip: () => void
}

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

  // Parse values for the avatar — fall back to Brazilian reference when empty
  const bust   = parseFloat(values.bust_cm)    || REF.bust
  const waist  = parseFloat(values.waist_cm)   || REF.waist
  const hip    = parseFloat(values.hip_cm)     || REF.hip
  const height = parseFloat(values.height_cm)  || REF.height
  const inseam = parseFloat(values.inseam_cm)  || REF.inseam

  // True when user has typed at least one value
  const hasData = FIELDS.some(f => values[f.key] && values[f.key].trim() !== '')

  const size = useMemo(
    () => classifySize(bust, waist, hip),
    [bust, waist, hip]
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const measurements: Partial<Measurements> = {}
    FIELDS.forEach(({ key }) => {
      const raw = values[key]
      if (raw && raw.trim()) {
        const n = parseFloat(raw)
        if (!isNaN(n) && n > 0) (measurements as Record<string, number>)[key] = n
      }
    })
    onComplete(measurements)
  }

  return (
    <div>
      <h2 className="text-offwhite text-xl font-light mb-1">Suas medidas</h2>
      <p className="text-offwhite/40 text-sm mb-6 leading-relaxed">
        Todas as medidas em centímetros. Cada campo tem uma dica de como medir.
      </p>

      {/* ── Two-column layout: avatar left, form right ── */}
      <div className="flex gap-5 md:gap-8 items-start">

        {/* ── Body avatar column ── */}
        <div className="flex-shrink-0 w-[88px] sm:w-[110px] md:w-[130px] space-y-2">
          <div className="w-full" style={{ aspectRatio: '200 / 510' }}>
            <BodyAvatar
              bust={bust} waist={waist} hip={hip}
              height={height} inseam={inseam}
              hasData={hasData}
            />
          </div>

          {/* Live size + readout */}
          <div className="border border-gold/15 bg-gold/5 py-2 px-1 text-center">
            <p className="text-offwhite/30 text-[9px] tracking-widest uppercase mb-0.5">
              {hasData ? 'Estimativa' : 'Referência BR'}
            </p>
            <p
              className="text-gold font-light tracking-[0.25em] transition-all duration-300"
              style={{ fontSize: '1.4rem', lineHeight: 1.1 }}
            >
              {size}
            </p>
          </div>

          {/* Measurement legend */}
          <div className="space-y-1 pt-1">
            {[
              { label: 'Busto',   color: 'bg-gold/60' },
              { label: 'Cintura', color: 'bg-emerald-400/50' },
              { label: 'Quadril', color: 'bg-gold/38' },
            ].map(({ label, color }) => (
              <div key={label} className="flex items-center gap-1.5">
                <span className={`inline-block w-3 h-px ${color} flex-shrink-0`} />
                <span className="text-offwhite/22 text-[9px]">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Form column ── */}
        <form onSubmit={handleSubmit} className="flex-1 min-w-0 space-y-4">
          {FIELDS.map(({ key, label, tip, required }) => (
            <div key={key}>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor={`meas-${key}`}
                  className="text-offwhite/50 text-xs tracking-widest uppercase"
                >
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
                  id={`meas-${key}`}
                  type="number"
                  value={values[key] ?? ''}
                  onChange={e => setValues(v => ({ ...v, [key]: e.target.value }))}
                  placeholder="—"
                  min={1}
                  max={300}
                  className="w-full bg-offwhite/5 border border-gold/20 text-offwhite
                    placeholder-offwhite/20 px-4 py-3 text-sm focus:outline-none
                    focus:border-gold/60 transition-colors pr-12"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-offwhite/25 text-xs">cm</span>
              </div>
            </div>
          ))}

          <div className="pt-4 flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              className="flex-1 bg-gold text-primary py-3.5 text-xs tracking-[0.2em] uppercase
                hover:bg-gold/90 transition-colors"
            >
              Continuar
            </button>
            <button
              type="button"
              onClick={onSkip}
              className="flex-1 border border-gold/20 text-offwhite/40 py-3.5 text-xs
                tracking-widest uppercase hover:text-offwhite hover:border-gold/40 transition-colors"
            >
              Pular esta etapa
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
