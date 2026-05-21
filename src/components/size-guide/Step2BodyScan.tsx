'use client'

import { useRef, useState, useEffect } from 'react'
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

  const shr = shoulderW / hipW
  const tr  = torsoH    / bodyH
  const ar  = avgArm    / bodyH

  const cmPerUnit      = heightCm / bodyH
  const shoulderCm     = shoulderW * cmPerUnit
  const hipWidthCm     = hipW      * cmPerUnit

  const bustCm = Math.round(shoulderCm  * 2.65)
  const hipCm  = Math.round(hipWidthCm  * 2.78)

  const bodyShape: ShapeAnswers['silhouette'] =
    shr > 1.10 ? 'fuller_bust'  :
    shr < 0.91 ? 'fuller_hips'  :
    shr > 1.02 ? 'balanced'     : 'straight'

  const bust: ShapeAnswers['bust'] =
    shr > 1.07 ? 'fuller' : shr < 0.93 ? 'smaller' : 'proportional'

  const torsoLength: ShapeAnswers['torsoLength'] =
    tr > 0.34 ? 'long' : tr < 0.27 ? 'short' : 'average'

  const armLength: ShapeAnswers['armLength'] =
    ar > 0.44 ? 'too_long' : ar < 0.34 ? 'too_short' : 'just_right'

  const estimatedSize =
    shoulderCm < 33 ? 'PP' :
    shoulderCm < 36 ? 'P'  :
    shoulderCm < 38 ? 'M'  :
    shoulderCm < 41 ? 'G'  : 'GG'

  const keyVis = [L_SHOULDER, R_SHOULDER, L_HIP, R_HIP, L_ANKLE, R_ANKLE]
  const avgVis = keyVis.reduce((s, i) => s + (lm[i].visibility ?? 1), 0) / keyVis.length
  const confidence = avgVis > 0.8 ? 'medium' as const : 'low' as const

  // Waist estimate — no direct landmark; derived from hip and body shape
  const waistRatio = shr > 1.05 ? 0.79 : shr < 0.96 ? 0.76 : 0.80
  const waistCm = Math.round(hipCm * waistRatio)

  // Torso length (shoulder to hip)
  const torsoLengthCm = Math.round(torsoH * cmPerUnit)

  // Inseam (hip to ankle)
  const inseamCm = Math.round((ankleMid.y - hipMid.y) * cmPerUnit)

  // Arm length (shoulder to wrist)
  const armLengthCm = Math.round(avgArm * cmPerUnit)

  return {
    bodyShape, bust, torsoLength, armLength, estimatedSize,
    bustCm, hipCm, waistCm, torsoLengthCm, inseamCm, armLengthCm,
    shoulderCm: Math.round(shoulderCm),
    heightCategory: heightCm < 163 ? 'Baixa (até 1,63m)' : heightCm > 173 ? 'Alta (acima de 1,73m)' : 'Média (1,63–1,73m)',
    confidence, shr,
  }
}

// ── Pose detection via MediaPipe ────────────────────────────────────────────
async function detectPose(imgEl: HTMLImageElement): Promise<Landmark[] | null> {
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
  ctx.fillStyle = 'rgba(0,0,0,0.25)'
  ctx.fillRect(0, 0, w, h)
  ctx.drawImage(imgEl, 0, 0)

  ctx.strokeStyle = 'rgba(181,150,90,0.55)'
  ctx.lineWidth   = Math.max(1, w / 300)
  SKELETON.forEach(([a, b]) => {
    ctx.beginPath()
    ctx.moveTo(lm[a].x * w, lm[a].y * h)
    ctx.lineTo(lm[b].x * w, lm[b].y * h)
    ctx.stroke()
  })

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
  measureLine(L_SHOULDER, R_SHOULDER, 'rgba(181,150,90,1)')
  measureLine(L_HIP,      R_HIP,      'rgba(110,200,140,0.9)')

  const r = Math.max(4, w / 120)
  ;[NOSE, L_SHOULDER, R_SHOULDER, L_HIP, R_HIP, L_ANKLE, R_ANKLE, L_WRIST, R_WRIST].forEach(i => {
    ctx.beginPath()
    ctx.arc(lm[i].x * w, lm[i].y * h, r, 0, 2 * Math.PI)
    ctx.fillStyle = 'rgba(181,150,90,0.95)'
    ctx.fill()
  })
}

const SHAPE_LABEL: Record<string, string> = {
  balanced:    'Proporcional',
  fuller_bust: 'Busto mais cheio',
  fuller_hips: 'Quadril mais largo',
  straight:    'Reto / tubular',
}

// ── Brazilian average woman measurements (IBGE POF / SENAI sizing data) ────
const BR_AVERAGE = {
  shoulder:  38,   // cm — largura dos ombros
  bust:      95,   // cm — circunferência do busto
  waist:     80,   // cm — circunferência da cintura
  hip:      101,   // cm — circunferência do quadril
  torso:     48,   // cm — comprimento do torso (ombro ao quadril)
  arm:       56,   // cm — comprimento do braço (ombro ao pulso)
  inseam:    76,   // cm — entrepernas (quadril ao tornozelo)
}

// ── SVG body diagram with measurement lines ─────────────────────────────────
// Front-view female silhouette. Measurement lines at shoulder / bust / waist / hip.
// The line widths visually reflect the different body widths at each level.
function BodyDiagram() {
  const s   = 'rgba(255,255,255,0.15)'  // silhouette stroke
  const f   = 'rgba(255,255,255,0.04)'  // silhouette fill

  // Measurement line configs: [y, x1, x2, color]
  const mLines: [number, number, number, string][] = [
    [40,  8, 72, 'rgba(181,150,90,0.85)'],  // shoulder
    [62, 14, 66, 'rgba(181,150,90,0.70)'],  // bust
    [86, 20, 60, 'rgba(181,150,90,0.55)'],  // waist  (narrowest)
    [108, 4, 76, 'rgba(181,150,90,0.75)'],  // hip    (widest)
  ]

  return (
    <svg viewBox="0 0 80 200" fill="none" className="w-full h-full">
      {/* ── Head ── */}
      <ellipse cx="40" cy="12" rx="10" ry="12" stroke={s} strokeWidth="0.8" fill={f} />

      {/* ── Body silhouette ── */}
      <path
        stroke={s} strokeWidth="0.8" fill={f}
        d={[
          'M 36,22',
          'C 28,26 16,34 12,40',
          'C 8,46 8,54 10,58',
          'C 12,60 16,61 20,62',
          'C 20,72 22,80 26,86',
          'C 22,96 12,104 10,108',
          'C 10,116 18,120 28,122',
          'L 24,192 L 30,194 L 34,194 L 38,122',
          'L 42,122',
          'L 46,194 L 50,194 L 56,192 L 52,122',
          'C 62,120 70,116 70,108',
          'C 68,96 58,88 54,86',
          'C 58,80 60,72 60,62',
          'C 64,61 68,60 70,58',
          'C 72,54 72,46 68,40',
          'C 64,34 52,26 44,22 Z',
        ].join(' ')}
      />

      {/* ── Left arm ── */}
      <path
        stroke={s} strokeWidth="0.8" fill={f}
        d="M 12,40 C 6,50 4,72 4,98 C 4,112 6,124 8,130 L 14,132 C 16,126 18,114 18,100 C 18,74 16,52 20,44 Z"
      />

      {/* ── Right arm ── */}
      <path
        stroke={s} strokeWidth="0.8" fill={f}
        d="M 68,40 C 74,50 76,72 76,98 C 76,112 74,124 72,130 L 66,132 C 64,126 62,114 62,100 C 62,74 64,52 60,44 Z"
      />

      {/* ── Measurement lines ── */}
      {mLines.map(([y, x1, x2, color], i) => (
        <g key={i} stroke={color} strokeWidth="0.9">
          <line x1={x1} y1={y} x2={x2} y2={y} />
          <line x1={x1} y1={y - 3} x2={x1} y2={y + 3} />
          <line x1={x2} y1={y - 3} x2={x2} y2={y + 3} />
        </g>
      ))}

      {/* ── Measurement index dots (right side, matches table rows) ── */}
      {mLines.map(([y,, x2, color], i) => (
        <circle key={`dot-${i}`} cx={x2 + 1} cy={y} r="2.5" fill={color} opacity="0.7" />
      ))}
    </svg>
  )
}

// ── Component ──────────────────────────────────────────────────────────────
interface Props {
  initialMeasurements?: Partial<Measurements>
  onComplete: (shapeAnswers: Partial<ShapeAnswers>, measurements: Partial<Measurements>) => void
  onSkip: () => void
}

type Status =
  | 'idle'
  | 'camera_front'
  | 'countdown_front'
  | 'camera_back'
  | 'countdown_back'
  | 'loading'
  | 'analyzing'
  | 'result'
  | 'error'

type AnalysisResult = ReturnType<typeof analyzeBody>

export default function Step2BodyScan({ initialMeasurements, onComplete, onSkip }: Props) {
  const videoRef       = useRef<HTMLVideoElement>(null)
  const canvasRef      = useRef<HTMLCanvasElement>(null)
  const captureRef     = useRef<HTMLCanvasElement>(null)
  const streamRef      = useRef<MediaStream | null>(null)
  const frontPhotoRef  = useRef<string | null>(null)
  const timerRef       = useRef<ReturnType<typeof setInterval> | null>(null)
  const fileInputRef   = useRef<HTMLInputElement>(null)

  const [heightInput, setHeightInput] = useState(
    initialMeasurements?.height_cm ? String(initialMeasurements.height_cm) : ''
  )
  const [status,    setStatus]    = useState<Status>('idle')
  const [countdown, setCountdown] = useState(3)
  const [result,    setResult]    = useState<AnalysisResult | null>(null)
  const [errorMsg,  setErrorMsg]  = useState('')
  const [consented, setConsented] = useState(false)

  const heightCm    = parseInt(heightInput)
  const heightValid = !isNaN(heightCm) && heightCm >= 140 && heightCm <= 220

  // Stop camera stream on unmount
  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach(t => t.stop())
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
  }

  const captureFrame = (): string | null => {
    const video = videoRef.current
    const canvas = captureRef.current
    if (!video || !canvas || video.readyState < 2) return null
    canvas.width  = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d')!.drawImage(video, 0, 0)
    return canvas.toDataURL('image/jpeg', 0.92)
  }

  const runAnalysis = async (dataUrl: string, hCm: number) => {
    setStatus('loading')
    setErrorMsg('')
    try {
      const img = new Image()
      img.src = dataUrl
      await new Promise<void>((res, rej) => {
        img.onload  = () => res()
        img.onerror = () => rej(new Error('load'))
      })

      setStatus('analyzing')
      const landmarks = await detectPose(img)

      if (!landmarks) {
        setErrorMsg('Não detectamos uma pose completa. Use boa iluminação, fundo neutro e corpo inteiro visível.')
        setStatus('error')
        return
      }

      const analysis = analyzeBody(landmarks, hCm)
      setResult(analysis)
      if (canvasRef.current) drawSkeleton(canvasRef.current, img, landmarks)
      setStatus('result')
    } catch {
      setErrorMsg('Erro ao processar a imagem. Tente novamente.')
      setStatus('error')
    }
  }

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
      }
      setStatus('camera_front')
    } catch {
      setErrorMsg('Não foi possível acessar a câmera. Verifique as permissões do navegador e tente novamente, ou use a galeria.')
      setStatus('error')
    }
  }

  const beginCountdown = (phase: 'front' | 'back') => {
    const capturedHeight = heightCm
    setStatus(phase === 'front' ? 'countdown_front' : 'countdown_back')
    setCountdown(3)

    let count = 3
    timerRef.current = setInterval(() => {
      count--
      setCountdown(count)

      if (count <= 0) {
        clearInterval(timerRef.current!)
        timerRef.current = null
        const dataUrl = captureFrame()

        if (phase === 'front') {
          frontPhotoRef.current = dataUrl
          setCountdown(3)
          setStatus('camera_back')
        } else {
          stopCamera()
          const front = frontPhotoRef.current
          if (front) {
            runAnalysis(front, capturedHeight)
          } else {
            setErrorMsg('Erro ao capturar a foto. Tente novamente.')
            setStatus('error')
          }
        }
      }
    }, 1000)
  }

  const reset = () => {
    stopCamera()
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
    frontPhotoRef.current = null
    setResult(null)
    setStatus('idle')
    setCountdown(3)
    setErrorMsg('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleFileGallery = (file: File) => {
    const reader = new FileReader()
    reader.onload = e => {
      const dataUrl = e.target?.result as string
      if (dataUrl) runAnalysis(dataUrl, heightCm)
    }
    reader.readAsDataURL(file)
  }

  const handleAccept = () => {
    if (!result) return
    const shapeAnswers: Partial<ShapeAnswers> = {
      silhouette:  result.bodyShape,
      bust:        result.bust,
      torsoLength: result.torsoLength,
      armLength:   result.armLength,
    }
    const measurements: Partial<Measurements> = {}
    if (!initialMeasurements?.bust_cm && result.bustCm) measurements.bust_cm = result.bustCm
    if (!initialMeasurements?.hip_cm  && result.hipCm)  measurements.hip_cm  = result.hipCm
    onComplete(shapeAnswers, measurements)
  }

  const isCameraActive =
    status === 'camera_front' || status === 'countdown_front' ||
    status === 'camera_back'  || status === 'countdown_back'

  const isCounting = status === 'countdown_front' || status === 'countdown_back'

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <div>
      <h2 className="text-offwhite text-xl font-light mb-2">Scan corporal</h2>
      <p className="text-offwhite/40 text-sm mb-6 leading-relaxed">
        MediaPipe analisa as proporções do seu corpo diretamente no dispositivo.
        Nenhuma imagem é enviada ou armazenada.
      </p>

      {/* Hidden canvas for frame capture */}
      <canvas ref={captureRef} className="hidden" />

      {/* ── Height input ── */}
      {(status === 'idle' || status === 'error') && (
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
              className="w-full bg-offwhite/5 border border-gold/20 text-offwhite placeholder-offwhite/20 px-4 py-3 pr-12 text-sm focus:outline-none focus:border-gold/60 transition-colors"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-offwhite/25 text-xs">cm</span>
          </div>
          {heightInput && !heightValid && (
            <p className="text-red-400 text-xs mt-1">Digite uma altura entre 140 e 220 cm</p>
          )}
        </div>
      )}

      {/* ── Privacy & consent (idle only) ── */}
      {status === 'idle' && (
        <>
          {/* Strict nudity / clothing policy */}
          <div className="border border-red-500/30 bg-red-500/5 p-4 mb-4">
            <p className="text-red-400/90 text-xs font-semibold tracking-wide uppercase mb-3">
              Conteúdo permitido — leia antes de continuar
            </p>
            <p className="text-offwhite/50 text-xs leading-relaxed mb-3">
              Esta ferramenta destina-se exclusivamente à análise de proporções corporais para fins de
              recomendação de tamanho. O uso é restrito a imagens de corpo inteiro com roupas adequadas.
            </p>
            <ul className="space-y-2 mb-3">
              {[
                { label: 'Permitido', text: 'Roupas justas — leggings, top esportivo, collant, roupa de ginástica', ok: true },
                { label: 'Reduz precisão', text: 'Roupas largas, casacos volumosos ou vestidos amplos', ok: null },
                { label: 'Estritamente proibido', text: 'Nudez total ou parcial, lingerie, roupas de banho ou qualquer roupa de baixo — independentemente do grau de exposição', ok: false },
              ].map(({ label, text, ok }) => (
                <li key={label} className="flex items-start gap-2.5">
                  <span className={`text-xs mt-0.5 flex-shrink-0 font-bold ${ok === true ? 'text-emerald-400/70' : ok === false ? 'text-red-400' : 'text-amber-400/60'}`}>
                    {ok === true ? '✓' : ok === false ? '✕' : '!'}
                  </span>
                  <span>
                    <span className={`text-xs font-medium mr-1 ${ok === true ? 'text-emerald-400/70' : ok === false ? 'text-red-400/80' : 'text-amber-400/60'}`}>
                      {label}:
                    </span>
                    <span className="text-offwhite/35 text-xs leading-relaxed">{text}</span>
                  </span>
                </li>
              ))}
            </ul>
            <p className="text-offwhite/30 text-xs leading-relaxed border-t border-red-500/15 pt-3">
              O envio de imagens com nudez ou conteúdo inapropriado é de responsabilidade exclusiva do
              usuário e pode caracterizar infração nos termos da legislação vigente no Brasil (ECA, Lei
              13.718/2018) e em outras jurisdições. A Lund Select não tolera, armazena nem compartilha
              qualquer conteúdo dessa natureza.
            </p>
          </div>

          {/* How the photo is processed */}
          <div className="border border-gold/10 bg-gold/5 p-4 mb-4">
            <p className="text-gold/70 text-xs font-medium tracking-wide uppercase mb-3">
              Como sua foto é tratada
            </p>
            <ol className="space-y-2.5 list-none">
              {[
                { n: '1', text: 'A câmera captura a imagem diretamente no seu dispositivo.' },
                { n: '2', text: 'O modelo de análise (MediaPipe) lê apenas as proporções do corpo — ombros, quadril, tornozelos — e gera as medidas estimadas.' },
                { n: '3', text: 'Imediatamente após a análise, a imagem é removida da memória do navegador. Nenhuma cópia é salva no dispositivo, em nuvem ou em qualquer servidor.' },
                { n: '4', text: 'Apenas os dados de medida resultantes (ex.: estimativa de tamanho) são armazenados no seu perfil, sem qualquer vinculação à imagem original.' },
              ].map(({ n, text }) => (
                <li key={n} className="flex items-start gap-2.5">
                  <span className="text-gold/40 text-xs font-medium flex-shrink-0 mt-0.5">{n}.</span>
                  <p className="text-offwhite/40 text-xs leading-relaxed">{text}</p>
                </li>
              ))}
            </ol>
          </div>

          {/* Consent — explicit, affirmative */}
          <label className="flex items-start gap-3 cursor-pointer mb-5 group">
            <div
              onClick={() => setConsented(v => !v)}
              className={`mt-0.5 w-4 h-4 flex-shrink-0 border flex items-center justify-center transition-colors ${
                consented ? 'border-gold bg-gold' : 'border-gold/30 group-hover:border-gold/50'
              }`}
            >
              {consented && <span className="text-primary text-xs leading-none">✓</span>}
            </div>
            <span onClick={() => setConsented(v => !v)} className="text-offwhite/40 text-xs leading-relaxed">
              Li e concordo com as condições acima. Confirmo que usarei roupas adequadas, que não enviarei
              imagens com nudez ou conteúdo inapropriado, e que estou ciente de que a imagem será processada
              exclusivamente no meu dispositivo e apagada imediatamente após a análise.
            </span>
          </label>

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
        </>
      )}

      {/* Hidden file input for gallery */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) handleFileGallery(f) }}
      />

      {/* ── IDLE ── */}
      {status === 'idle' && (
        <div className="space-y-3">
          <button
            type="button"
            disabled={!heightValid || !consented}
            onClick={startCamera}
            className="w-full bg-gold text-primary py-3.5 text-xs tracking-[0.2em] uppercase hover:bg-gold/90 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Tirar foto
          </button>
          <button
            type="button"
            disabled={!heightValid || !consented}
            onClick={() => fileInputRef.current?.click()}
            className="w-full border border-gold/30 text-gold py-3.5 text-xs tracking-[0.2em] uppercase hover:bg-gold/5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Escolher da galeria
          </button>
          {(!heightValid || !consented) && (
            <p className="text-offwhite/25 text-xs text-center">
              {!heightValid ? 'Digite sua altura acima para habilitar o scan' : 'Confirme o aviso acima para continuar'}
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

      {/* ── CAMERA (front / back, with or without countdown) ── */}
      {isCameraActive && (
        <div className="space-y-4">
          {/* Camera viewport */}
          <div className="relative bg-black overflow-hidden rounded-sm" style={{ height: '60vh' }}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />

            {/* Body silhouette guide */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div
                className="border-2 border-gold/30"
                style={{
                  width: '42%',
                  height: '82%',
                  borderRadius: '50% 50% 38% 38% / 12% 12% 8% 8%',
                }}
              />
            </div>

            {/* Phase label top */}
            <div className="absolute top-3 left-0 right-0 flex justify-center pointer-events-none">
              <div className="bg-black/65 px-5 py-2 text-center">
                <p className="text-offwhite text-sm tracking-[0.2em] uppercase font-light">
                  {status === 'camera_front' || status === 'countdown_front' ? 'Foto de Frente' : 'Foto de Costas'}
                </p>
                <p className="text-offwhite/40 text-xs mt-0.5">Corpo inteiro · fique de pé</p>
              </div>
            </div>

            {/* Countdown overlay */}
            {isCounting && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 pointer-events-none">
                <span
                  className="text-gold font-extralight tabular-nums"
                  style={{ fontSize: '8rem', lineHeight: 1, textShadow: '0 2px 20px rgba(0,0,0,0.6)' }}
                >
                  {countdown > 0 ? countdown : '✓'}
                </span>
              </div>
            )}

            {/* Instruction bottom */}
            {!isCounting && (
              <div className="absolute bottom-3 left-0 right-0 flex justify-center pointer-events-none">
                <p className="text-offwhite/50 text-xs text-center max-w-[260px] px-4">
                  {status === 'camera_front'
                    ? 'Posicione seu corpo inteiro dentro do guia e toque em Pronto'
                    : 'Vire de costas, reposicione e toque em Pronto'}
                </p>
              </div>
            )}
          </div>

          {/* Step dots */}
          <div className="flex items-center justify-center gap-2">
            <div className={`w-2 h-2 rounded-full transition-colors ${
              status === 'camera_front' || status === 'countdown_front' ? 'bg-gold' : 'bg-gold/25'
            }`} />
            <div className={`w-8 h-px transition-colors ${
              status === 'camera_back' || status === 'countdown_back' ? 'bg-gold/50' : 'bg-gold/10'
            }`} />
            <div className={`w-2 h-2 rounded-full transition-colors ${
              status === 'camera_back' || status === 'countdown_back' ? 'bg-gold' : 'bg-gold/25'
            }`} />
            <p className="text-offwhite/30 text-xs ml-2">
              {status === 'camera_front' || status === 'countdown_front' ? 'Foto 1 de 2' : 'Foto 2 de 2'}
            </p>
          </div>

          {/* Action button */}
          {!isCounting && (
            <button
              type="button"
              onClick={() => beginCountdown(status === 'camera_front' ? 'front' : 'back')}
              className="w-full bg-gold text-primary py-3.5 text-xs tracking-[0.2em] uppercase hover:bg-gold/90 transition-colors"
            >
              {status === 'camera_front' ? 'Pronto — tirar foto de frente' : 'Pronto — tirar foto de costas'}
            </button>
          )}

          {isCounting && (
            <div className="w-full text-center text-offwhite/40 py-3.5 text-xs tracking-[0.2em] uppercase border border-gold/10">
              Capturando em {countdown > 0 ? countdown : '0'}…
            </div>
          )}

          <button
            type="button"
            onClick={reset}
            className="w-full text-offwhite/20 text-xs hover:text-offwhite/40 transition-colors py-1"
          >
            Cancelar
          </button>
        </div>
      )}

      {/* ── LOADING / ANALYZING ── */}
      {(status === 'loading' || status === 'analyzing') && (
        <div className="flex flex-col items-center justify-center py-16 space-y-4">
          <div className="w-6 h-6 border border-gold border-t-transparent rounded-full animate-spin" />
          <p className="text-offwhite/40 text-sm">
            {status === 'loading' ? 'Carregando modelo de detecção...' : 'Analisando proporções...'}
          </p>
          {status === 'loading' && (
            <p className="text-offwhite/20 text-xs text-center max-w-[220px]">
              Primeira análise pode levar alguns segundos
            </p>
          )}
        </div>
      )}

      {/* ── ERROR ── */}
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

      {/* ── RESULT ── */}
      {status === 'result' && result && (
        <div className="space-y-4">
          {/* Skeleton overlay canvas */}
          <div className="border border-gold/20 overflow-hidden bg-black/30 max-h-64 flex items-center justify-center">
            <canvas ref={canvasRef} className="max-h-64 w-full object-contain" style={{ imageRendering: 'auto' }} />
          </div>
          <div className="flex items-center gap-5 text-xs text-offwhite/30">
            <span className="flex items-center gap-1.5"><span className="inline-block w-5 h-0.5 bg-gold" /> Largura ombros</span>
            <span className="flex items-center gap-1.5"><span className="inline-block w-5 h-0.5 bg-emerald-400/70" /> Largura quadril</span>
          </div>

          {/* Size + shape summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="border border-gold/15 p-3 col-span-1">
              <p className="text-offwhite/30 text-xs mb-1">Tamanho</p>
              <p className="text-gold text-2xl font-light tracking-widest">{result.estimatedSize}</p>
            </div>
            <div className="border border-gold/15 p-3 col-span-2">
              <p className="text-offwhite/30 text-xs mb-1">Silhueta · {result.heightCategory}</p>
              <p className="text-offwhite text-sm">{SHAPE_LABEL[result.bodyShape] ?? result.bodyShape}</p>
            </div>
          </div>

          {/* ── Body diagram + measurements ── */}
          <div className="border border-gold/10 p-4">
            <p className="text-gold/50 text-xs tracking-widest uppercase mb-4">Suas medidas estimadas</p>

            <div className="flex gap-4">
              {/* SVG body avatar */}
              <div className="flex-shrink-0 w-[72px] self-stretch">
                <BodyDiagram />
              </div>

              {/* Main 4 measurements with BR average comparison */}
              <div className="flex-1 space-y-3 self-center">
                {([
                  { label: 'Ombros',  value: result.shoulderCm, avg: BR_AVERAGE.shoulder, note: 'largura' },
                  { label: 'Busto',   value: result.bustCm,     avg: BR_AVERAGE.bust,     note: 'circunf.' },
                  { label: 'Cintura', value: result.waistCm,    avg: BR_AVERAGE.waist,    note: 'circunf. est.' },
                  { label: 'Quadril', value: result.hipCm,      avg: BR_AVERAGE.hip,      note: 'circunf.' },
                ] as { label: string; value: number; avg: number; note: string }[]).map(({ label, value, avg, note }) => {
                  const diff = value - avg
                  const diffText = diff === 0 ? '= média' : diff > 0 ? `+${diff} cm` : `${diff} cm`
                  const diffColor = Math.abs(diff) <= 5 ? 'text-emerald-400/60' : Math.abs(diff) <= 12 ? 'text-amber-400/60' : 'text-offwhite/30'
                  return (
                    <div key={label}>
                      <div className="flex items-baseline justify-between mb-0.5">
                        <span className="text-offwhite/50 text-xs">{label}</span>
                        <span className="text-gold text-sm font-light tabular-nums">{value} cm</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-offwhite/20 text-[10px]">{note}</span>
                        <span className={`text-[10px] tabular-nums ${diffColor}`}>
                          {diffText} · média BR {avg} cm
                        </span>
                      </div>
                      {/* Mini comparison bar */}
                      <div className="mt-1 h-px bg-gold/8 relative">
                        <div
                          className="absolute top-0 h-px bg-gold/40"
                          style={{ width: `${Math.min(100, (value / (avg * 1.4)) * 100)}%` }}
                        />
                        {/* Average marker */}
                        <div
                          className="absolute top-[-2px] w-px h-[5px] bg-offwhite/25"
                          style={{ left: `${Math.min(100, (avg / (avg * 1.4)) * 100)}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Secondary measurements */}
            <div className="mt-4 pt-4 border-t border-gold/8 grid grid-cols-3 gap-3">
              {([
                { label: 'Torso',       value: result.torsoLengthCm, avg: BR_AVERAGE.torso,  unit: 'cm' },
                { label: 'Braço',       value: result.armLengthCm,   avg: BR_AVERAGE.arm,    unit: 'cm' },
                { label: 'Entrepernas', value: result.inseamCm,      avg: BR_AVERAGE.inseam, unit: 'cm' },
              ] as { label: string; value: number; avg: number; unit: string }[]).map(({ label, value, avg }) => (
                <div key={label} className="text-center">
                  <p className="text-offwhite/25 text-[10px] mb-1">{label}</p>
                  <p className="text-offwhite/70 text-sm tabular-nums">{value} cm</p>
                  <p className="text-offwhite/20 text-[10px] mt-0.5">BR: {avg} cm</p>
                </div>
              ))}
            </div>

            <p className="text-offwhite/15 text-[10px] mt-3 leading-relaxed">
              * Cintura é uma estimativa proporcional. Busto, quadril e entrepernas são calculados a partir de
              pontos de referência detectados pelo MediaPipe. Valores aproximados — use como guia inicial.
            </p>
          </div>

          {/* Confidence */}
          <div className="flex items-center gap-2">
            <span className={`text-xs px-2 py-0.5 border ${
              result.confidence === 'medium'
                ? 'border-amber-500/30 text-amber-400/70'
                : 'border-offwhite/10 text-offwhite/30'
            }`}>
              Confiança {result.confidence === 'medium' ? 'média' : 'baixa'}
            </span>
            <span className="text-offwhite/20 text-xs">Ombros detectados: {result.shoulderCm} cm</span>
          </div>

          <p className="text-offwhite/20 text-xs leading-relaxed">
            Estes dados serão combinados com suas medidas e preferências para recomendações mais precisas.
          </p>

          <div className="flex gap-3">
            <button type="button" onClick={handleAccept}
              className="flex-1 bg-gold text-primary py-3.5 text-xs tracking-[0.2em] uppercase hover:bg-gold/90 transition-colors">
              Usar estes dados
            </button>
            <button type="button" onClick={reset}
              className="px-5 border border-gold/20 text-offwhite/40 py-3.5 text-xs hover:text-offwhite transition-colors">
              Refazer
            </button>
          </div>
          <button type="button" onClick={onSkip}
            className="w-full text-offwhite/20 text-xs hover:text-offwhite/40 transition-colors py-1">
            Pular e continuar sem scan
          </button>
        </div>
      )}
    </div>
  )
}
