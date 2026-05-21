'use client'

import { useState, useMemo } from 'react'
import { Measurements, ShapeAnswers } from '@/lib/size-guide/types'

// ── Types ──────────────────────────────────────────────────────────────────
type Biotype  = 'hourglass' | 'rectangle'
type FlowMode = 'manual' | 'slider'
type SizeName = 'PP' | 'P' | 'M' | 'G' | 'GG' | 'XG'

interface SizeAvatarProps {
  initial?: Partial<Measurements>
  onComplete: (measurements: Partial<Measurements>, shapeAnswers?: Partial<ShapeAnswers>) => void
  onSkip: () => void
}

// ── Brazilian anchors (IBGE / SENAI urban São Paulo reference) ──────────────
const REF = { bust: 92, waist: 74, hip: 99, height: 162 } as const

const SIZE_BANDS: {
  size: SizeName
  bust: [number, number]
  waist: [number, number]
  hip: [number, number]
}[] = [
  { size: 'PP', bust: [82,  86],  waist: [64, 68], hip: [90,  94]  },
  { size: 'P',  bust: [88,  92],  waist: [70, 74], hip: [96,  100] },
  { size: 'M',  bust: [94,  98],  waist: [76, 80], hip: [102, 106] },
  { size: 'G',  bust: [100, 104], waist: [82, 86], hip: [108, 112] },
  { size: 'GG', bust: [106, 110], waist: [88, 92], hip: [114, 118] },
  { size: 'XG', bust: [112, 116], waist: [94, 98], hip: [120, 124] },
]

function classifySize(bust: number, waist: number, hip: number, biotype: Biotype): SizeName {
  const adjW = biotype === 'hourglass' ? waist + 4 : waist
  let best: SizeName = 'M', bestScore = Infinity
  for (const b of SIZE_BANDS) {
    const s = Math.abs(bust - (b.bust[0]  + b.bust[1])  / 2)
            + Math.abs(adjW - (b.waist[0] + b.waist[1]) / 2)
            + Math.abs(hip  - (b.hip[0]   + b.hip[1])   / 2)
    if (s < bestScore) { bestScore = s; best = b.size }
  }
  return best
}

// ── Parametric silhouette paths ─────────────────────────────────────────────
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v))
const r1 = (n: number) => Math.round(n * 10) / 10

interface SilhouettePaths {
  torso: string; rArm: string; lArm: string; rLeg: string; lLeg: string
  bustY: number; waistY: number; hipY: number
  cx: number; bHW: number; wHW: number; hHW: number
}

function buildSilhouette(
  bust: number, waist: number, hip: number, heightCm: number
): SilhouettePaths {
  const cx  = 100
  const b   = clamp(bust,     76, 120)
  const w   = clamp(waist,    58, 104)
  const h   = clamp(hip,      84, 128)
  const hc  = clamp(heightCm, 145, 185)

  // Half-widths in SVG units — tuned so (92 / 74 / 99) looks natural in 200px viewBox
  const bHW  = r1(b * 0.435)   // 92 → 40.0, max ≈ 52
  const wHW  = r1(w * 0.370)   // 74 → 27.4, max ≈ 38
  const hHW  = r1(h * 0.440)   // 99 → 43.6, max ≈ 56
  const shHW = r1(bHW * 0.86)  // shoulder ≈ 0.74 × bust
  const nHW  = 9

  // Fixed vertical skeleton — only leg length scales with height
  const nY    = 48
  const shY   = 68
  const bustY = 122
  const waistY= 190
  const hipY  = 240
  const crY   = 270
  const legLen= r1(190 * (hc / 162))
  const ankleY= r1(crY + legLen)
  const kneeY = r1(crY + legLen * 0.52)

  // ── Torso (single closed path, right→crotch→left↑) ──
  const torso = [
    `M ${cx+nHW},${nY}`,
    `C ${cx+nHW+8},${nY+5} ${cx+shHW},${shY-6} ${cx+shHW},${shY}`,
    `C ${cx+shHW+4},${shY+22} ${cx+bHW},${bustY-14} ${cx+bHW},${bustY}`,
    `C ${cx+bHW},${bustY+28} ${cx+wHW+7},${waistY-24} ${cx+wHW},${waistY}`,
    `C ${cx+wHW},${waistY+18} ${cx+hHW-2},${hipY-20} ${cx+hHW},${hipY}`,
    `C ${cx+hHW},${hipY+12} ${cx+22},${crY} ${cx+16},${crY}`,
    `L ${cx-16},${crY}`,
    `C ${cx-22},${crY} ${cx-hHW},${hipY+12} ${cx-hHW},${hipY}`,
    `C ${cx-hHW+2},${hipY-20} ${cx-wHW},${waistY+18} ${cx-wHW},${waistY}`,
    `C ${cx-wHW-7},${waistY-24} ${cx-bHW},${bustY+28} ${cx-bHW},${bustY}`,
    `C ${cx-bHW},${bustY-14} ${cx-shHW-4},${shY+22} ${cx-shHW},${shY}`,
    `C ${cx-shHW},${shY-6} ${cx-nHW-8},${nY+5} ${cx-nHW},${nY}`,
    'Z',
  ].join(' ')

  // ── Arms (shoulder to wrist level) ──
  const eX = r1(shHW + 14)
  const eY = r1((shY + waistY) / 2 - 8)
  const wX = r1(shHW + 10)
  const wYa= r1(waistY - 8)
  const aW = 9

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

  return { torso, rArm, lArm, rLeg, lLeg, bustY, waistY, hipY, cx, bHW, wHW, hHW }
}

// ── Biotype icon SVGs ───────────────────────────────────────────────────────
function HourglassIcon({ active }: { active: boolean }) {
  const c = active ? 'rgba(181,150,90,0.9)' : 'rgba(255,255,255,0.2)'
  return (
    <svg width="20" height="34" viewBox="0 0 20 34" fill="none" aria-hidden="true">
      <path d="M1 1 Q10 1 19 1 Q14 9 10 17 Q14 25 19 33 Q10 33 1 33 Q6 25 10 17 Q6 9 1 1 Z"
        fill={c} />
    </svg>
  )
}

function RectangleIcon({ active }: { active: boolean }) {
  const c = active ? 'rgba(181,150,90,0.9)' : 'rgba(255,255,255,0.2)'
  return (
    <svg width="16" height="34" viewBox="0 0 16 34" fill="none" aria-hidden="true">
      <path d="M1 1 Q3 1 15 2 Q14 9 14 17 Q14 25 15 32 Q12 33 1 33 Q2 25 2 17 Q2 9 1 2 Z"
        fill={c} />
    </svg>
  )
}

// ── Parametric avatar SVG component ────────────────────────────────────────
interface AvatarSVGProps {
  bust: number; waist: number; hip: number; height: number
}

function AvatarSVG({ bust, waist, hip, height }: AvatarSVGProps) {
  const p = useMemo(
    () => buildSilhouette(bust, waist, hip, height),
    [bust, waist, hip, height]
  )

  const fill   = 'rgba(181,150,90,0.07)'
  const stroke = 'rgba(181,150,90,0.38)'
  const T      = { transition: 'd 0.35s cubic-bezier(0.34,1.1,0.64,1)' } as React.CSSProperties

  // Measurement line paths (use <path> so 'd' transitions work)
  const bustLine  = `M ${p.cx-p.bHW-7},${p.bustY}  L ${p.cx+p.bHW+7},${p.bustY}`
  const bustTick1 = `M ${p.cx-p.bHW-7},${p.bustY-4}  L ${p.cx-p.bHW-7},${p.bustY+4}`
  const bustTick2 = `M ${p.cx+p.bHW+7},${p.bustY-4}  L ${p.cx+p.bHW+7},${p.bustY+4}`

  const waistLine  = `M ${p.cx-p.wHW-7},${p.waistY} L ${p.cx+p.wHW+7},${p.waistY}`
  const waistTick1 = `M ${p.cx-p.wHW-7},${p.waistY-4} L ${p.cx-p.wHW-7},${p.waistY+4}`
  const waistTick2 = `M ${p.cx+p.wHW+7},${p.waistY-4} L ${p.cx+p.wHW+7},${p.waistY+4}`

  const hipLine  = `M ${p.cx-p.hHW-7},${p.hipY}  L ${p.cx+p.hHW+7},${p.hipY}`
  const hipTick1 = `M ${p.cx-p.hHW-7},${p.hipY-4}  L ${p.cx-p.hHW-7},${p.hipY+4}`
  const hipTick2 = `M ${p.cx+p.hHW+7},${p.hipY-4}  L ${p.cx+p.hHW+7},${p.hipY+4}`

  return (
    <svg viewBox="0 0 200 510" preserveAspectRatio="xMidYMin meet"
      fill="none" aria-hidden="true" className="w-full h-full">

      {/* Head */}
      <ellipse cx={p.cx} cy={28} rx={14} ry={20}
        fill={fill} stroke={stroke} strokeWidth="1" />

      {/* Neck */}
      <path d={`M ${p.cx-8},48 L ${p.cx-8},50 L ${p.cx+8},50 L ${p.cx+8},48`}
        fill={fill} stroke={stroke} strokeWidth="0.8" />

      {/* Arms (render behind torso) */}
      <path d={p.rArm} fill={fill} stroke={stroke} strokeWidth="0.9" style={T} />
      <path d={p.lArm} fill={fill} stroke={stroke} strokeWidth="0.9" style={T} />

      {/* Torso */}
      <path d={p.torso} fill={fill} stroke={stroke} strokeWidth="1.2" style={T} />

      {/* Legs */}
      <path d={p.rLeg} fill={fill} stroke={stroke} strokeWidth="0.9" style={T} />
      <path d={p.lLeg} fill={fill} stroke={stroke} strokeWidth="0.9" style={T} />

      {/* ── Bust measurement line (gold) ── */}
      <path d={bustLine}  stroke="rgba(181,150,90,0.70)" strokeWidth="0.8" strokeDasharray="3 2" style={T} />
      <path d={bustTick1} stroke="rgba(181,150,90,0.70)" strokeWidth="0.9" style={T} />
      <path d={bustTick2} stroke="rgba(181,150,90,0.70)" strokeWidth="0.9" style={T} />

      {/* ── Waist measurement line (sage green) ── */}
      <path d={waistLine}  stroke="rgba(100,180,130,0.65)" strokeWidth="0.8" strokeDasharray="3 2" style={T} />
      <path d={waistTick1} stroke="rgba(100,180,130,0.65)" strokeWidth="0.9" style={T} />
      <path d={waistTick2} stroke="rgba(100,180,130,0.65)" strokeWidth="0.9" style={T} />

      {/* ── Hip measurement line (dimmer gold) ── */}
      <path d={hipLine}  stroke="rgba(181,150,90,0.50)" strokeWidth="0.8" strokeDasharray="3 2" style={T} />
      <path d={hipTick1} stroke="rgba(181,150,90,0.50)" strokeWidth="0.9" style={T} />
      <path d={hipTick2} stroke="rgba(181,150,90,0.50)" strokeWidth="0.9" style={T} />
    </svg>
  )
}

// ── Slider input component ──────────────────────────────────────────────────
interface SliderProps {
  id: string; label: string; value: number
  min: number; max: number; step?: number
  color?: string
  onChange: (v: number) => void
}

function MeasurementSlider({ id, label, value, min, max, step = 1, color = 'text-gold', onChange }: SliderProps) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <label htmlFor={id} className="text-offwhite/50 text-xs tracking-widest uppercase">
          {label}
        </label>
        <span className={`${color} text-sm tabular-nums font-light`}>
          {value} <span className="text-offwhite/30 text-xs">cm</span>
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={min} max={max} step={step}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        aria-label={label}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        className="w-full h-1 appearance-none bg-offwhite/10 rounded-none outline-none cursor-pointer
          [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
          [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gold
          [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-primary
          [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-none
          [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full
          [&::-moz-range-thumb]:bg-gold [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-primary
          [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:appearance-none"
      />
      <div className="flex justify-between mt-1">
        <span className="text-offwhite/20 text-[10px]">{min}</span>
        <span className="text-offwhite/20 text-[10px]">{max}</span>
      </div>
    </div>
  )
}

// ── Number input component ──────────────────────────────────────────────────
interface NumberFieldProps {
  id: string; label: string; value: string; required?: boolean
  min: number; max: number; tip?: string
  isValid: boolean
  onChange: (v: string) => void
}

function NumberField({ id, label, value, required, min, max, tip, isValid, onChange }: NumberFieldProps) {
  const [showTip, setShowTip] = useState(false)
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label htmlFor={id} className="text-offwhite/50 text-xs tracking-widest uppercase">
          {label}{required && <span className="text-gold/60 ml-1">*</span>}
        </label>
        {tip && (
          <button type="button" onClick={() => setShowTip(v => !v)}
            className="text-gold/40 text-xs hover:text-gold transition-colors">
            Como medir?
          </button>
        )}
      </div>
      {showTip && tip && (
        <p className="text-offwhite/30 text-xs mb-2 leading-relaxed border-l border-gold/20 pl-3">{tip}</p>
      )}
      <div className="relative">
        <input
          id={id} type="number" value={value} min={min} max={max}
          placeholder="—"
          onChange={e => onChange(e.target.value)}
          aria-label={label}
          aria-invalid={!isValid}
          className={`w-full bg-offwhite/5 border text-offwhite placeholder-offwhite/20 px-4 py-3 text-sm pr-12
            focus:outline-none transition-colors
            ${!isValid && value !== '' ? 'border-red-500/40 focus:border-red-400/60' : 'border-gold/20 focus:border-gold/60'}`}
        />
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-offwhite/25 text-xs">cm</span>
      </div>
      {!isValid && value !== '' && (
        <p className="text-red-400/70 text-[10px] mt-1">{min}–{max} cm</p>
      )}
    </div>
  )
}

// ── Main component ──────────────────────────────────────────────────────────
export default function SizeAvatar({ initial, onComplete, onSkip }: SizeAvatarProps) {
  const [flow,    setFlow]    = useState<FlowMode>('manual')
  const [biotype, setBiotype] = useState<Biotype>('rectangle')

  // ── Manual flow state ──
  const [mBust,   setMBust]   = useState(initial?.bust_cm?.toString()   ?? '')
  const [mWaist,  setMWaist]  = useState(initial?.waist_cm?.toString()  ?? '')
  const [mHip,    setMHip]    = useState(initial?.hip_cm?.toString()    ?? '')
  const [mHeight, setMHeight] = useState(initial?.height_cm?.toString() ?? '')

  // ── Slider flow state (defaults = Brazilian reference) ──
  const [sBust,   setSBust]   = useState(initial?.bust_cm   ?? REF.bust)
  const [sWaist,  setSWaist]  = useState(initial?.waist_cm  ?? REF.waist)
  const [sHip,    setSHip]    = useState(initial?.hip_cm    ?? REF.hip)
  const [sHeight, setSHeight] = useState(initial?.height_cm ?? REF.height)

  // ── Resolved measurements driving the avatar ──
  const currentBust   = flow === 'manual' ? (parseFloat(mBust)   || REF.bust)   : sBust
  const currentWaist  = flow === 'manual' ? (parseFloat(mWaist)  || REF.waist)  : sWaist
  const currentHip    = flow === 'manual' ? (parseFloat(mHip)    || REF.hip)    : sHip
  const currentHeight = flow === 'manual' ? (parseFloat(mHeight) || REF.height) : sHeight

  const size = useMemo(
    () => classifySize(currentBust, currentWaist, currentHip, biotype),
    [currentBust, currentWaist, currentHip, biotype]
  )

  // ── Validation (manual flow only) ──
  const bustNum   = parseFloat(mBust)
  const waistNum  = parseFloat(mWaist)
  const hipNum    = parseFloat(mHip)
  const heightNum = parseFloat(mHeight)

  const bustOk   = mBust   === '' || (bustNum   >= 76  && bustNum   <= 120)
  const waistOk  = mWaist  === '' || (waistNum  >= 58  && waistNum  <= 104)
  const hipOk    = mHip    === '' || (hipNum    >= 84  && hipNum    <= 128)
  const heightOk = mHeight === '' || (heightNum >= 145 && heightNum <= 185)

  const canSave = flow === 'slider'
    || ((mBust !== '' || mWaist !== '' || mHip !== '') && bustOk && waistOk && hipOk && heightOk)

  // ── Save ──
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()

    const measurements: Partial<Measurements> = {
      sources: [flow === 'manual' ? 'manual' : 'scan'],
      lastUpdated: new Date().toISOString(),
    }

    if (flow === 'manual') {
      if (!isNaN(bustNum)   && bustOk)   measurements.bust_cm   = bustNum
      if (!isNaN(waistNum)  && waistOk)  measurements.waist_cm  = waistNum
      if (!isNaN(hipNum)    && hipOk)    measurements.hip_cm    = hipNum
      if (!isNaN(heightNum) && heightOk) measurements.height_cm = heightNum
    } else {
      measurements.bust_cm   = sBust
      measurements.waist_cm  = sWaist
      measurements.hip_cm    = sHip
      measurements.height_cm = sHeight
    }

    const shapeAnswers: Partial<ShapeAnswers> = {
      silhouette: biotype === 'hourglass' ? 'curvy_waist' : 'straight',
      waistDefinition: biotype === 'hourglass' ? 'very_defined' : 'straight',
    }

    onComplete(measurements, shapeAnswers)
  }

  return (
    <form onSubmit={handleSave} noValidate>
      <div className="space-y-5">

        {/* ── Flow toggle ── */}
        <div className="flex bg-offwhite/5 p-0.5 gap-0.5" role="group" aria-label="Modo de entrada">
          {(['manual', 'slider'] as FlowMode[]).map(f => (
            <button
              key={f} type="button"
              onClick={() => setFlow(f)}
              aria-pressed={flow === f}
              className={`flex-1 py-2.5 text-xs tracking-widest uppercase transition-colors ${
                flow === f
                  ? 'bg-gold text-primary font-medium'
                  : 'text-offwhite/35 hover:text-offwhite/60'
              }`}
            >
              {f === 'manual' ? 'Tenho minhas medidas' : 'Ajustar avatar'}
            </button>
          ))}
        </div>

        {/* ── Biotype selector ── */}
        <div>
          <p className="text-offwhite/40 text-xs tracking-widest uppercase mb-2.5">Biotipo</p>
          <div className="flex gap-3" role="group" aria-label="Biotipo">
            {([
              { key: 'rectangle', label: 'Retângulo', hint: 'Ombros, cintura e quadril similares' },
              { key: 'hourglass', label: 'Ampulheta', hint: 'Quadril/busto largos, cintura definida' },
            ] as { key: Biotype; label: string; hint: string }[]).map(({ key, label, hint }) => (
              <button
                key={key} type="button"
                onClick={() => setBiotype(key)}
                aria-pressed={biotype === key}
                title={hint}
                className={`flex-1 flex flex-col items-center gap-2 py-3 border transition-colors ${
                  biotype === key
                    ? 'border-gold/50 bg-gold/8 text-gold'
                    : 'border-gold/12 text-offwhite/25 hover:border-gold/25 hover:text-offwhite/45'
                }`}
              >
                {key === 'hourglass'
                  ? <HourglassIcon  active={biotype === 'hourglass'} />
                  : <RectangleIcon  active={biotype === 'rectangle'} />
                }
                <span className="text-[11px] tracking-wide uppercase">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Avatar + controls ── */}
        <div className="flex gap-4 sm:gap-6 items-start">

          {/* Avatar column */}
          <div className="flex-shrink-0 w-[96px] sm:w-[120px] space-y-3">
            <div className="w-full" style={{ aspectRatio: '200/510' }}>
              <AvatarSVG
                bust={currentBust}
                waist={currentWaist}
                hip={currentHip}
                height={currentHeight}
              />
            </div>

            {/* Measurement legend */}
            <div className="space-y-1">
              {[
                { label: 'Busto',   color: 'bg-gold/60' },
                { label: 'Cintura', color: 'bg-emerald-400/50' },
                { label: 'Quadril', color: 'bg-gold/35' },
              ].map(({ label, color }) => (
                <div key={label} className="flex items-center gap-1.5">
                  <span className={`inline-block w-3.5 h-px ${color}`} />
                  <span className="text-offwhite/25 text-[10px]">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Controls column */}
          <div className="flex-1 min-w-0 space-y-4">

            {/* Size readout */}
            <div className="border border-gold/15 bg-gold/5 p-3 text-center">
              <p className="text-offwhite/30 text-[10px] tracking-widest uppercase mb-0.5">
                Tamanho estimado
              </p>
              <p
                className="text-gold font-light tracking-[0.3em] transition-all duration-300"
                style={{ fontSize: '2rem', lineHeight: 1.1 }}
              >
                {size}
              </p>
              <div className="flex justify-center gap-2 mt-1.5 text-offwhite/30 text-[10px] tabular-nums">
                <span>B {Math.round(currentBust)}</span>
                <span className="text-offwhite/15">·</span>
                <span>C {Math.round(currentWaist)}</span>
                <span className="text-offwhite/15">·</span>
                <span>Q {Math.round(currentHip)}</span>
              </div>
            </div>

            {/* Flow A — manual inputs */}
            {flow === 'manual' && (
              <div className="space-y-3">
                <NumberField
                  id="sa-bust" label="Busto" required value={mBust}
                  min={76} max={120} isValid={bustOk}
                  tip="Meça na parte mais larga do peito, passando pelas costas"
                  onChange={setMBust}
                />
                <NumberField
                  id="sa-waist" label="Cintura" value={mWaist}
                  min={58} max={104} isValid={waistOk}
                  tip="Parte mais fina do tronco, 2–3 cm acima do umbigo"
                  onChange={setMWaist}
                />
                <NumberField
                  id="sa-hip" label="Quadril" value={mHip}
                  min={84} max={128} isValid={hipOk}
                  tip="Parte mais larga dos quadris, fita paralela ao chão"
                  onChange={setMHip}
                />
                <NumberField
                  id="sa-height" label="Altura" required value={mHeight}
                  min={145} max={185} isValid={heightOk}
                  tip="Sem sapatos, encostada em uma parede"
                  onChange={setMHeight}
                />
              </div>
            )}

            {/* Flow B — sliders */}
            {flow === 'slider' && (
              <div className="space-y-4">
                <MeasurementSlider
                  id="sl-bust" label="Busto"
                  value={sBust} min={76} max={120}
                  onChange={setSBust}
                />
                <MeasurementSlider
                  id="sl-waist" label="Cintura"
                  value={sWaist} min={58} max={104}
                  color="text-emerald-400/80"
                  onChange={setSWaist}
                />
                <MeasurementSlider
                  id="sl-hip" label="Quadril"
                  value={sHip} min={84} max={128}
                  onChange={setSHip}
                />
                <MeasurementSlider
                  id="sl-height" label="Altura"
                  value={sHeight} min={145} max={185}
                  color="text-offwhite/50"
                  onChange={setSHeight}
                />
                <p className="text-offwhite/20 text-[10px] leading-relaxed">
                  Arraste os sliders para ajustar o avatar. Os valores serão salvos como medidas estimadas.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ── Size band reference ── */}
        <div className="border border-gold/8 overflow-x-auto">
          <table className="w-full text-[10px] text-offwhite/30" style={{ minWidth: 280 }}>
            <thead>
              <tr className="border-b border-gold/8">
                <th className="text-left px-3 py-2 text-offwhite/20 tracking-widest uppercase font-normal">Tam.</th>
                <th className="px-2 py-2 tracking-widest uppercase font-normal">Busto</th>
                <th className="px-2 py-2 tracking-widest uppercase font-normal">Cintura</th>
                <th className="px-2 py-2 tracking-widest uppercase font-normal">Quadril</th>
              </tr>
            </thead>
            <tbody>
              {SIZE_BANDS.map(b => (
                <tr
                  key={b.size}
                  className={`border-b border-gold/5 transition-colors ${
                    b.size === size ? 'bg-gold/8 text-gold/80' : ''
                  }`}
                >
                  <td className={`px-3 py-1.5 font-medium ${b.size === size ? 'text-gold' : ''}`}>
                    {b.size}
                    {b.size === size && <span className="ml-1 text-gold/50">←</span>}
                  </td>
                  <td className="px-2 py-1.5 text-center tabular-nums">{b.bust[0]}–{b.bust[1]}</td>
                  <td className="px-2 py-1.5 text-center tabular-nums">{b.waist[0]}–{b.waist[1]}</td>
                  <td className="px-2 py-1.5 text-center tabular-nums">{b.hip[0]}–{b.hip[1]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── Validation hint ── */}
        {flow === 'manual' && !canSave && (
          <p className="text-offwhite/25 text-xs text-center">
            Preencha pelo menos busto, cintura ou quadril para continuar
          </p>
        )}

        {/* ── Action buttons ── */}
        <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
          <button
            type="submit"
            disabled={!canSave}
            className="flex-1 bg-gold text-primary py-3.5 text-xs tracking-[0.2em] uppercase
              hover:bg-gold/90 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Salvar perfil
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

      </div>
    </form>
  )
}

/*
Usage example (in SizeGuideFlow or any parent):

import SizeAvatar from '@/components/size-guide/SizeAvatar'
import { Measurements, ShapeAnswers } from '@/lib/size-guide/types'

function MyPage() {
  const handleComplete = (
    measurements: Partial<Measurements>,
    shapeAnswers?: Partial<ShapeAnswers>
  ) => {
    console.log('measurements', measurements)
    console.log('shapeAnswers', shapeAnswers)
    // persist to Supabase / localStorage via storage.ts
  }

  return (
    <SizeAvatar
      initial={{ bust_cm: 92, waist_cm: 74, hip_cm: 99, height_cm: 162 }}
      onComplete={handleComplete}
      onSkip={() => console.log('skipped')}
    />
  )
}
*/
