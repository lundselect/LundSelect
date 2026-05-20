import { GarmentFit, StretchFactor } from '../types'

interface KeywordEntry {
  patterns: RegExp[]
  fit?: GarmentFit
  stretch?: StretchFactor
}

const KEYWORD_ENTRIES: KeywordEntry[] = [
  // Very fitted
  {
    patterns: [/segunda pele/i, /veste justinho/i, /muito justo/i, /skinny/i, /body[- ]con/i],
    fit: 'very_fitted',
  },
  // Fitted
  {
    patterns: [/\bjust[ao]\b/i, /\bajustad[ao]\b/i, /veste justo/i, /\bfitted\b/i, /\bslim\b/i, /\bcolad[ao]\b/i, /veste o corpo/i],
    fit: 'fitted',
  },
  // Regular
  {
    patterns: [/corte reto/i, /modelagem reta/i, /caimento reto/i, /\bregular\b/i, /caimento impecável/i],
    fit: 'regular',
  },
  // Relaxed
  {
    patterns: [/\bfluid[ao]\b/i, /caimento fluido/i, /\brelaxed\b/i, /\bconfortável\b/i, /modelagem fluida/i],
    fit: 'relaxed',
  },
  // Oversized
  {
    patterns: [/\boversized\b/i, /modelagem ampla/i, /\bampla?\b/i, /\bfolgad[ao]\b/i, /\bsolt[ao]\b/i, /\blargad[ao]\b/i, /caimento solto/i, /modelagem solta/i, /\bamplo\b/i, /modelagem oversized/i],
    fit: 'oversized',
  },
  // High stretch
  {
    patterns: [/elastan[eo]/i, /\blycra\b/i, /spandex/i, /\bstretch\b/i, /com elastico/i, /elasticidade/i],
    stretch: 'high',
  },
  // Medium stretch
  {
    patterns: [/\bmalha\b/i, /\bjersey\b/i, /\bmoletom\b/i, /tricot canelado/i],
    stretch: 'medium',
  },
]

export function extractFitFromText(text: string): { fit?: GarmentFit; stretch?: StretchFactor } {
  let fit: GarmentFit | undefined
  let stretch: StretchFactor | undefined

  for (const entry of KEYWORD_ENTRIES) {
    for (const pattern of entry.patterns) {
      if (pattern.test(text)) {
        if (entry.fit && !fit) fit = entry.fit
        if (entry.stretch && !stretch) stretch = entry.stretch
        break
      }
    }
  }

  return { fit, stretch }
}
