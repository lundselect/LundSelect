'use client'

import { useState } from 'react'
import { FitPreference, FitPreferences, ShapeAnswers } from '@/lib/size-guide/types'

interface Props {
  initialAnswers?: Partial<ShapeAnswers>
  initialPrefs?: Partial<FitPreferences>
  onComplete: (answers: Partial<ShapeAnswers>, prefs: Partial<FitPreferences>) => void
  onSkip: () => void
}

const FIT_OPTIONS: { value: FitPreference; label: string }[] = [
  { value: 'very_fitted', label: 'Muito justo' },
  { value: 'fitted',      label: 'Justo'       },
  { value: 'regular',     label: 'Regular'     },
  { value: 'relaxed',     label: 'Solto'       },
  { value: 'oversized',   label: 'Oversized'   },
]

function OptionRow<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: { value: T; label: string }[]
  value?: T
  onChange: (v: T | undefined) => void
}) {
  return (
    <div className="space-y-2">
      <p className="text-offwhite/50 text-xs tracking-widest uppercase">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map(opt => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`px-3 py-1.5 text-xs border transition-colors ${
              value === opt.value
                ? 'border-gold bg-gold/10 text-gold'
                : 'border-gold/20 text-offwhite/50 hover:border-gold/40 hover:text-offwhite'
            }`}
          >
            {opt.label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => onChange(undefined)}
          className={`px-3 py-1.5 text-xs border transition-colors ${
            !value
              ? 'border-gold/40 text-offwhite/40'
              : 'border-gold/10 text-offwhite/20 hover:border-gold/20'
          }`}
        >
          Prefiro não dizer
        </button>
      </div>
    </div>
  )
}

export default function Step3Questionnaire({ initialAnswers, initialPrefs, onComplete, onSkip }: Props) {
  const [answers, setAnswers] = useState<Partial<ShapeAnswers>>(initialAnswers ?? {})
  const [prefs, setPrefs] = useState<Partial<FitPreferences>>(initialPrefs ?? {})

  const set = <K extends keyof ShapeAnswers>(key: K, value: ShapeAnswers[K] | undefined) =>
    setAnswers(a => value === undefined ? { ...a, [key]: undefined } : { ...a, [key]: value })

  const setPref = (key: keyof FitPreferences, value: FitPreference | undefined) =>
    setPrefs(p => value === undefined ? { ...p, [key]: undefined } : { ...p, [key]: value })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onComplete(answers, prefs)
  }

  return (
    <div>
      <h2 className="text-offwhite text-xl font-light mb-2">Como você gosta de vestir</h2>
      <p className="text-offwhite/40 text-sm mb-6 leading-relaxed">
        Todas as perguntas são opcionais. Responda só o que fizer sentido para você.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Shape */}
        <div className="border border-gold/10 p-5 space-y-5">
          <p className="text-gold text-xs tracking-[0.3em] uppercase">Proporções</p>

          <OptionRow
            label="Busto em relação ao corpo"
            options={[
              { value: 'fuller',      label: 'Cheio'         },
              { value: 'proportional', label: 'Proporcional' },
              { value: 'smaller',     label: 'Menor'         },
            ]}
            value={answers.bust}
            onChange={v => set('bust', v)}
          />

          <OptionRow
            label="Comprimento do torso"
            options={[
              { value: 'long',    label: 'Longo'   },
              { value: 'average', label: 'Médio'   },
              { value: 'short',   label: 'Curto'   },
            ]}
            value={answers.torsoLength}
            onChange={v => set('torsoLength', v)}
          />

          <OptionRow
            label="Comprimento dos braços"
            options={[
              { value: 'too_long',   label: 'Mangas sempre longas demais' },
              { value: 'just_right', label: 'Geralmente certo'            },
              { value: 'too_short',  label: 'Mangas sempre curtas demais' },
            ]}
            value={answers.armLength}
            onChange={v => set('armLength', v)}
          />
        </div>

        {/* Fit preferences per category */}
        <div className="border border-gold/10 p-5 space-y-5">
          <p className="text-gold text-xs tracking-[0.3em] uppercase">Preferência de caimento</p>
          <p className="text-offwhite/30 text-xs">Como você prefere que cada tipo de peça caía no seu corpo?</p>

          {([
            { key: 'tops',      label: 'Blusas e tops'    },
            { key: 'bottoms',   label: 'Calças e shorts'  },
            { key: 'dresses',   label: 'Vestidos'         },
            { key: 'outerwear', label: 'Casacos e jaquetas' },
          ] as const).map(({ key, label }) => (
            <OptionRow
              key={key}
              label={label}
              options={FIT_OPTIONS}
              value={prefs[key]}
              onChange={v => setPref(key, v)}
            />
          ))}
        </div>

        {/* Common fit issues */}
        <div className="border border-gold/10 p-5 space-y-3">
          <p className="text-gold text-xs tracking-[0.3em] uppercase">Problemas comuns</p>
          <p className="text-offwhite/30 text-xs mb-1">Selecione os que se aplicam</p>
          {([
            { value: 'gapes_bust',     label: 'Abre no busto'               },
            { value: 'tight_hips',     label: 'Aperta no quadril'           },
            { value: 'loose_waist',    label: 'Folgado na cintura'          },
            { value: 'tight_shoulders', label: 'Aperta nos ombros'          },
            { value: 'too_long',       label: 'Peça fica comprida demais'   },
            { value: 'too_short',      label: 'Peça fica curta demais'      },
            { value: 'sleeves_wrong',  label: 'Mangas no tamanho errado'    },
            { value: 'none',           label: 'Nenhum dos anteriores'       },
          ] as const).map(({ value, label }) => {
            const issues = answers.fitIssues ?? []
            const checked = issues.includes(value)
            return (
              <button
                key={value}
                type="button"
                onClick={() => {
                  if (value === 'none') {
                    set('fitIssues', checked ? [] : ['none'])
                    return
                  }
                  const next = checked
                    ? issues.filter(i => i !== value)
                    : [...issues.filter(i => i !== 'none'), value]
                  set('fitIssues', next.length ? (next as ShapeAnswers['fitIssues']) : undefined)
                }}
                className={`w-full text-left flex items-center gap-3 px-3 py-2 border text-sm transition-colors ${
                  checked
                    ? 'border-gold/40 text-offwhite bg-gold/5'
                    : 'border-gold/10 text-offwhite/50 hover:border-gold/20 hover:text-offwhite/70'
                }`}
              >
                <span className={`w-4 h-4 border flex-shrink-0 flex items-center justify-center text-xs ${checked ? 'border-gold bg-gold text-primary' : 'border-gold/30'}`}>
                  {checked && '✓'}
                </span>
                {label}
              </button>
            )
          })}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            type="submit"
            className="flex-1 bg-gold text-primary py-3.5 text-xs tracking-[0.2em] uppercase hover:bg-gold/90 transition-colors"
          >
            Finalizar perfil
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
