'use client'

import { useState, useMemo } from 'react'
import { Measurements } from '@/lib/size-guide/types'

// ── Size classification ────────────────────────────────────────────────────
type SizeName = 'PP' | 'P' | 'M' | 'G' | 'GG' | 'XG'

const SIZE_BANDS: { size: SizeName; bust:[number,number]; waist:[number,number]; hip:[number,number] }[] = [
  { size: 'PP', bust:[82, 86],  waist:[64,68], hip:[90, 94]  },
  { size: 'P',  bust:[88, 92],  waist:[70,74], hip:[96, 100] },
  { size: 'M',  bust:[94, 98],  waist:[76,80], hip:[102,106] },
  { size: 'G',  bust:[100,104], waist:[82,86], hip:[108,112] },
  { size: 'GG', bust:[106,110], waist:[88,92], hip:[114,118] },
  { size: 'XG', bust:[112,116], waist:[94,98], hip:[120,124] },
]

function classifySize(bust: number, waist: number, hip: number): SizeName {
  let best: SizeName = 'M', bestScore = Infinity
  for (const b of SIZE_BANDS) {
    const s = Math.abs(bust  - (b.bust[0]  + b.bust[1])  / 2)
            + Math.abs(waist - (b.waist[0] + b.waist[1]) / 2)
            + Math.abs(hip   - (b.hip[0]   + b.hip[1])   / 2)
    if (s < bestScore) { bestScore = s; best = b.size }
  }
  return best
}

// ── Helpers ────────────────────────────────────────────────────────────────
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v))
const r1    = (n: number) => Math.round(n * 10) / 10

const REF = { bust: 92, waist: 74, hip: 99, height: 162, inseam: 76 }

// ── Parametric silhouette ──────────────────────────────────────────────────
interface Paths {
  torso: string; rArm: string; lArm: string; rLeg: string; lLeg: string
  bustY: number; waistY: number; hipY: number; thighY: number
  cx: number; bHW: number; wHW: number; hHW: number
  crY: number; ankleY: number; headCY: number
}

function buildSilhouette(
  bust: number, waist: number, hip: number, heightCm: number
): Paths {
  const cx = 100
  const b  = clamp(bust,     76, 120)
  const w  = clamp(waist,    58, 104)
  const h  = clamp(hip,      84, 128)
  const hc = clamp(heightCm, 145, 185)

  const bHW  = r1(b * 0.435)
  const wHW  = r1(w * 0.370)
  const hHW  = r1(h * 0.440)
  const shHW = r1(bHW * 0.86)
  const nHW  = 9

  const headCY = 28
  const nY     = 48; const shY = 68
  const bustY  = 122; const waistY = 190
  const hipY   = 240; const crY   = 270
  const thighY = r1(crY + 38)

  const legLen = r1(190 * (hc / 162))
  const ankleY = r1(crY + legLen)
  const kneeY  = r1(crY + legLen * 0.52)

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

  const eX = r1(shHW+14); const eY = r1((shY+waistY)/2-8)
  const wX = r1(shHW+10); const wYa= r1(waistY-8); const aW = 9
  const rArm = [`M ${cx+shHW-2},${shY}`,`C ${cx+eX},${eY-28} ${cx+eX+1},${eY} ${cx+wX},${wYa}`,`L ${cx+wX-aW},${wYa}`,`C ${cx+eX-aW},${eY} ${cx+eX-aW-1},${eY-28} ${cx+shHW-aW},${shY}`,'Z'].join(' ')
  const lArm = [`M ${cx-shHW+2},${shY}`,`C ${cx-eX},${eY-28} ${cx-eX-1},${eY} ${cx-wX},${wYa}`,`L ${cx-wX+aW},${wYa}`,`C ${cx-eX+aW},${eY} ${cx-eX+aW+1},${eY-28} ${cx-shHW+aW},${shY}`,'Z'].join(' ')
  const rLeg = [`M ${cx+16},${crY}`,`C ${cx+19},${crY+35} ${cx+18},${kneeY-20} ${cx+17},${kneeY}`,`C ${cx+17},${kneeY+15} ${cx+14},${ankleY-30} ${cx+13},${ankleY}`,`L ${cx+2},${ankleY}`,`C ${cx+2},${ankleY-30} ${cx+4},${kneeY+15} ${cx+4},${kneeY}`,`C ${cx+4},${kneeY-20} ${cx+6},${crY+35} ${cx+6},${crY}`,'Z'].join(' ')
  const lLeg = [`M ${cx-16},${crY}`,`C ${cx-19},${crY+35} ${cx-18},${kneeY-20} ${cx-17},${kneeY}`,`C ${cx-17},${kneeY+15} ${cx-14},${ankleY-30} ${cx-13},${ankleY}`,`L ${cx-2},${ankleY}`,`C ${cx-2},${ankleY-30} ${cx-4},${kneeY+15} ${cx-4},${kneeY}`,`C ${cx-4},${kneeY-20} ${cx-6},${crY+35} ${cx-6},${crY}`,'Z'].join(' ')

  return { torso, rArm, lArm, rLeg, lLeg, bustY, waistY, hipY, thighY, cx, bHW, wHW, hHW, crY, ankleY, headCY }
}

// ── Avatar SVG with draggable measurement lines ────────────────────────────
interface AvatarProps {
  bust: number; waist: number; hip: number
  height: number; inseam: number
  activeDrag: string | null
  onDragStart: (
    e: React.PointerEvent<SVGCircleElement | SVGLineElement>,
    key: string, value: number, axis: 'x' | 'y', sign: number, sens: number
  ) => void
}

function BodyAvatar({ bust, waist, hip, height, inseam, activeDrag, onDragStart }: AvatarProps) {
  const p = useMemo(() => buildSilhouette(bust, waist, hip, height), [bust, waist, hip, height])
  const T = { transition: 'd 0.3s cubic-bezier(0.34,1.1,0.64,1)' } as React.CSSProperties

  const f  = 'rgba(210,180,140,0.10)'
  const st = 'rgba(210,180,140,0.32)'

  // Measurement line paths (use <path> so 'd' transitions animate them)
  const mPath = (y: number, hw: number) => `M ${p.cx-hw-8},${y} L ${p.cx+hw+8},${y}`
  const tPath = (y: number, x: number) => `M ${x},${y-5} L ${x},${y+5}`

  const lines: { key: string; y: number; hw: number; color: string; dColor: string }[] = [
    { key:'bust_cm',  y:p.bustY,  hw:p.bHW, color:'rgba(181,150,90,0.70)', dColor:'rgba(181,150,90,1)' },
    { key:'waist_cm', y:p.waistY, hw:p.wHW, color:'rgba(100,180,130,0.70)', dColor:'rgba(100,180,130,1)' },
    { key:'hip_cm',   y:p.hipY,   hw:p.hHW, color:'rgba(181,150,90,0.55)', dColor:'rgba(181,150,90,0.9)' },
    { key:'hip_cm',   y:p.thighY, hw:p.hHW*0.70, color:'rgba(181,150,90,0.25)', dColor:'rgba(181,150,90,0.5)' },
  ]

  // Inseam vertical line on right inner leg
  const inseamScale = clamp(inseam, 55, 100) / 76
  const inseamLen   = r1(190 * (clamp(height,145,185)/162))
  const inseamEndY  = r1(p.crY + inseamLen * inseamScale * 0.78)

  return (
    <svg
      viewBox="0 0 200 510"
      preserveAspectRatio="xMidYMin meet"
      fill="none"
      aria-label="Avatar corporal — arraste as linhas para ajustar"
      className="w-full h-full select-none touch-none"
    >
      {/* Body */}
      <ellipse cx={p.cx} cy={p.headCY} rx={14} ry={20} fill={f} stroke={st} strokeWidth="1" />
      <path d={p.rArm}  fill={f} stroke={st} strokeWidth="0.9" style={T} />
      <path d={p.lArm}  fill={f} stroke={st} strokeWidth="0.9" style={T} />
      <path d={p.torso} fill={f} stroke={st} strokeWidth="1.2" style={T} />
      <path d={p.rLeg}  fill={f} stroke={st} strokeWidth="0.9" style={T} />
      <path d={p.lLeg}  fill={f} stroke={st} strokeWidth="0.9" style={T} />

      {/* Height vertical reference */}
      <line x1={p.cx} y1={8} x2={p.cx} y2={p.ankleY}
        stroke="rgba(181,150,90,0.12)" strokeWidth="0.6" strokeDasharray="4 3" />

      {/* Inseam vertical line */}
      <line x1={p.cx+14} y1={p.crY} x2={p.cx+14} y2={inseamEndY}
        stroke={activeDrag==='inseam_cm' ? 'rgba(181,150,90,0.8)' : 'rgba(181,150,90,0.28)'}
        strokeWidth={activeDrag==='inseam_cm' ? 1.2 : 0.8}
        strokeDasharray="3 2"
        style={T}
      />

      {/* Horizontal measurement lines */}
      {lines.map(({ key, y, hw, color, dColor }, i) => {
        const isActive = activeDrag === key
        const c = isActive ? dColor : color
        return (
          <g key={`${key}-${i}`}>
            <path d={mPath(y, hw)} stroke={c} strokeWidth={isActive ? 1.2 : 0.9} strokeDasharray="3 2" style={T} />
            <path d={tPath(y, p.cx-hw-8)} stroke={c} strokeWidth="1.1" style={T} />
            <path d={tPath(y, p.cx+hw+8)} stroke={c} strokeWidth="1.1" style={T} />
          </g>
        )
      })}

      {/* ── Drag handles ── */}
      {/* Bust — drag right/left */}
      <circle cx={p.cx+p.bHW+8} cy={p.bustY} r={7}
        fill={activeDrag==='bust_cm' ? 'rgba(181,150,90,0.95)' : 'rgba(181,150,90,0.55)'}
        className="cursor-ew-resize" style={T as React.CSSProperties}
        onPointerDown={e => onDragStart(e, 'bust_cm', bust, 'x', 1, 0.5)} />
      <circle cx={p.cx-p.bHW-8} cy={p.bustY} r={7}
        fill={activeDrag==='bust_cm' ? 'rgba(181,150,90,0.95)' : 'rgba(181,150,90,0.55)'}
        className="cursor-ew-resize" style={T as React.CSSProperties}
        onPointerDown={e => onDragStart(e, 'bust_cm', bust, 'x', -1, 0.5)} />

      {/* Waist — drag right/left */}
      <circle cx={p.cx+p.wHW+8} cy={p.waistY} r={7}
        fill={activeDrag==='waist_cm' ? 'rgba(100,180,130,0.95)' : 'rgba(100,180,130,0.55)'}
        className="cursor-ew-resize" style={T as React.CSSProperties}
        onPointerDown={e => onDragStart(e, 'waist_cm', waist, 'x', 1, 0.5)} />
      <circle cx={p.cx-p.wHW-8} cy={p.waistY} r={7}
        fill={activeDrag==='waist_cm' ? 'rgba(100,180,130,0.95)' : 'rgba(100,180,130,0.55)'}
        className="cursor-ew-resize" style={T as React.CSSProperties}
        onPointerDown={e => onDragStart(e, 'waist_cm', waist, 'x', -1, 0.5)} />

      {/* Hip — drag right/left */}
      <circle cx={p.cx+p.hHW+8} cy={p.hipY} r={7}
        fill={activeDrag==='hip_cm' ? 'rgba(181,150,90,0.95)' : 'rgba(181,150,90,0.45)'}
        className="cursor-ew-resize" style={T as React.CSSProperties}
        onPointerDown={e => onDragStart(e, 'hip_cm', hip, 'x', 1, 0.5)} />
      <circle cx={p.cx-p.hHW-8} cy={p.hipY} r={7}
        fill={activeDrag==='hip_cm' ? 'rgba(181,150,90,0.95)' : 'rgba(181,150,90,0.45)'}
        className="cursor-ew-resize" style={T as React.CSSProperties}
        onPointerDown={e => onDragStart(e, 'hip_cm', hip, 'x', -1, 0.5)} />

      {/* Height — drag up/down at top of head */}
      <circle cx={p.cx} cy={6} r={7}
        fill={activeDrag==='height_cm' ? 'rgba(181,150,90,0.95)' : 'rgba(181,150,90,0.35)'}
        className="cursor-ns-resize"
        onPointerDown={e => onDragStart(e, 'height_cm', height, 'y', -1, 0.45)} />
      {/* small arrow hint */}
      <text x={p.cx} y={6} textAnchor="middle" dominantBaseline="middle"
        fill="rgba(0,0,0,0.5)" fontSize="6" className="pointer-events-none select-none">↕</text>

      {/* Inseam — drag up/down at ankle */}
      <circle cx={p.cx+14} cy={inseamEndY} r={7}
        fill={activeDrag==='inseam_cm' ? 'rgba(181,150,90,0.95)' : 'rgba(181,150,90,0.30)'}
        className="cursor-ns-resize" style={T as React.CSSProperties}
        onPointerDown={e => onDragStart(e, 'inseam_cm', inseam, 'y', 1, 0.4)} />

      {/* Live value labels while dragging */}
      {activeDrag && lines.find(l => l.key === activeDrag) && (() => {
        const line = lines.find(l => l.key === activeDrag)!
        const val  = activeDrag === 'bust_cm' ? bust : activeDrag === 'waist_cm' ? waist : hip
        return (
          <text x={p.cx+line.hw+18} y={line.y+4}
            fill={line.dColor} fontSize="9" fontFamily="ui-monospace,monospace"
            className="pointer-events-none">
            {Math.round(val)} cm
          </text>
        )
      })()}
      {activeDrag === 'height_cm' && (
        <text x={p.cx+6} y={22} fill="rgba(181,150,90,0.9)" fontSize="8" fontFamily="ui-monospace,monospace"
          className="pointer-events-none">{Math.round(height)} cm</text>
      )}
      {activeDrag === 'inseam_cm' && (
        <text x={p.cx+20} y={inseamEndY+4} fill="rgba(181,150,90,0.9)" fontSize="8" fontFamily="ui-monospace,monospace"
          className="pointer-events-none">{Math.round(inseam)} cm</text>
      )}
    </svg>
  )
}

// ── Form fields ────────────────────────────────────────────────────────────
interface Field {
  key: keyof Measurements; label: string; tip: string; required?: boolean; min: number; max: number
}

const FIELDS: Field[] = [
  { key:'bust_cm',   label:'Busto',       tip:'Meça na parte mais larga do peito, passando pelas costas',   required:true, min:60, max:130 },
  { key:'waist_cm',  label:'Cintura',     tip:'Parte mais fina do tronco, 2–3 cm acima do umbigo',                        min:50, max:120 },
  { key:'hip_cm',    label:'Quadril',     tip:'Parte mais larga dos quadris, fita paralela ao chão',                      min:70, max:140 },
  { key:'height_cm', label:'Altura',      tip:'Sem sapatos, encostada em uma parede',                       required:true, min:140,max:200 },
  { key:'inseam_cm', label:'Entrepernas', tip:'Da virilha até o tornozelo, ao longo da perna interna',                    min:55, max:100 },
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
  const [openTip,   setOpenTip]   = useState<string | null>(null)
  const [activeDrag,setActiveDrag]= useState<string | null>(null)

  // Resolve values — fall back to Brazilian reference when empty
  const bust   = parseFloat(values.bust_cm)   || REF.bust
  const waist  = parseFloat(values.waist_cm)  || REF.waist
  const hip    = parseFloat(values.hip_cm)    || REF.hip
  const height = parseFloat(values.height_cm) || REF.height
  const inseam = parseFloat(values.inseam_cm) || REF.inseam

  const hasData = FIELDS.some(f => values[f.key] && values[f.key].trim() !== '')
  const size    = useMemo(() => classifySize(bust, waist, hip), [bust, waist, hip])

  // ── Drag handler — attaches window listeners for smooth tracking ──────────
  const handleDragStart = (
    e: React.PointerEvent<SVGCircleElement | SVGLineElement>,
    key: string,
    currentValue: number,
    axis: 'x' | 'y',
    sign: number,
    sensitivity: number,
  ) => {
    e.preventDefault()
    const startClient = axis === 'x' ? e.clientX : e.clientY
    const startValue  = currentValue
    const field       = FIELDS.find(f => f.key === key)!
    setActiveDrag(key)

    const onMove = (ev: PointerEvent) => {
      const clientPos = axis === 'x' ? ev.clientX : ev.clientY
      const delta     = (clientPos - startClient) * sign * sensitivity
      const newVal    = Math.round(clamp(startValue + delta, field.min, field.max))
      setValues(v => ({ ...v, [key]: String(newVal) }))
    }
    const onUp = () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup',   onUp)
      setActiveDrag(null)
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup',   onUp)
  }

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
      <p className="text-offwhite/40 text-sm mb-5 leading-relaxed">
        Digite ou <span className="text-gold/60">arraste as linhas</span> no avatar para estimar suas medidas.
      </p>

      <div className="flex gap-4 md:gap-7 items-start">

        {/* ── Avatar column ── */}
        <div className="flex-shrink-0 w-[108px] sm:w-[136px] md:w-[152px] space-y-2">

          {/* Drag hint */}
          <p className="text-offwhite/25 text-[9px] text-center tracking-wide uppercase">
            ← arraste →
          </p>

          <div className="w-full" style={{ aspectRatio: '200 / 510' }}>
            <BodyAvatar
              bust={bust} waist={waist} hip={hip}
              height={height} inseam={inseam}
              activeDrag={activeDrag}
              onDragStart={handleDragStart}
            />
          </div>

          {/* Live measurement readout */}
          <div className="border border-gold/15 bg-gold/5 px-2 py-2.5">
            <div className="flex items-baseline justify-between mb-2">
              <p className="text-offwhite/30 text-[9px] tracking-widest uppercase">
                {hasData ? 'Estimativa' : 'Referência BR'}
              </p>
              <p className="text-gold font-light tracking-widest text-lg leading-none">{size}</p>
            </div>
            <div className="space-y-1">
              {[
                { label: 'Busto',       value: bust,   key: 'bust_cm'   },
                { label: 'Cintura',     value: waist,  key: 'waist_cm'  },
                { label: 'Quadril',     value: hip,    key: 'hip_cm'    },
                { label: 'Altura',      value: height, key: 'height_cm' },
                { label: 'Entrepernas', value: inseam, key: 'inseam_cm' },
              ].map(({ label, value, key }) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-offwhite/30 text-[9px]">{label}</span>
                  <span className={`text-[9px] tabular-nums transition-colors ${
                    activeDrag === key ? 'text-gold font-medium' : 'text-offwhite/45'
                  }`}>
                    {Math.round(value)} cm
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="space-y-1 pt-0.5">
            {[
              { label: 'Busto',   color: 'bg-gold/60' },
              { label: 'Cintura', color: 'bg-emerald-400/50' },
              { label: 'Quadril', color: 'bg-gold/40' },
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
                <label htmlFor={`meas-${key}`}
                  className="text-offwhite/50 text-xs tracking-widest uppercase">
                  {label}{required && <span className="text-gold/60 ml-1">*</span>}
                </label>
                <button type="button"
                  onClick={() => setOpenTip(openTip === key ? null : key)}
                  className="text-gold/40 text-xs hover:text-gold transition-colors">
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
                  min={1} max={300}
                  className={`w-full bg-offwhite/5 border text-offwhite placeholder-offwhite/20
                    px-4 py-3 text-sm focus:outline-none transition-colors pr-12
                    ${activeDrag === key
                      ? 'border-gold/60 bg-gold/5'
                      : 'border-gold/20 focus:border-gold/60'}`}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-offwhite/25 text-xs">cm</span>
              </div>
            </div>
          ))}

          <div className="pt-4 flex flex-col sm:flex-row gap-3">
            <button type="submit"
              className="flex-1 bg-gold text-primary py-3.5 text-xs tracking-[0.2em] uppercase
                hover:bg-gold/90 transition-colors">
              Continuar
            </button>
            <button type="button" onClick={onSkip}
              className="flex-1 border border-gold/20 text-offwhite/40 py-3.5 text-xs
                tracking-widest uppercase hover:text-offwhite hover:border-gold/40 transition-colors">
              Pular esta etapa
            </button>
          </div>
        </form>

      </div>
    </div>
  )
}
