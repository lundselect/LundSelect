'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { Product } from '@/types'
import { Recommendation, SizeProfile } from '@/lib/size-guide/types'
import { extractGarmentSignals } from '@/lib/size-guide/extraction/extractGarmentSignals'
import { recommend } from '@/lib/size-guide/recommender'
import { loadProfile } from '@/lib/size-guide/storage'
import ConfidenceBadge from '@/components/size-guide/ConfidenceBadge'

interface Props {
  product: Product
}

export default function RecommendedSizeBadge({ product }: Props) {
  const { user, isLoading } = useAuth()
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null)
  const [profile, setProfile] = useState<SizeProfile | null>(null)
  const [showWhy, setShowWhy] = useState(false)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (isLoading) return

    const run = async () => {
      const p = await loadProfile(user?.id ?? null)
      setProfile(p)

      if (!p) {
        setLoaded(true)
        return
      }

      const fitMeta = extractGarmentSignals(product)
      const rec = recommend(p, fitMeta)
      setRecommendation(rec)
      setLoaded(true)
    }

    run()
  }, [user, isLoading, product])

  if (!loaded) return null

  // No profile — show CTA
  if (!profile) {
    return (
      <div className="mb-6 border border-gold/15 p-4 flex items-center justify-between gap-4">
        <div>
          <p className="text-offwhite/60 text-sm">Descubra seu tamanho</p>
          <p className="text-offwhite/30 text-xs mt-0.5">Crie seu perfil para recomendações personalizadas</p>
        </div>
        <Link
          href="/conta/tamanhos/criar"
          className="flex-shrink-0 border border-gold/40 text-gold text-xs tracking-widest uppercase px-4 py-2 hover:bg-gold hover:text-primary transition-colors"
        >
          Criar perfil
        </Link>
      </div>
    )
  }

  // Profile exists but no recommendation (category not covered)
  if (!recommendation) return null

  const confidenceColor =
    recommendation.confidence === 'high'   ? 'border-emerald-500/30 bg-emerald-500/5' :
    recommendation.confidence === 'medium' ? 'border-amber-500/30 bg-amber-500/5'     :
                                             'border-offwhite/15'

  return (
    <div className={`mb-6 border ${confidenceColor} p-4 space-y-3`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-offwhite/40 text-xs tracking-widest uppercase mb-1">Recomendado para você</p>
          <p className="text-offwhite text-2xl font-light tracking-widest">
            {recommendation.recommendedSize}
          </p>
          {recommendation.alternativeSize && (
            <p className="text-offwhite/30 text-xs mt-0.5">
              Alternativa: {recommendation.alternativeSize}
            </p>
          )}
        </div>
        <ConfidenceBadge confidence={recommendation.confidence} />
      </div>

      {/* Why */}
      <button
        onClick={() => setShowWhy(v => !v)}
        className="text-gold/50 text-xs tracking-wide hover:text-gold transition-colors"
      >
        {showWhy ? 'Fechar' : 'Por que essa recomendação?'}
      </button>

      {showWhy && (
        <div className="border-t border-gold/10 pt-3 space-y-2">
          <p className="text-offwhite/50 text-xs leading-relaxed">{recommendation.reasoning}</p>
          {recommendation.dataQualityNote && (
            <p className="text-offwhite/30 text-xs italic">{recommendation.dataQualityNote}</p>
          )}
          <Link
            href="/conta/tamanhos"
            className="text-gold/40 text-xs hover:text-gold transition-colors inline-block mt-1"
          >
            Editar meu perfil →
          </Link>
        </div>
      )}
    </div>
  )
}
