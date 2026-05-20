'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { products as allProducts } from '@/lib/data'
import { Product } from '@/types'

interface Question {
  id: string
  question: string
  options: { label: string; value: string; emoji: string }[]
}

const questions: Question[] = [
  {
    id: 'vibe',
    question: 'Qual é o seu estilo de vida?',
    options: [
      { label: 'Urbana e moderna', value: 'urban', emoji: '🏙️' },
      { label: 'Praiana e descontraída', value: 'beach', emoji: '🌊' },
      { label: 'Clássica e elegante', value: 'classic', emoji: '✨' },
      { label: 'Aventureira e ativa', value: 'active', emoji: '🌿' },
    ],
  },
  {
    id: 'occasion',
    question: 'Para qual ocasião você mais se veste?',
    options: [
      { label: 'Dia a dia / trabalho', value: 'work', emoji: '💼' },
      { label: 'Saídas e eventos', value: 'events', emoji: '🥂' },
      { label: 'Praia e piscina', value: 'beach', emoji: '☀️' },
      { label: 'Casual / fim de semana', value: 'casual', emoji: '🛍️' },
    ],
  },
  {
    id: 'palette',
    question: 'Qual paleta de cores te representa?',
    options: [
      { label: 'Neutros e terrosos', value: 'neutral', emoji: '🤎' },
      { label: 'Vibrantes e coloridos', value: 'colorful', emoji: '🌈' },
      { label: 'Preto, branco e minimalista', value: 'minimal', emoji: '🖤' },
      { label: 'Pastéis e tons suaves', value: 'pastel', emoji: '🌸' },
    ],
  },
  {
    id: 'fit',
    question: 'Como você prefere o caimento das peças?',
    options: [
      { label: 'Justo e valoriza o corpo', value: 'fitted', emoji: '🔥' },
      { label: 'Oversized e confortável', value: 'loose', emoji: '😌' },
      { label: 'Fluido e elegante', value: 'flowy', emoji: '🌬️' },
      { label: 'Estruturado e sofisticado', value: 'structured', emoji: '💎' },
    ],
  },
]

// Map answers to product categories/keywords
function getRecommendations(answers: Record<string, string>): Product[] {
  const scored = allProducts.map((p) => {
    let score = 0
    const cat = p.category.toLowerCase()
    const name = p.name.toLowerCase()

    // Vibe scoring
    if (answers.vibe === 'beach' && (cat.includes('swim') || cat.includes('praia') || cat.includes('beachwear') || name.includes('swim') || name.includes('biquíni') || name.includes('maiô'))) score += 3
    if (answers.vibe === 'urban' && (cat.includes('vest') || cat.includes('blusa') || cat.includes('calça') || cat.includes('jaqueta'))) score += 2
    if (answers.vibe === 'classic' && (cat.includes('vest') || cat.includes('vestido') || cat.includes('saia'))) score += 2
    if (answers.vibe === 'active' && (cat.includes('sport') || cat.includes('moletom') || name.includes('top') || name.includes('legging'))) score += 2

    // Occasion scoring
    if (answers.occasion === 'beach' && (cat.includes('swim') || cat.includes('praia') || cat.includes('beachwear'))) score += 3
    if (answers.occasion === 'events' && (cat.includes('vest') || cat.includes('vestido') || cat.includes('saia'))) score += 2
    if (answers.occasion === 'casual' && (cat.includes('moletom') || cat.includes('blusa') || cat.includes('calça'))) score += 2
    if (answers.occasion === 'work' && (cat.includes('blusa') || cat.includes('vest') || cat.includes('calça'))) score += 2

    // New items get a small boost
    if (p.isNew) score += 1
    if (p.inStock !== false) score += 1

    return { product: p, score }
  })

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score || Math.random() - 0.5)
    .slice(0, 8)
    .map((s) => s.product)
}

export default function QuizClient() {
  const [step, setStep] = useState<'intro' | number | 'result'>('intro')
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [selected, setSelected] = useState<string | null>(null)
  const [recommendations, setRecommendations] = useState<Product[]>([])

  const currentQuestion = typeof step === 'number' ? questions[step] : null

  const handleOptionClick = (value: string) => {
    setSelected(value)
  }

  const handleNext = () => {
    if (!selected || !currentQuestion) return
    const newAnswers = { ...answers, [currentQuestion.id]: selected }
    setAnswers(newAnswers)
    setSelected(null)

    if (typeof step === 'number' && step < questions.length - 1) {
      setStep(step + 1)
    } else {
      const recs = getRecommendations(newAnswers)
      setRecommendations(recs)
      setStep('result')
    }
  }

  const handleBack = () => {
    if (typeof step === 'number' && step > 0) {
      setStep(step - 1)
      setSelected(answers[questions[step - 1].id] ?? null)
    } else if (typeof step === 'number' && step === 0) {
      setStep('intro')
      setSelected(null)
    }
  }

  const restart = () => {
    setStep('intro')
    setAnswers({})
    setSelected(null)
    setRecommendations([])
  }

  if (step === 'intro') {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4">
        <p className="text-gold/60 text-xs tracking-[0.4em] uppercase mb-6">Exclusivo Lund Select</p>
        <h1 className="text-offwhite text-4xl sm:text-5xl font-light leading-tight mb-4 max-w-lg">
          Descubra seu<br /><span className="text-gold">estilo pessoal</span>
        </h1>
        <p className="text-offwhite/40 text-sm leading-relaxed max-w-sm mb-10">
          Responda 4 perguntas e receba uma curadoria personalizada das nossas marcas favoritas, feita para você.
        </p>
        <button
          onClick={() => setStep(0)}
          className="bg-gold text-primary px-12 py-4 text-xs tracking-[0.2em] uppercase hover:bg-gold/90 transition-colors"
        >
          Começar o quiz
        </button>
        <p className="text-offwhite/20 text-xs mt-6">Apenas 4 perguntas · Resultado imediato</p>
      </div>
    )
  }

  if (step === 'result') {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <p className="text-gold/60 text-xs tracking-[0.4em] uppercase mb-4">Sua curadoria</p>
          <h2 className="text-offwhite text-3xl sm:text-4xl font-light mb-4">
            Selecionamos {recommendations.length} peças para você
          </h2>
          <p className="text-offwhite/40 text-sm max-w-md mx-auto">
            Baseado nas suas respostas, esses são os produtos que mais combinam com o seu estilo.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10 mb-16">
          {recommendations.map((product) => (
            <Link key={product.id} href={`/produtos/${product.slug}`} className="group block">
              <div className="aspect-[3/4] bg-offwhite/5 border border-gold/10 overflow-hidden relative mb-3">
                {product.image ? (
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-gold/20 text-xs tracking-widest uppercase">{product.brand}</span>
                  </div>
                )}
                {product.isNew && (
                  <span className="absolute top-2 left-2 bg-gold text-primary text-[9px] tracking-widest uppercase px-2 py-0.5 z-10">
                    Novidade
                  </span>
                )}
              </div>
              <p className="text-offwhite/40 text-xs tracking-widest uppercase mb-1">{product.brand}</p>
              <p className="text-offwhite text-sm leading-snug mb-1 group-hover:text-gold transition-colors">{product.name}</p>
              <p className="text-gold text-sm font-medium">
                R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </Link>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/produtos"
            className="border border-gold text-gold hover:bg-gold hover:text-primary px-10 py-3.5 text-xs tracking-[0.2em] uppercase transition-all duration-300 text-center"
          >
            Ver todos os produtos
          </Link>
          <button
            onClick={restart}
            className="border border-gold/30 text-offwhite/40 hover:border-gold/60 hover:text-offwhite/70 px-10 py-3.5 text-xs tracking-[0.2em] uppercase transition-all duration-300"
          >
            Refazer o quiz
          </button>
        </div>
      </div>
    )
  }

  if (!currentQuestion) return null

  const progress = ((typeof step === 'number' ? step : 0) / questions.length) * 100

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-16">
      {/* Progress */}
      <div className="w-full max-w-lg mb-12">
        <div className="flex justify-between text-xs text-offwhite/30 tracking-widest uppercase mb-3">
          <span>Pergunta {(typeof step === 'number' ? step : 0) + 1} de {questions.length}</span>
          <button onClick={handleBack} className="hover:text-offwhite/60 transition-colors">
            ← Voltar
          </button>
        </div>
        <div className="h-px bg-gold/10 w-full">
          <div
            className="h-px bg-gold transition-all duration-500"
            style={{ width: `${progress + (100 / questions.length)}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="w-full max-w-lg">
        <h2 className="text-offwhite text-2xl sm:text-3xl font-light text-center mb-10">
          {currentQuestion.question}
        </h2>

        <div className="grid grid-cols-2 gap-3 mb-10">
          {currentQuestion.options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleOptionClick(opt.value)}
              className={`p-5 border text-left transition-all duration-200 group ${
                selected === opt.value
                  ? 'border-gold bg-gold/10 text-offwhite'
                  : 'border-gold/20 text-offwhite/60 hover:border-gold/50 hover:text-offwhite/90 hover:bg-offwhite/3'
              }`}
            >
              <span className="text-2xl block mb-2">{opt.emoji}</span>
              <span className="text-sm leading-snug">{opt.label}</span>
            </button>
          ))}
        </div>

        <button
          onClick={handleNext}
          disabled={!selected}
          className={`w-full py-4 text-xs tracking-[0.2em] uppercase transition-all duration-200 ${
            selected
              ? 'bg-gold text-primary hover:bg-gold/90'
              : 'bg-offwhite/5 text-offwhite/20 cursor-not-allowed'
          }`}
        >
          {typeof step === 'number' && step === questions.length - 1 ? 'Ver minha curadoria →' : 'Próxima →'}
        </button>
      </div>
    </div>
  )
}
