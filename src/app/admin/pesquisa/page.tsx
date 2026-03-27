'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface Response {
  id: string
  created_at: string
  location: string
  age: string
  gender: string
  frequency: string
  brand_count: string
  channels: string[]
  abandoned: string
  abandon_reasons: string[]
  instagram_rating: string
  shipping: string
  outfit_ease: string
  categories: string[]
  budget: string
  interest: string
  platform_features: string[]
  favorite_brands: string
  newsletter: string
  email: string
}

const PASSWORD = 'lundselect2026'

function tally(rows: Response[], key: keyof Response): Record<string, number> {
  const counts: Record<string, number> = {}
  rows.forEach(r => {
    const val = r[key]
    if (Array.isArray(val)) {
      val.forEach(v => { counts[v] = (counts[v] ?? 0) + 1 })
    } else if (val) {
      counts[val as string] = (counts[val as string] ?? 0) + 1
    }
  })
  return counts
}

function Bar({ label, count, total }: { label: string; count: number; total: number }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-offwhite/70">{label}</span>
        <span className="text-offwhite/40">{count} <span className="text-gold">({pct}%)</span></span>
      </div>
      <div className="h-1.5 bg-offwhite/10 w-full">
        <div className="h-full bg-gold transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-gold/10 p-6 space-y-4">
      <h3 className="text-offwhite/40 text-xs tracking-[0.25em] uppercase">{title}</h3>
      {children}
    </div>
  )
}

function Chart({ rows, field, total }: { rows: Response[]; field: keyof Response; total: number }) {
  const counts = tally(rows, field)
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1])
  if (sorted.length === 0) return <p className="text-offwhite/20 text-xs">Sem dados</p>
  return (
    <div className="space-y-3">
      {sorted.map(([label, count]) => (
        <Bar key={label} label={label} count={count} total={total} />
      ))}
    </div>
  )
}

export default function AdminPesquisaPage() {
  const [authed, setAuthed] = useState(false)
  const [pw, setPw] = useState('')
  const [pwError, setPwError] = useState(false)
  const [rows, setRows] = useState<Response[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!authed) return
    setLoading(true)
    supabase
      .from('survey_responses')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setRows((data as Response[]) ?? [])
        setLoading(false)
      })
  }, [authed])

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-sm space-y-4">
          <h1 className="text-offwhite text-2xl font-light tracking-wide text-center">Dashboard</h1>
          <input
            type="password"
            value={pw}
            onChange={e => setPw(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                if (pw === PASSWORD) setAuthed(true)
                else setPwError(true)
              }
            }}
            placeholder="Senha de acesso"
            className="w-full bg-offwhite/5 border border-gold/20 text-offwhite placeholder-offwhite/20 px-4 py-3 text-sm focus:outline-none focus:border-gold/60 transition-colors"
          />
          {pwError && <p className="text-red-400 text-xs">Senha incorreta</p>}
          <button
            onClick={() => { if (pw === PASSWORD) setAuthed(true); else setPwError(true) }}
            className="w-full bg-gold text-primary py-3 text-xs tracking-[0.2em] uppercase hover:bg-gold/90 transition-colors"
          >
            Entrar
          </button>
        </div>
      </div>
    )
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-4 h-4 border border-gold border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const total = rows.length
  const newsletterEmails = rows.filter(r => r.email).map(r => r.email)

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">

      {/* Header */}
      <div>
        <p className="text-gold/60 text-xs tracking-[0.3em] uppercase mb-2">Admin</p>
        <div className="flex items-end justify-between">
          <h1 className="text-offwhite text-3xl font-light tracking-wide">Resultados da Pesquisa</h1>
          <span className="text-offwhite/30 text-sm">{total} resposta{total !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {total === 0 ? (
        <p className="text-offwhite/30 text-sm">Nenhuma resposta ainda.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          <Section title="Onde moram">
            <Chart rows={rows} field="location" total={total} />
          </Section>

          <Section title="Faixa etária">
            <Chart rows={rows} field="age" total={total} />
          </Section>

          <Section title="Identidade de gênero">
            <Chart rows={rows} field="gender" total={total} />
          </Section>

          <Section title="Frequência de compras">
            <Chart rows={rows} field="frequency" total={total} />
          </Section>

          <Section title="Marcas compradas (últimos 6 meses)">
            <Chart rows={rows} field="brand_count" total={total} />
          </Section>

          <Section title="Canais de descoberta e compra">
            <Chart rows={rows} field="channels" total={total} />
          </Section>

          <Section title="Já abandonou uma compra?">
            <Chart rows={rows} field="abandoned" total={total} />
          </Section>

          <Section title="Motivos de abandono">
            <Chart rows={rows} field="abandon_reasons" total={total} />
          </Section>

          <Section title="Conveniência do Instagram (1–5)">
            <Chart rows={rows} field="instagram_rating" total={total} />
          </Section>

          <Section title="Expectativa de entrega">
            <Chart rows={rows} field="shipping" total={total} />
          </Section>

          <Section title="Facilidade de montar looks">
            <Chart rows={rows} field="outfit_ease" total={total} />
          </Section>

          <Section title="Categorias mais compradas">
            <Chart rows={rows} field="categories" total={total} />
          </Section>

          <Section title="Gasto típico por peça">
            <Chart rows={rows} field="budget" total={total} />
          </Section>

          <Section title="Usaria a Lund Select?">
            <Chart rows={rows} field="interest" total={total} />
          </Section>

          <Section title="O que mais importa na plataforma">
            <Chart rows={rows} field="platform_features" total={total} />
          </Section>

          <Section title="Quer receber novidades?">
            <Chart rows={rows} field="newsletter" total={total} />
          </Section>

          {/* Favorite brands — text list */}
          <Section title="Marcas brasileiras favoritas">
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {rows.filter(r => r.favorite_brands).map(r => (
                <p key={r.id} className="text-offwhite/60 text-sm border-b border-gold/10 pb-2">{r.favorite_brands}</p>
              ))}
            </div>
          </Section>

          {/* Newsletter emails */}
          <Section title={`E-mails para newsletter (${newsletterEmails.length})`}>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {newsletterEmails.length === 0
                ? <p className="text-offwhite/20 text-xs">Nenhum e-mail coletado ainda</p>
                : newsletterEmails.map((email, i) => (
                  <p key={i} className="text-gold text-sm">{email}</p>
                ))
              }
            </div>
          </Section>

        </div>
      )}
    </div>
  )
}
