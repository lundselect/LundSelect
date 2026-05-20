'use client'

import { useRef, useState } from 'react'
import { Measurements, ShapeAnswers } from '@/lib/size-guide/types'

// ── MediaPipe landmark indices ──────────────────────────────────────────────
const NOSE = 0
const L_SHOULDER = 11, R_SHOULDER = 12
const L_ELBOW = 13,    R_ELBOW = 14
const L_WRIST = 15,    R_WRIST = 16
const L_HIP = 23,      R_HIP = 24
const L_KNEE = 25,     R_KNEE = 26
const L_ANKLE = 27,    R_ANKLE = 28

const SKELETON: [number, number][] = [
  [L_SHOULDER, R_SHOULDER],
  [L_SHOULDER, L_HIP], [R_SHOULDER, R_HIP], [L_HIP, R_HIP],
  [L_SHOULDER, L_ELBOW], [L_ELBOW, L_WRIST],
  [R_SHOULDER, R_ELBOW], [R_ELBOW, R_WRIST],
  [L_HIP, L_KNEE], [L_KNEE, L_ANKLE],
  [R_HIP, R_KNEE], [R_KNEE, R_ANKLE],
]

type Landmark = { x: number; y: number; z: number; visibility?: number }

// ── Body analysis ──────────────────────────────────────────────────────────
function analyzeBody(lm: Landmark[], heightCm: number) {
  const d = (a: Landmark, b: Landmark) =>
    Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2)

  const shoulderW   = d(lm[L_SHOULDER], lm[R_SHOULDER])
  const hipW        = d(lm[L_HIP],      lm[R_HIP])
  const shoulderMid = { y: (lm[L_SHOULDER].y + lm[R_SHOULDER].y) / 2 }
  const hipMid      = { y: (lm[L_HIP].y      + lm[R_HIP].y)      / 2 }
  const ankleMid    = { y: (lm[L_ANKLE].y    + lm[R_ANKLE].y)    / 2 }
  const bodyH       = ankleMid.y - lm[NOSE].y
  const torsoH      = hipMid.y   - shoulderMid.y
  const lArm        = d(lm[L_SHOULDER], lm[L_WRIST])
  const rArm        = d(lm[R_SHOULDER], lm[R_WRIST])
  const avgArm      = (lArm + rArm) / 2

  // Ratios — independent of image size
  const shr = shoulderW / hipW          // shoulder-hip ratio
  const tr  = torsoH    / bodyH         // torso ratio
  const ar  = avgArm    / bodyH         // arm ratio

  // Scale to cm using provided height as reference
  const cmPerUnit      = heightCm / bodyH
  const shoulderCm     = shoulderW * cmPerUnit
  const hipWidthCm     = hipW      * cmPerUnit

  // Circumference approximation (oval cross-section, front width × depth factor)
  const bustCm = Math.round(shoulderCm  * 2.65)
  const hipCm  = Math.round(hipWidthCm  * 2.78)

  // Body shape
  const bodyShape: ShapeAnswers['silhouette'] =
    shr > 1.10 ? 'fuller_bust'  :
    shr < 0.91 ? 'fuller_hips'  :
    shr > 1.02 ? 'balanced'     : 'straight'

  // Bust proportion
  const bust: ShapeAnswers['bust'] =
    shr > 1.07 ? 'fuller' : shr < 0.93 ? 'smaller' : 'proportional'

  // Torso length
  const torsoLength: ShapeAnswers['torsoLength'] =
    tr > 0.34 ? 'long' : tr < 0.27 ? 'short' : 'average'

  // Arm length
  const armLength: ShapeAnswers['armLength'] =
    ar > 0.44 ? 'too_long' : ar < 0.34 ? 'too_short' : 'just_right'

  // Estimated size from shoulder width
  const estimatedSize =
    shoulderCm < 33 ? 'PP' :
    shoulderCm < 36 ? 'P'  :
    shoulderCm < 38 ? 'M'  :
    shoulderCm < 41 ? 'G'  : 'GG'

  // Confidence from landmark visibility
  const keyVis = [L_SHOULDER, R_SHOULDER, L_HIP, R_HIP, L_ANKLE, R_ANKLE]
  const avgVis = keyVis.reduce((s, i) => s + (lm[i].visibility ?? 1), 0) / keyVis.length
  const confidence = avgVis > 0.8 ? 'medium' as const : 'low' as const

  return {
    bodyShape,
    bust,
    torsoLength,
    armLength,
    estimatedSize,
    bustCm,
    hipCm,
    shoulderCm: Math.round(shoulderCm),
    heightCategory: heightCm < 163 ? 'Baixa (até 1,63m)' : heightCm > 173 ? 'Alta (acima de 1,73m)' : 'Média (1,63–1,73m)',
    confidence,
    shr,
  }
}

// ── Pose detection via MediaPipe (browser, no API cost) ────────────────────
async function detectPose(imgEl: HTMLImageElement): Promise<Landmark[] | null> {
  // Dynamic import avoids SSR bundle issues
  const { PoseLandmarker, FilesetResolver } = await import('@mediapipe/tasks-vision')

  const fs = await FilesetResolver.forVisionTasks(
    'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm'
  )
  const detector = await PoseLandmarker.createFromOptions(fs, {
    baseOptions: {
      modelAssetPath:
        'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
      delegate: 'CPU',
    },
    runningMode: 'IMAGE',
    numPoses: 1,
  })

  const result = detector.detect(imgEl)
  detector.close()
  return result.landmarks[0] ?? null
}

// ── Canvas skeleton overlay ────────────────────────────────────────────────
function drawSkeleton(canvas: HTMLCanvasElement, imgEl: HTMLImageElement, lm: Landmark[]) {
  canvas.width  = imgEl.naturalWidth
  canvas.height = imgEl.naturalHeight
  const ctx = canvas.getContext('2d')!
  const w = canvas.width, h = canvas.height

  ctx.drawImage(imgEl, 0, 0)

  // Dark overlay for contrast
  ctx.fillStyle = 'rgba(0,0,0,0.25)'
  ctx.fillRect(0, 0, w, h)

  ctx.drawImage(imgEl, 0, 0)

  // Skeleton lines
  ctx.strokeStyle = 'rgba(181,150,90,0.55)'
  ctx.lineWidth   = Math.max(1, w / 300)
  SKELETON.forEach(([a, b]) => {
    ctx.beginPath()
    ctx.moveTo(lm[a].x * w, lm[a].y * h)
    ctx.lineTo(lm[b].x * w, lm[b].y * h)
    ctx.stroke()
  })

  // Measurement lines (dashed, brighter)
  const measureLine = (a: number, b: number, color: string) => {
    ctx.strokeStyle = color
    ctx.lineWidth   = Math.max(2, w / 200)
    ctx.setLineDash([w / 80, w / 160])
    ctx.beginPath()
    ctx.moveTo(lm[a].x * w, lm[a].y * h)
    ctx.lineTo(lm[b].x * w, lm[b].y * h)
    ctx.stroke()
    ctx.setLineDash([])
  }
  measureLine(L_SHOULDER, R_SHOULDER, 'rgba(181,150,90,1)')   // gold = shoulders
  measureLine(L_HIP,      R_HIP,      'rgba(110,200,140,0.9)') // green = hips

  // Key keypoints
  const r = Math.max(4, w / 120)
  ;[NOSE, L_SHOULDER, R_SHOULDER, L_HIP, R_HIP, L_ANKLE, R_ANKLE, L_WRIST, R_WRIST].forEach(i => {
    ctx.beginPath()
    ctx.arc(lm[i].x * w, lm[i].y * h, r, 0, 2 * Math.PI)
    ctx.fillStyle = 'rgba(181,150,90,0.95)'
    ctx.fill()
  })
}

// ── Shape display labels ───────────────────────────────────────────────────
const SHAPE_LABEL: Record<string, string> = {
  balanced:    'Proporcional',
  fuller_bust: 'Busto mais cheio',
  fuller_hips: 'Quadril mais largo',
  straight:    'Reto / tubular',
}

// ── Component ──────────────────────────────────────────────────────────────
interface Props {
  initialMeasurements?: Partial<Measurements>
  onComplete: (shapeAnswers: Partial<ShapeAnswers>, measurements: Partial<Measurements>) => void
  onSkip: () => void
}

type Status = 'idle' | 'preview' | 'loading' | 'analyzing' | 'result' | 'error'

type AnalysisResult = ReturnType<typeof analyzeBody>

export default function Step2BodyScan({ initialMeasurements, onComplete, onSkip }: Props) {
  const fileInputRef  = useRef<HTMLInputElement>(null)
  const hiddenImgRef  = useRef<HTMLImageElement>(null)
  const canvasRef     = useRef<HTMLCanvasElement>(null)

  const [heightInput, setHeightInput] = useState(
    initialMeasurements?.height_cm ? String(initialMeasurements.height_cm) : ''
  )
  const [previewUrl, setPreviewUrl]     = useState<string | null>(null)
  const [status,     setStatus]         = useState<Status>('idle')
  const [result,     setResult]         = useState<AnalysisResult | null>(null)
  const [errorMsg,   setErrorMsg]       = useState('')

  const heightCm = parseInt(heightInput)
  const heightValid = !isNaN(heightCm) && heightCm >= 140 && heightCm <= 220

  // ── File select ──────────────────────────────────────────────────────────
  const handleFile = (file: File) => {
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    setStatus('preview')
    setResult(null)
  }

  // ── Run analysis ─────────────────────────────────────────────────────────
  const handleAnalyze = async () => {
    if (!heightValid || !hiddenImgRef.current) return
    setStatus('loading')
    setErrorMsg('')

    try {
      // Wait for hidden img to finish loading
      const imgEl = hiddenImgRef.current
      if (!imgEl.complete) await new Promise<void>(res => { imgEl.onload = () => res() })

      setStatus('analyzing')
      const landmarks = await detectPose(imgEl)

      if (!landmarks) {
        setErrorMsg(
          'Não detectamos uma pose completa. Use uma foto de corpo inteiro com boa iluminação e fundo neutro.'
        )
        setStatus('error')
        return
      }

      const analysis = analyzeBody(landmarks, heightCm)
      setResult(analysis)

      // Draw skeleton on canvas
      if (canvasRef.current) drawSkeleton(canvasRef.current, imgEl, landmarks)

      setStatus('result')
    } catch {
      setErrorMsg('Erro ao processar a imagem. Tente novamente.')
      setStatus('error')
    }
  }

  // ── Accept results ───────────────────────────────────────────────────────
  const handleAccept = () => {
    if (!result) return

    const shapeAnswers: Partial<ShapeAnswers> = {
      silhouette:  result.bodyShape,
      bust:        result.bust,
      torsoLength: result.torsoLength,
      armLength:   result.armLength,
    }

    // Only provide scan measurements if Step 1 didn't already capture them
    const measurements: Partial<Measurements> = {}
    if (!initialMeasurements?.bust_cm && result.bustCm) measurements.bust_cm = result.bustCm
    if (!initialMeasurements?.hip_cm  && result.hipCm)  measurements.hip_cm  = result.hipCm

    onComplete(shapeAnswers, measurements)
  }

  const reset = () => {
    setPreviewUrl(null)
    setResult(null)
    setStatus('idle')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div>
      <h2 className="text-offwhite text-xl font-light mb-2">Scan corporal</h2>
      <p className="text-offwhite/40 text-sm mb-6 leading-relaxed">
        MediaPipe analisa as proporções do seu corpo diretamente no dispositivo.
        Nenhuma imagem é enviada ou armazenada.
      </p>

      {/* Hidden img used by MediaPipe — must be in DOM */}
      {previewUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          ref={hiddenImgRef}
          src={previewUrl}
          alt=""
          crossOrigin="anonymous"
          className="hidden"
        />
      )}

      {/* ── Height input (always visible) ── */}
      <div className="mb-6">
        <label className="block text-offwhite/50 text-xs tracking-widest uppercase mb-2">
          Sua altura <span className="text-gold/60">*</span>
        </label>
        <div className="relative">
          <input
            type="number"
            value={heightInput}
            onChange={e => setHeightInput(e.target.value)}
            placeholder="165"
            min={140}
            max={220}
            disabled={status === 'loading' || status === 'analyzing'}
            className="w-full bg-offwhite/5 border border-gold/20 text-offwhite placeholder-offwhite/20 px-4 py-3 pr-12 text-sm focus:outline-none focus:border-gold/60 transition-colors disabled:opacity-40"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-offwhite/25 text-xs">cm</span>
        </div>
        {heightInput && !heightValid && (
          <p className="text-red-400 text-xs mt-1">Digite uma altura entre 140 e 220 cm</p>
        )}
      </div>

      {/* ── Tips (idle / preview) ── */}
      {(status === 'idle' || status === 'preview') && (
        <div className="border border-gold/10 p-4 mb-5 space-y-1.5">
          <p className="text-gold/50 text-xs tracking-widest uppercase mb-2">Para melhor resultado</p>
          {[
            'Foto de corpo inteiro, de pé e de frente',
            'Roupas justas ou leves — evite casacos volumosos',
            'Boa iluminação e fundo neutro',
            'Câmera na altura do peito ou em um suporte',
          ].map(tip => (
            <div key={tip} className="flex items-start gap-2">
              <span className="text-gold/30 text-xs mt-0.5 flex-shrink-0">—</span>
              <p className="text-offwhite/35 text-xs leading-relaxed">{tip}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── File input (hidden) ── */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
      />

      {/* ── IDLE state ── */}
      {status === 'idle' && (
        <div className="space-y-3">
          <button
            type="button"
            disabled={!heightValid}
            onClick={() => {
              if (fileInputRef.current) {
                fileInputRef.current.setAttribute('capture', 'user')
                fileInputRef.current.click()
              }
            }}
            className="w-full bg-gold text-primary py-3.5 text-xs tracking-[0.2em] uppercase hover:bg-gold/90 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Tirar foto (selfie de corpo inteiro)
          </button>
          <button
            type="button"
            disabled={!heightValid}
            onClick={() => {
              if (fileInputRef.current) {
                fileInputRef.current.removeAttribute('capture')
                fileInputRef.current.click()
              }
            }}
            className="w-full border border-gold/30 text-gold py-3.5 text-xs tracking-[0.2em] uppercase hover:bg-gold/5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Escolher da galeria
          </button>
          {!heightValid && (
            <p className="text-offwhite/25 text-xs text-center">
              Digite sua altura acima para habilitar o scan
            </p>
          )}
          <button
            type="button"
            onClick={onSkip}
            className="w-full border border-gold/10 text-offwhite/25 py-3 text-xs tracking-widest uppercase hover:text-offwhite hover:border-gold/30 transition-colors"
          >
            Pular esta etapa
          </button>
        </div>
      )}

      {/* ── PREVIEW state ── */}
      {status === 'preview' && previewUrl && (
        <div className="space-y-4">
          <div className="border border-gold/20 overflow-hidden max-h-80 flex items-center justify-center bg-black/20">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={previewUrl} alt="Preview" className="max-h-80 w-full object-contain object-top" />
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleAnalyze}
              className="flex-1 bg-gold text-primary py-3.5 text-xs tracking-[0.2em] uppercase hover:bg-gold/90 transition-colors"
            >
              Analisar
            </button>
            <button
              type="button"
              onClick={reset}
              className="px-5 border border-gold/20 text-offwhite/40 py-3.5 text-xs hover:text-offwhite transition-colors"
            >
              Refazer
            </button>
          </div>
          <button
            type="button"
            onClick={onSkip}
            className="w-full text-offwhite/20 text-xs hover:text-offwhite/40 transition-colors py-1"
          >
            Pular esta etapa
          </button>
        </div>
      )}

      {/* ── LOADING / ANALYZING state ── */}
      {(status === 'loading' || status === 'analyzing') && (
        <div className="flex flex-col items-center justify-center py-16 space-y-4">
          <div className="w-6 h-6 border border-gold border-t-transparent rounded-full animate-spin" />
          <p className="text-offwhite/40 text-sm">
            {status === 'loading' ? 'Carregando modelo de detecção...' : 'Analisando proporções...'}
          </p>
          <p className="text-offwhite/20 text-xs text-center max-w-[220px]">
            {status === 'loading' && 'Primeira análise pode levar alguns segundos'}
          </p>
        </div>
      )}

      {/* ── ERROR state ── */}
      {status === 'error' && (
        <div className="space-y-4">
          <div className="border border-red-500/20 bg-red-500/5 p-4">
            <p className="text-red-400/80 text-sm leading-relaxed">{errorMsg}</p>
          </div>
          <button
            type="button"
            onClick={reset}
            className="w-full border border-gold/20 text-gold py-3 text-xs tracking-widest uppercase hover:bg-gold hover:text-primary transition-colors"
          >
            Tentar novamente
          </button>
          <button
            type="button"
            onClick={onSkip}
            className="w-full text-offwhite/20 text-xs hover:text-offwhite/40 transition-colors py-1"
          >
            Pular esta etapa
          </button>
        </div>
      )}

      {/* ── RESULT state ── */}
      {status === 'result' && result && (
        <div className="space-y-4">
          {/* Canvas with skeleton overlay */}
          <div className="border border-gold/20 overflow-hidden bg-black/30 max-h-72 flex items-center justify-center">
            <canvas
              ref={canvasRef}
              className="max-h-72 w-full object-contain"
              style={{ imageRendering: 'auto' }}
            />
          </div>

          {/* Legend */}
          <div className="flex items-center gap-5 text-xs text-offwhite/30">
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-5 h-0.5 bg-gold" /> Largura ombros
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-5 h-0.5 bg-emerald-400/70" /> Largura quadril
            </span>
          </div>

          {/* Result cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="border border-gold/15 p-3">
              <p className="text-offwhite/30 text-xs mb-1">Tamanho estimado</p>
              <p className="text-gold text-2xl font-light tracking-widest">{result.estimatedSize}</p>
            </div>
            <div className="border border-gold/15 p-3">
              <p className="text-offwhite/30 text-xs mb-1">Altura</p>
              <p className="text-offwhite text-sm font-light leading-snug">{result.heightCategory}</p>
            </div>
            <div className="border border-gold/15 p-3">
              <p className="text-offwhite/30 text-xs mb-1">Silhueta</p>
              <p className="text-offwhite text-sm">{SHAPE_LABEL[result.bodyShape] ?? result.bodyShape}</p>
            </div>
            <div className="border border-gold/15 p-3">
              <p className="text-offwhite/30 text-xs mb-1">Busto</p>
              <p className="text-offwhite text-sm">
                {result.bust === 'fuller' ? 'Mais cheio' : result.bust === 'smaller' ? 'Menor' : 'Proporcional'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className={`text-xs px-2 py-0.5 border ${
              result.confidence === 'medium'
                ? 'border-amber-500/30 text-amber-400/70'
                : 'border-offwhite/10 text-offwhite/30'
            }`}>
              Confiança {result.confidence === 'medium' ? 'média' : 'baixa'}
            </span>
            <span className="text-offwhite/20 text-xs">Ombros: {result.shoulderCm}cm detectados</span>
          </div>

          <p className="text-offwhite/20 text-xs leading-relaxed">
            Estes dados serão combinados com suas medidas e preferências para recomendações mais precisas.
          </p>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleAccept}
              className="flex-1 bg-gold text-primary py-3.5 text-xs tracking-[0.2em] uppercase hover:bg-gold/90 transition-colors"
            >
              Usar estes dados
            </button>
            <button
              type="button"
              onClick={reset}
              className="px-5 border border-gold/20 text-offwhite/40 py-3.5 text-xs hover:text-offwhite transition-colors"
            >
              Refazer
            </button>
          </div>
          <button
            type="button"
            onClick={onSkip}
            className="w-full text-offwhite/20 text-xs hover:text-offwhite/40 transition-colors py-1"
          >
            Pular e continuar sem scan
          </button>
        </div>
      )}
    </div>
  )
}
