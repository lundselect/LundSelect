'use client'

import { useRef, useState } from 'react'
import { BodyScanResult } from '@/app/api/body-scan/route'
import { FitPreferences, ShapeAnswers } from '@/lib/size-guide/types'

interface Props {
  onComplete: (shapeAnswers: Partial<ShapeAnswers>, prefs: Partial<FitPreferences>, sizeHint?: string) => void
  onSkip: () => void
}

type Status = 'idle' | 'preview' | 'scanning' | 'result' | 'error'

const SIZE_LABELS: Record<string, string> = {
  PP: 'PP (Extra Pequeno)',
  P:  'P (Pequeno)',
  M:  'M (Médio)',
  G:  'G (Grande)',
  GG: 'GG (Extra Grande)',
  XGG: 'XGG (3XL)',
}

const HEIGHT_LABELS: Record<string, string> = {
  petite:  'Baixa (até 1,63m)',
  regular: 'Média (1,63–1,73m)',
  tall:    'Alta (acima de 1,73m)',
}

const SHAPE_LABELS: Record<string, string> = {
  balanced:     'Proporcional',
  fuller_bust:  'Busto mais cheio',
  fuller_hips:  'Quadril mais largo',
  straight:     'Reto / tubular',
  curvy_waist:  'Cintura bem definida',
}

export default function Step2BodyScan({ onComplete, onSkip }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [imageBase64, setImageBase64] = useState<string | null>(null)
  const [mimeType, setMimeType] = useState<string>('image/jpeg')
  const [status, setStatus] = useState<Status>('idle')
  const [result, setResult] = useState<BodyScanResult | null>(null)
  const [errorMsg, setErrorMsg] = useState<string>('')

  const handleFile = (file: File) => {
    setMimeType(file.type || 'image/jpeg')
    const reader = new FileReader()
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string
      setPreview(dataUrl)
      // strip the data URL prefix to get raw base64
      setImageBase64(dataUrl.split(',')[1])
      setStatus('preview')
    }
    reader.readAsDataURL(file)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  const handleScan = async () => {
    if (!imageBase64) return
    setStatus('scanning')
    setErrorMsg('')

    try {
      const res = await fetch('/api/body-scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64, mimeType }),
      })
      const data = await res.json()

      if (data.error === 'unsuitable_image') {
        setErrorMsg('Não conseguimos identificar uma pessoa na foto. Tente uma foto de corpo inteiro com boa iluminação.')
        setStatus('error')
        return
      }
      if (data.error) {
        setErrorMsg('Ocorreu um erro na análise. Tente novamente.')
        setStatus('error')
        return
      }

      setResult(data)
      setStatus('result')
    } catch {
      setErrorMsg('Erro de conexão. Tente novamente.')
      setStatus('error')
    }
  }

  const handleAccept = () => {
    if (!result) return

    // Map body scan result → ShapeAnswers
    const shapeAnswers: Partial<ShapeAnswers> = {
      bust: result.bustProportion === 'fuller' ? 'fuller'
          : result.bustProportion === 'smaller' ? 'smaller'
          : 'proportional',
    }

    onComplete(shapeAnswers, {}, result.estimatedSize)
  }

  const confidenceColor =
    result?.confidence === 'high'   ? 'text-emerald-400' :
    result?.confidence === 'medium' ? 'text-amber-400'   :
                                      'text-offwhite/40'

  return (
    <div>
      <h2 className="text-offwhite text-xl font-light mb-2">Scan corporal</h2>
      <p className="text-offwhite/40 text-sm mb-6 leading-relaxed">
        Tire uma foto de corpo inteiro para estimar seu tamanho automaticamente.
        A imagem não é armazenada.
      </p>

      {/* Tips */}
      {(status === 'idle' || status === 'preview') && (
        <div className="border border-gold/10 p-4 mb-6 space-y-1.5">
          <p className="text-gold/60 text-xs tracking-widest uppercase mb-2">Dicas para melhor resultado</p>
          {[
            'Fique de pé, de frente para a câmera',
            'Use roupas justas ou leves (evite casacos volumosos)',
            'Boa iluminação e fundo neutro',
            'Foto de corpo inteiro — da cabeça aos pés',
          ].map((tip) => (
            <div key={tip} className="flex items-start gap-2">
              <span className="text-gold/40 text-xs mt-0.5">—</span>
              <p className="text-offwhite/40 text-xs leading-relaxed">{tip}</p>
            </div>
          ))}
        </div>
      )}

      {/* Upload / Camera */}
      {status === 'idle' && (
        <div className="space-y-3">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            capture="user"
            className="hidden"
            onChange={handleInputChange}
          />
          <button
            type="button"
            onClick={() => {
              if (inputRef.current) {
                inputRef.current.removeAttribute('capture')
                inputRef.current.setAttribute('capture', 'user')
                inputRef.current.click()
              }
            }}
            className="w-full bg-gold text-primary py-3.5 text-xs tracking-[0.2em] uppercase hover:bg-gold/90 transition-colors"
          >
            Tirar selfie de corpo inteiro
          </button>
          <button
            type="button"
            onClick={() => {
              if (inputRef.current) {
                inputRef.current.removeAttribute('capture')
                inputRef.current.click()
              }
            }}
            className="w-full border border-gold/30 text-gold py-3.5 text-xs tracking-[0.2em] uppercase hover:bg-gold/5 transition-colors"
          >
            Escolher foto da galeria
          </button>
          <button
            type="button"
            onClick={onSkip}
            className="w-full border border-gold/10 text-offwhite/30 py-3 text-xs tracking-widest uppercase hover:text-offwhite hover:border-gold/30 transition-colors"
          >
            Pular esta etapa
          </button>
        </div>
      )}

      {/* Preview */}
      {status === 'preview' && preview && (
        <div className="space-y-4">
          <div className="relative w-full max-h-72 overflow-hidden border border-gold/20">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="Preview" className="w-full h-full object-contain object-top" />
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleScan}
              className="flex-1 bg-gold text-primary py-3.5 text-xs tracking-[0.2em] uppercase hover:bg-gold/90 transition-colors"
            >
              Analisar foto
            </button>
            <button
              type="button"
              onClick={() => { setPreview(null); setImageBase64(null); setStatus('idle') }}
              className="px-5 border border-gold/20 text-offwhite/40 py-3.5 text-xs hover:text-offwhite transition-colors"
            >
              Refazer
            </button>
          </div>
          <button
            type="button"
            onClick={onSkip}
            className="w-full text-offwhite/25 text-xs hover:text-offwhite/50 transition-colors py-2"
          >
            Pular esta etapa
          </button>
        </div>
      )}

      {/* Scanning */}
      {status === 'scanning' && (
        <div className="flex flex-col items-center justify-center py-16 space-y-4">
          <div className="w-6 h-6 border border-gold border-t-transparent rounded-full animate-spin" />
          <p className="text-offwhite/40 text-sm">Analisando proporções...</p>
        </div>
      )}

      {/* Error */}
      {status === 'error' && (
        <div className="space-y-4">
          <div className="border border-red-500/20 bg-red-500/5 p-4">
            <p className="text-red-400 text-sm">{errorMsg}</p>
          </div>
          <button
            type="button"
            onClick={() => { setPreview(null); setImageBase64(null); setStatus('idle') }}
            className="w-full border border-gold/20 text-gold py-3 text-xs tracking-widest uppercase hover:bg-gold hover:text-primary transition-colors"
          >
            Tentar novamente
          </button>
          <button
            type="button"
            onClick={onSkip}
            className="w-full text-offwhite/25 text-xs hover:text-offwhite/50 transition-colors py-2"
          >
            Pular esta etapa
          </button>
        </div>
      )}

      {/* Result */}
      {status === 'result' && result && (
        <div className="space-y-4">
          <div className="border border-gold/15 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-gold/60 text-xs tracking-widest uppercase">Resultado da análise</p>
              <span className={`text-xs ${confidenceColor}`}>
                Confiança: {result.confidence === 'high' ? 'alta' : result.confidence === 'medium' ? 'média' : 'baixa'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="border border-gold/10 p-3">
                <p className="text-offwhite/30 text-xs mb-1">Tamanho estimado</p>
                <p className="text-gold text-xl font-light tracking-widest">{result.estimatedSize}</p>
                <p className="text-offwhite/25 text-xs mt-0.5">{SIZE_LABELS[result.estimatedSize] ?? result.estimatedSize}</p>
              </div>
              <div className="border border-gold/10 p-3">
                <p className="text-offwhite/30 text-xs mb-1">Altura estimada</p>
                <p className="text-offwhite text-sm font-light">{HEIGHT_LABELS[result.heightCategory] ?? result.heightCategory}</p>
              </div>
            </div>

            <div className="border border-gold/10 p-3">
              <p className="text-offwhite/30 text-xs mb-1">Silhueta detectada</p>
              <p className="text-offwhite text-sm">{SHAPE_LABELS[result.bodyShape] ?? result.bodyShape}</p>
            </div>

            {result.notes && (
              <p className="text-offwhite/30 text-xs italic leading-relaxed">{result.notes}</p>
            )}
          </div>

          <p className="text-offwhite/20 text-xs leading-relaxed">
            Esses dados serão usados para personalizar recomendações. Você poderá ajustá-los no questionário seguinte.
          </p>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleAccept}
              className="flex-1 bg-gold text-primary py-3.5 text-xs tracking-[0.2em] uppercase hover:bg-gold/90 transition-colors"
            >
              Usar esses dados
            </button>
            <button
              type="button"
              onClick={() => { setPreview(null); setImageBase64(null); setResult(null); setStatus('idle') }}
              className="px-5 border border-gold/20 text-offwhite/40 py-3.5 text-xs hover:text-offwhite transition-colors"
            >
              Refazer
            </button>
          </div>
          <button
            type="button"
            onClick={onSkip}
            className="w-full text-offwhite/25 text-xs hover:text-offwhite/50 transition-colors py-2"
          >
            Pular e continuar sem scan
          </button>
        </div>
      )}
    </div>
  )
}
