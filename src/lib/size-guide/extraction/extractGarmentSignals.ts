import { Product } from '@/types'
import { Confidence, GarmentCategory, GarmentFit, GarmentSignals, InferredFitSource, ProductFitMetadata, StretchFactor } from '../types'
import { parseDescription } from './parseDescription'
import { parseModelInfo } from './parseModelInfo'

// Checks product category string AND name for more specific mapping
function mapCategory(categoryStr: string, productName = ''): GarmentCategory {
  const combined = (categoryStr + ' ' + productName).toLowerCase()
  if (/calça|calca|short|saia/.test(combined)) return 'bottom'
  if (/vestido|macacão|macacao/.test(combined)) return 'dress'
  if (/casaco|jaqueta|blazer|colete|parka|capa|sobretudo/.test(combined)) return 'outerwear'
  return 'top'
}

// Brand-level fit adjustments (-1 = runs small, 0 = true to size, +1 = runs large)
const BRAND_FIT_ADJUSTMENTS: Record<string, number> = {
  'new-match': 0,
}

export function extractGarmentSignals(product: Product): ProductFitMetadata {
  const category = mapCategory(product.category, product.name)
  const brandId = product.brandSlug
  const brandFitAdjustment = BRAND_FIT_ADJUSTMENTS[brandId] ?? 0

  const signals: GarmentSignals = {
    category,
    brandId,
    brandHistoricalFit: brandFitAdjustment,
    descriptionText: product.description,
  }

  if (product.description) {
    const modelInfo = parseModelInfo(product.description)
    if (modelInfo) signals.modelInfo = modelInfo
  }

  let inferredFit: GarmentFit = 'regular'
  let inferredFitSource: InferredFitSource = 'category_default'
  let inferredFitConfidence: Confidence = 'low'
  let stretchFactor: StretchFactor = 'none'
  let needsFitMetadata = false

  // Try name first (shorter, more signal-dense)
  const nameSignals = parseDescription(product.name)
  if (nameSignals.inferredFit) {
    inferredFit = nameSignals.inferredFit
    inferredFitSource = 'description'
    inferredFitConfidence = 'medium'
  }

  // Description overrides name if more specific
  if (product.description) {
    const descSignals = parseDescription(product.description)
    if (descSignals.inferredFit) {
      inferredFit = descSignals.inferredFit
      inferredFitSource = 'description'
      inferredFitConfidence = 'medium'
    }
    if (descSignals.stretchFactor) {
      stretchFactor = descSignals.stretchFactor
    }
  }

  if (inferredFitSource === 'category_default') {
    needsFitMetadata = true
  }

  return {
    productId: product.id,
    brandId,
    category,
    signals,
    inferredFit,
    inferredFitSource,
    inferredFitConfidence,
    brandFitAdjustment,
    stretchFactor,
    needsFitMetadata,
  }
}
