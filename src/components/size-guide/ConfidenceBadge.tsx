import { Confidence } from '@/lib/size-guide/types'

const CONFIG: Record<Confidence, { label: string; className: string }> = {
  high:   { label: 'Recomendação confiante',             className: 'border-emerald-500/40 text-emerald-400 bg-emerald-500/5' },
  medium: { label: 'Recomendação estimada',              className: 'border-amber-500/40 text-amber-400 bg-amber-500/5'   },
  low:    { label: 'Estimativa inicial',                 className: 'border-offwhite/20 text-offwhite/40 bg-offwhite/3'   },
}

export default function ConfidenceBadge({ confidence }: { confidence: Confidence }) {
  const { label, className } = CONFIG[confidence]
  return (
    <span className={`inline-block border px-2 py-0.5 text-xs tracking-wide ${className}`}>
      {label}
    </span>
  )
}
