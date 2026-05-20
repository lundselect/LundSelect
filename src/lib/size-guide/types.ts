export type BrazilianLetterSize = 'PP' | 'P' | 'M' | 'G' | 'GG' | 'XGG'
export type BrazilianNumericSize = 34 | 36 | 38 | 40 | 42 | 44 | 46 | 48 | 50
export type BrazilianSize = BrazilianLetterSize | BrazilianNumericSize
export type GarmentCategory = 'top' | 'bottom' | 'dress' | 'outerwear'
export type GarmentFit = 'very_fitted' | 'fitted' | 'regular' | 'relaxed' | 'oversized'
export type StretchFactor = 'none' | 'low' | 'medium' | 'high'
export type Confidence = 'low' | 'medium' | 'high'
export type FitPreference = 'very_fitted' | 'fitted' | 'regular' | 'relaxed' | 'oversized'
export type InferredFitSource = 'explicit' | 'size_chart' | 'model_info' | 'description' | 'brand_default' | 'category_default'

export interface GarmentMeasurements {
  bust_cm?: number
  waist_cm?: number
  hip_cm?: number
  length_cm?: number
}

export interface SizeChartEntry {
  size: BrazilianSize
  measurements: GarmentMeasurements
}

export interface ModelInfo {
  height_cm?: number
  sizeWorn?: BrazilianLetterSize | number
}

export interface GarmentSignals {
  sizeChart?: SizeChartEntry[]
  garmentFitExplicit?: GarmentFit
  fabricComposition?: string
  stretchFactor?: StretchFactor
  modelInfo?: ModelInfo
  descriptionText?: string
  styleKeywords?: string[]
  category: GarmentCategory
  brandId: string
  brandHistoricalFit?: number
}

export interface ProductFitMetadata {
  productId: string
  brandId: string
  category: GarmentCategory
  signals: GarmentSignals
  inferredFit: GarmentFit
  inferredFitSource: InferredFitSource
  inferredFitConfidence: Confidence
  brandFitAdjustment: number
  stretchFactor: StretchFactor
  needsFitMetadata?: boolean
}

export interface ShapeAnswers {
  silhouette?: 'balanced' | 'fuller_bust' | 'fuller_hips' | 'straight' | 'curvy_waist'
  bust?: 'fuller' | 'proportional' | 'smaller'
  waistDefinition?: 'very_defined' | 'softly_defined' | 'straight'
  hipThigh?: 'fuller' | 'proportional' | 'slimmer'
  shoulderVsHip?: 'wider' | 'same' | 'narrower'
  torsoLength?: 'long' | 'average' | 'short'
  armLength?: 'too_long' | 'just_right' | 'too_short'
  fitIssues?: Array<'gapes_bust' | 'tight_hips' | 'loose_waist' | 'too_long' | 'too_short' | 'tight_shoulders' | 'sleeves_wrong' | 'none'>
}

export interface FitPreferences {
  tops: FitPreference
  bottoms: FitPreference
  dresses: FitPreference
  outerwear: FitPreference
}

export interface Measurements {
  bust_cm?: number
  waist_cm?: number
  hip_cm?: number
  height_cm?: number
  inseam_cm?: number
  sources: Array<'manual' | 'scan'>
  lastUpdated: string
}

export interface TrueSizeByCategory {
  tops?: BrazilianLetterSize
  bottoms?: BrazilianNumericSize
  dresses?: BrazilianLetterSize
  outerwear?: BrazilianLetterSize
}

export interface CutSystemFit {
  petite: boolean
  tall: boolean
  plus: boolean
}

export interface SizeProfile {
  userId: string | null
  measurements?: Measurements
  shapeAnswers?: ShapeAnswers
  fitPreferences?: FitPreferences
  trueSizeByCategory?: TrueSizeByCategory
  cutSystemFit?: CutSystemFit
  confidence: Confidence
  consentVersion: string
  updatedAt?: string
}

export interface Recommendation {
  recommendedSize: BrazilianSize
  confidence: Confidence
  reasoning: string
  alternativeSize?: BrazilianSize
  dataQualityNote?: string
}
