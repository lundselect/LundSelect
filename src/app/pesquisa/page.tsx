'use client'

import { useState } from 'react'
import Link from 'next/link'

type Step = number
const TOTAL_STEPS = 17

const inputCls = 'w-full bg-offwhite/5 border border-gold/20 text-offwhite placeholder-offwhite/20 px-4 py-3 text-sm focus:outline-none focus:border-gold/60 transition-colors'
const optionCls = (active: boolean) =>
  `w-full text-left px-4 py-3 text-sm border transition-colors ${active ? 'border-gold bg-gold/10 text-gold' : 'border-gold/20 text-offwhite/60 hover:border-gold/40 hover:text-offwhite'}`

export default function PesquisaPage() {
  const [step, setStep] = useState<Step>(0) // 0 = intro
  const [done, setDone] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [location, setLocation] = useState('')
  const [locationOther, setLocationOther] = useState('')
  const [age, setAge] = useState('')
  const [gender, setGender] = useState('')
  const [frequency, setFrequency] = useState('')
  const [brandCount, setBrandCount] = useState('')
  const [channels, setChannels] = useState<string[]>([])
  const [abandoned, setAbandoned] = useState('')
  const [abandonReasons, setAbandonReasons] = useState<string[]>([])
  const [instagramRating, setInstagramRating] = useState('')
  const [shipping, setShipping] = useState('')
  const [outfitEase, setOutfitEase] = useState('')
  const [categories, setCategories] = useState<string[]>([])
  const [budget, setBudget] = useState('')
  const [interest, setInterest] = useState('')
  const [platformFeatures, setPlatformFeatures] = useState<string[]>([])
  const [favoriteBrands, setFavoriteBrands] = useState('')
  const [newsletter, setNewsletter] = useState('')
  const [email, setEmail] = useState('')

  const toggle = (list: string[], setList: (v: string[]) => void, val: string, max?: number) => {
    if (list.includes(val)) setList(list.filter(v => v !== val))
    else if (!max || list.length < max) setList([...list, val])
  }

  const next = () => setStep(s => Math.min(s + 1, TOTAL_STEPS))
  const back = () => setStep(s => Math.max(s - 1, 1))

  const canAdvance = () => {
    if (step === 1) return !!location
    if (step === 2) return !!age
    if (step === 3) return !!gender
    if (step === 4) return !!frequency
    if (step === 5) return !!brandCount
    if (step === 6) return channels.length > 0
    if (step === 7) return !!abandoned
    if (step === 8) return abandoned === 'Não' || abandonReasons.length > 0
    if (step === 9) return !!instagramRating
    if (step === 10) return !!shipping
    if (step === 11) return !!outfitEase
    if (step === 12) return categories.length > 0
    if (step === 13) return !!budget
    if (step === 14) return !!interest
    if (step === 15) return platformFeatures.length > 0
    if (step === 16) return !!favoriteBrands
    if (step === 17) return !!newsletter
    return true
  }

  const submit = async () => {
    setSubmitting(true)
    await fetch('/api/pesquisa', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location: location === 'Outro' ? locationOther : location,
        age, gender, frequency, brandCount, channels,
        abandoned, abandonReasons, instagramRating, shipping,
        outfitEase, categories, budget, interest, platformFeatures,
        favoriteBrands, newsletter, email,
      }),
    })
    setSubmitting(false)
    setDone(true)
  }

  const progress = step === 0 ? 0 : Math.round((step / TOTAL_STEPS) * 100)

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center space-y-6">
          <p className="text-gold/60 text-xs tracking-[0.3em] uppercase">Obrigada</p>
          <h1 className="text-offwhite text-3xl font-light tracking-wide">Suas respostas foram enviadas</h1>
          <p className="text-offwhite/40 text-sm leading-relaxed">
            Sua opinião é essencial para construirmos a melhor experiência de moda curada do Brasil. Muito obrigada por participar.
          </p>
          <Link href="/" className="inline-block mt-4 text-gold text-xs tracking-widest uppercase border border-gold/30 px-8 py-3 hover:border-gold transition-colors">
            Voltar ao início
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg">

        {/* Intro */}
        {step === 0 && (
          <div className="space-y-8">
            <div>
              <p className="text-gold/60 text-xs tracking-[0.3em] uppercase mb-3">Pesquisa</p>
              <h1 className="text-offwhite text-3xl font-light tracking-wide mb-4">Queremos te ouvir</h1>
              <p className="text-offwhite/50 text-sm leading-relaxed">
                Estamos construindo a Lund Select — uma plataforma de moda curada que conecta mulheres a marcas brasileiras independentes e sofisticadas. Leva menos de 5 minutos e sua opinião moldará diretamente o que estamos criando.
              </p>
            </div>
            <div className="border border-gold/10 p-6 space-y-3">
              {[
                '17 perguntas rápidas',
                'Totalmente anônimo',
                'Menos de 5 minutos',
              ].map(t => (
                <div key={t} className="flex items-center gap-3">
                  <div className="w-1 h-1 bg-gold rounded-full flex-shrink-0" />
                  <p className="text-offwhite/50 text-sm">{t}</p>
                </div>
              ))}
            </div>
            <button onClick={next} className="w-full bg-gold text-primary py-4 text-xs tracking-[0.2em] uppercase hover:bg-gold/90 transition-colors">
              Começar
            </button>
          </div>
        )}

        {/* Progress + questions */}
        {step > 0 && (
          <div className="space-y-8">
            {/* Progress bar */}
            <div>
              <div className="flex justify-between text-xs text-offwhite/30 mb-2">
                <span>{step} de {TOTAL_STEPS}</span>
                <span>{progress}%</span>
              </div>
              <div className="h-px bg-offwhite/10 w-full">
                <div className="h-full bg-gold transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
            </div>

            {/* Q1 */}
            {step === 1 && (
              <Question title="Onde você mora?">
                {['São Paulo — Capital', 'Rio de Janeiro — Capital', 'Interior de São Paulo', 'Outro'].map(o => (
                  <button key={o} onClick={() => setLocation(o)} className={optionCls(location === o)}>{o}</button>
                ))}
                {location === 'Outro' && (
                  <input autoFocus className={inputCls + ' mt-2'} placeholder="Sua cidade e estado" value={locationOther} onChange={e => setLocationOther(e.target.value)} />
                )}
              </Question>
            )}

            {/* Q2 */}
            {step === 2 && (
              <Question title="Qual é a sua faixa etária?">
                {['Menos de 18', '18–21', '22–25', '26–30', '31–35', '36–40', '41–50', '51 ou mais'].map(o => (
                  <button key={o} onClick={() => setAge(o)} className={optionCls(age === o)}>{o}</button>
                ))}
              </Question>
            )}

            {/* Q3 */}
            {step === 3 && (
              <Question title="Como você se identifica?">
                {['Feminino', 'Masculino', 'Não-binário', 'Prefiro não responder'].map(o => (
                  <button key={o} onClick={() => setGender(o)} className={optionCls(gender === o)}>{o}</button>
                ))}
              </Question>
            )}

            {/* Q4 */}
            {step === 4 && (
              <Question title="Com que frequência você compra roupas ou acessórios?">
                {['Uma vez por mês ou mais', 'A cada 2 ou 3 meses', 'Algumas vezes por ano', 'Raramente'].map(o => (
                  <button key={o} onClick={() => setFrequency(o)} className={optionCls(frequency === o)}>{o}</button>
                ))}
              </Question>
            )}

            {/* Q5 */}
            {step === 5 && (
              <Question title="Quantas marcas diferentes você comprou nos últimos 6 meses?">
                {['Apenas 1', '2 a 3 marcas', '4 ou mais marcas', 'Nenhuma'].map(o => (
                  <button key={o} onClick={() => setBrandCount(o)} className={optionCls(brandCount === o)}>{o}</button>
                ))}
              </Question>
            )}

            {/* Q6 */}
            {step === 6 && (
              <Question title="Onde você costuma descobrir e comprar marcas novas?" hint="Selecione todas que se aplicam">
                {['Loja física', 'Site da própria marca', 'Instagram ou WhatsApp', 'Plataformas multi-marcas (Farfetch, Shop2Gether, Dafiti)', 'Brechós ou plataformas de revenda'].map(o => (
                  <button key={o} onClick={() => toggle(channels, setChannels, o)} className={optionCls(channels.includes(o))}>{o}</button>
                ))}
              </Question>
            )}

            {/* Q7 */}
            {step === 7 && (
              <Question title="Você já desistiu de uma compra por conta de uma experiência frustrante?">
                {['Sim', 'Não', 'Não tenho certeza'].map(o => (
                  <button key={o} onClick={() => setAbandoned(o)} className={optionCls(abandoned === o)}>{o}</button>
                ))}
              </Question>
            )}

            {/* Q8 */}
            {step === 8 && (
              <Question
                title="O que levou você a desistir da compra?"
                hint={abandoned === 'Não' ? 'Pule esta pergunta se não se aplica' : 'Selecione todas que se aplicam'}
              >
                {['Muitas etapas para chegar ao produto', 'Navegação confusa ou pouco intuitiva', 'Tabela de medidas inadequada ou imprecisa', 'Demora no atendimento da marca', 'Frete caro ou prazo longo demais', 'Política de trocas e devoluções complicada'].map(o => (
                  <button key={o} onClick={() => toggle(abandonReasons, setAbandonReasons, o)} className={optionCls(abandonReasons.includes(o))}>{o}</button>
                ))}
              </Question>
            )}

            {/* Q9 */}
            {step === 9 && (
              <Question title="Quão conveniente você considera comprar diretamente pelo Instagram?" hint="1 = muito inconveniente · 5 = muito conveniente">
                <div className="flex gap-2">
                  {['1', '2', '3', '4', '5'].map(o => (
                    <button key={o} onClick={() => setInstagramRating(o)} className={`flex-1 py-4 text-sm border transition-colors ${instagramRating === o ? 'border-gold bg-gold/10 text-gold' : 'border-gold/20 text-offwhite/60 hover:border-gold/40 hover:text-offwhite'}`}>{o}</button>
                  ))}
                </div>
              </Question>
            )}

            {/* Q10 */}
            {step === 10 && (
              <Question title="Qual é a sua expectativa em relação ao prazo de entrega?">
                {['Essencial — quero receber em 1 a 2 dias', 'Importante — aceito até 5 dias úteis', 'Flexível — o prazo não é prioridade para mim', 'Não levo o prazo em conta'].map(o => (
                  <button key={o} onClick={() => setShipping(o)} className={optionCls(shipping === o)}>{o}</button>
                ))}
              </Question>
            )}

            {/* Q11 */}
            {step === 11 && (
              <Question title="Com que facilidade você consegue montar looks completos para ocasiões específicas?">
                {['Muito fácil — tenho tudo o que preciso', 'Relativamente fácil', 'Relativamente difícil', 'Muito difícil — sinto falta de curadoria e inspiração'].map(o => (
                  <button key={o} onClick={() => setOutfitEase(o)} className={optionCls(outfitEase === o)}>{o}</button>
                ))}
              </Question>
            )}

            {/* Q12 */}
            {step === 12 && (
              <Question title="Quais categorias você mais compra?" hint="Selecione até 3">
                {['Blusas e tops', 'Calças e shorts', 'Vestidos e macacões', 'Básicos do dia a dia', 'Beachwear e resortwear', 'Sapatos e calçados', 'Acessórios e joias', 'Bolsas'].map(o => (
                  <button key={o} onClick={() => toggle(categories, setCategories, o, 3)} className={optionCls(categories.includes(o))}>{o}</button>
                ))}
              </Question>
            )}

            {/* Q13 */}
            {step === 13 && (
              <Question title="Qual é o seu investimento típico por peça de roupa?">
                {['Até R$200', 'R$200 a R$500', 'R$500 a R$1.000', 'Acima de R$1.000'].map(o => (
                  <button key={o} onClick={() => setBudget(o)} className={optionCls(budget === o)}>{o}</button>
                ))}
              </Question>
            )}

            {/* Q14 */}
            {step === 14 && (
              <Question title="Você usaria uma plataforma como a Lund Select — curadoria de marcas brasileiras independentes, tudo em um só lugar?">
                {['Sim, com certeza', 'Talvez, dependendo das marcas', 'Provavelmente não'].map(o => (
                  <button key={o} onClick={() => setInterest(o)} className={optionCls(interest === o)}>{o}</button>
                ))}
              </Question>
            )}

            {/* Q15 */}
            {step === 15 && (
              <Question title="O que seria mais importante para você em uma plataforma assim?" hint="Selecione até 2">
                {['Curadoria refinada e personalizada', 'Sugestões de looks prontos por ocasião', 'Acesso fácil a várias marcas em um só lugar', 'Entrega rápida e confiável', 'Trocas e devoluções simples', 'Experiência de navegação elegante e intuitiva'].map(o => (
                  <button key={o} onClick={() => toggle(platformFeatures, setPlatformFeatures, o, 2)} className={optionCls(platformFeatures.includes(o))}>{o}</button>
                ))}
              </Question>
            )}

            {/* Q16 */}
            {step === 16 && (
              <Question title="Quais marcas brasileiras você admira ou acompanha?" hint="Pode citar até 3">
                <textarea
                  autoFocus
                  rows={3}
                  value={favoriteBrands}
                  onChange={e => setFavoriteBrands(e.target.value)}
                  className={inputCls + ' resize-none'}
                  placeholder="Ex: Farm, Animale, Lenny Niemeyer..."
                />
              </Question>
            )}

            {/* Q17 */}
            {step === 17 && (
              <Question title="Quer receber novidades sobre o lançamento da Lund Select?">
                {['Sim, me avise quando lançar', 'Não por agora'].map(o => (
                  <button key={o} onClick={() => setNewsletter(o)} className={optionCls(newsletter === o)}>{o}</button>
                ))}
                {newsletter === 'Sim, me avise quando lançar' && (
                  <input
                    autoFocus
                    type="email"
                    className={inputCls + ' mt-2'}
                    placeholder="seu@email.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                )}
              </Question>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between pt-2">
              <button onClick={back} className="text-offwhite/30 hover:text-offwhite text-xs tracking-widest uppercase transition-colors">
                ← Voltar
              </button>
              {step < TOTAL_STEPS ? (
                <button
                  onClick={next}
                  disabled={!canAdvance()}
                  className="bg-gold text-primary px-10 py-3 text-xs tracking-[0.2em] uppercase hover:bg-gold/90 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Continuar
                </button>
              ) : (
                <button
                  onClick={submit}
                  disabled={!canAdvance() || submitting}
                  className="bg-gold text-primary px-10 py-3 text-xs tracking-[0.2em] uppercase hover:bg-gold/90 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Enviando...' : 'Enviar'}
                </button>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

function Question({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-offwhite text-xl font-light leading-snug">{title}</h2>
        {hint && <p className="text-offwhite/30 text-xs mt-1">{hint}</p>}
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  )
}
