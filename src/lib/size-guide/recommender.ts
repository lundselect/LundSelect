import {
  BrazilianLetterSize,
  BrazilianNumericSize,
  BrazilianSize,
  Confidence,
  FitPreference,
  GarmentCategory,
  GarmentFit,
  ProductFitMetadata,
  Recommendation,
  SizeProfile,
} from './types'
import {
  LETTER_SIZES,
  LETTER_TO_NUMERIC,
  NUMERIC_SIZES,
  NUMERIC_TO_LETTER,
  getLetterSizeFromIndex,
  getNumericSizeFromIndex,
} from './data/size-conversions'
import { getTrueSizeForCategory } from './trueSize'

// How much "extra room" a garment's cut provides beyond its labeled size
const GARMENT_FIT_OFFSETS: Record<GarmentFit, number> = {
  very_fitted: -1, // tight — need to size up for a true fit
  fitted:       0,
  regular:      0,
  relaxed:     +1, // roomy — can size down
  oversized:   +2, // very roomy — size down 2
}

// How much extra room the user wants beyond true fit
const PREFERENCE_OFFSETS: Record<FitPreference, number> = {
  very_fitted: -1,
  fitted:       0,
  regular:      0,
  relaxed:     +1,
  oversized:   +2,
}

const FIT_LABEL_PT: Record<GarmentFit, string> = {
  very_fitted: 'muito justo',
  fitted:      'justo',
  regular:     'regular',
  relaxed:     'solto',
  oversized:   'oversized',
}

const CATEGORY_LABEL_PT: Record<GarmentCategory, string> = {
  top:      'blusas',
  bottom:   'calças',
  dress:    'vestidos',
  outerwear: 'casacos',
}

// New Match uses numeric sizing for all categories
function isNumericBrand(brandId: string): boolean {
  return brandId === 'new-match'
}

// Convert true size to a unified index in the brand's system
function toUnifiedIndex(
  trueSize: BrazilianLetterSize | BrazilianNumericSize,
  brandId: string,
  category: GarmentCategory
): number | null {
  if (category === 'bottom') {
    const numeric = typeof trueSize === 'number' ? trueSize : parseInt(trueSize as string)
    if (isNaN(numeric)) return null
    const idx = NUMERIC_SIZES.indexOf(numeric as BrazilianNumericSize)
    return idx >= 0 ? idx : null
  }

  if (isNumericBrand(brandId)) {
    // Profile stores letters for tops/dresses/outerwear; New Match uses numeric
    const letter = typeof trueSize === 'string' ? trueSize as BrazilianLetterSize : NUMERIC_TO_LETTER[trueSize as number]
    if (!letter) return null
    const numeric = LETTER_TO_NUMERIC[letter]
    const idx = NUMERIC_SIZES.indexOf(numeric)
    return idx >= 0 ? idx : null
  }

  const idx = LETTER_SIZES.indexOf(trueSize as BrazilianLetterSize)
  return idx >= 0 ? idx : null
}

// Convert a unified index back to the brand's size format
function fromUnifiedIndex(index: number, brandId: string, category: GarmentCategory): BrazilianSize {
  if (category === 'bottom' || isNumericBrand(brandId)) {
    return getNumericSizeFromIndex(index)
  }
  return getLetterSizeFromIndex(index)
}

function getPreferenceForCategory(profile: SizeProfile, category: GarmentCategory): FitPreference {
  const prefs = profile.fitPreferences
  if (!prefs) return 'regular'
  switch (category) {
    case 'top':      return prefs.tops ?? 'regular'
    case 'bottom':   return prefs.bottoms ?? 'regular'
    case 'dress':    return prefs.dresses ?? 'regular'
    case 'outerwear': return prefs.outerwear ?? 'regular'
  }
}

function combineConfidence(a: Confidence, b: Confidence): Confidence {
  const rank = { low: 0, medium: 1, high: 2 }
  return rank[a] <= rank[b] ? a : b
}

function buildReasoning(
  fit: GarmentFit,
  fitSource: ProductFitMetadata['inferredFitSource'],
  preference: FitPreference,
  category: GarmentCategory,
  stretchFactor: string,
  brandAdj: number,
): string {
  const sourceLabel =
    fitSource === 'description' ? 'A descrição indica' :
    fitSource === 'size_chart'  ? 'A tabela de medidas confirma' :
    fitSource === 'explicit'    ? 'A marca classifica como' :
                                  'Estimamos que é'

  let text = `${sourceLabel} modelagem ${FIT_LABEL_PT[fit]}`

  if (preference !== 'regular') {
    text += ` e você prefere caimento ${FIT_LABEL_PT[preference]} em ${CATEGORY_LABEL_PT[category]}`
  }
  if (stretchFactor === 'high' || stretchFactor === 'medium') {
    text += `. O tecido tem elasticidade — há mais margem entre tamanhos`
  }
  if (brandAdj < 0) text += `. Esta marca tende a vestir menor`
  if (brandAdj > 0) text += `. Esta marca tende a vestir maior`

  return text + '.'
}

export function recommend(
  profile: SizeProfile,
  fitMetadata: ProductFitMetadata
): Recommendation | null {
  const trueSize = getTrueSizeForCategory(profile, fitMetadata.category)
  if (!trueSize) return null

  const {
    brandId, category,
    inferredFit, inferredFitSource, inferredFitConfidence,
    brandFitAdjustment, stretchFactor,
  } = fitMetadata

  const preference = getPreferenceForCategory(profile, category)
  const trueSizeIndex = toUnifiedIndex(trueSize, brandId, category)
  if (trueSizeIndex === null) return null

  const effectiveGarmentOffset = GARMENT_FIT_OFFSETS[inferredFit] + brandFitAdjustment
  const preferenceOffset = PREFERENCE_OFFSETS[preference]

  const maxIndex = (category === 'bottom' || isNumericBrand(brandId))
    ? NUMERIC_SIZES.length - 1
    : LETTER_SIZES.length - 1

  const rawIndex = trueSizeIndex - effectiveGarmentOffset + preferenceOffset
  const recommendedIndex = Math.max(0, Math.min(maxIndex, rawIndex))

  const altIndex = Math.max(0, Math.min(maxIndex, recommendedIndex + 1))
  const recommendedSize = fromUnifiedIndex(recommendedIndex, brandId, category)
  const alternativeSize = altIndex !== recommendedIndex
    ? fromUnifiedIndex(altIndex, brandId, category)
    : undefined

  const confidence = combineConfidence(profile.confidence, inferredFitConfidence)
  const reasoning = buildReasoning(inferredFit, inferredFitSource, preference, category, stretchFactor, brandFitAdjustment)

  const dataQualityNote = fitMetadata.needsFitMetadata
    ? 'Recomendação estimada — esta peça tem dados limitados de caimento'
    : confidence === 'low'
    ? 'Complete seu perfil para recomendações mais precisas'
    : undefined

  return { recommendedSize, confidence, reasoning, alternativeSize, dataQualityNote }
}
