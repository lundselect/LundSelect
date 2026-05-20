import Link from 'next/link'
import { Confidence, SizeProfile } from '@/lib/size-guide/types'
import ConfidenceBadge from './ConfidenceBadge'

const CONFIDENCE_MESSAGE: Record<Confidence, string> = {
  high:   'Seu perfil está completo. As recomendações serão precisas.',
  medium: 'Bom perfil. Adicione mais informações para recomendações ainda melhores.',
  low:    'Perfil básico criado. Complete as etapas para recomendações mais precisas.',
}

interface Props {
  profile: SizeProfile
}

export default function FlowCompletion({ profile }: Props) {
  const ts = profile.trueSizeByCategory

  return (
    <div className="text-center space-y-6">
      {/* Check mark */}
      <div className="w-14 h-14 border border-gold/30 rounded-full flex items-center justify-center mx-auto">
        <span className="text-gold text-2xl">✓</span>
      </div>

      <div>
        <p className="text-offwhite text-xl font-light mb-2">Perfil criado</p>
        <p className="text-offwhite/40 text-sm leading-relaxed mb-4">
          {CONFIDENCE_MESSAGE[profile.confidence]}
        </p>
        <ConfidenceBadge confidence={profile.confidence} />
      </div>

      {/* True sizes summary */}
      {ts && (Object.values(ts).some(Boolean)) && (
        <div className="border border-gold/10 p-5 text-left space-y-3">
          <p className="text-offwhite/40 text-xs tracking-widest uppercase mb-3">Seus tamanhos base</p>
          {ts.tops && (
            <div className="flex justify-between text-sm">
              <span className="text-offwhite/50">Blusas e tops</span>
              <span className="text-gold tracking-widest">{ts.tops}</span>
            </div>
          )}
          {ts.bottoms && (
            <div className="flex justify-between text-sm">
              <span className="text-offwhite/50">Calças e shorts</span>
              <span className="text-gold tracking-widest">{ts.bottoms}</span>
            </div>
          )}
          {ts.dresses && (
            <div className="flex justify-between text-sm">
              <span className="text-offwhite/50">Vestidos</span>
              <span className="text-gold tracking-widest">{ts.dresses}</span>
            </div>
          )}
          {ts.outerwear && (
            <div className="flex justify-between text-sm">
              <span className="text-offwhite/50">Casacos</span>
              <span className="text-gold tracking-widest">{ts.outerwear}</span>
            </div>
          )}
        </div>
      )}

      {/* Invite to shop */}
      <div className="space-y-3 pt-2">
        <Link
          href="/marcas/new-match"
          className="block w-full bg-gold text-primary py-3.5 text-xs tracking-[0.2em] uppercase hover:bg-gold/90 transition-colors"
        >
          Ver produtos New Match
        </Link>
        <Link
          href="/conta/tamanhos"
          className="block w-full border border-gold/20 text-offwhite/50 py-3.5 text-xs tracking-widest uppercase hover:text-offwhite hover:border-gold/40 transition-colors"
        >
          Ver meu perfil completo
        </Link>
      </div>
    </div>
  )
}
