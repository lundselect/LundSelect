import { BrazilianLetterSize, BrazilianNumericSize, GarmentCategory, Measurements, ShapeAnswers, SizeProfile, TrueSizeByCategory } from './types'
import { bustToLetterSize, hipToLetterSize, hipToNumericSize, LETTER_SIZES, waistToNumericSize } from './data/size-conversions'

export function computeTrueSize(measurements: Measurements, shapeAnswers?: ShapeAnswers): TrueSizeByCategory {
  const result: TrueSizeByCategory = {}
  const sizes = LETTER_SIZES

  // Tops: bust is primary
  if (measurements.bust_cm) {
    let bustSize = bustToLetterSize(measurements.bust_cm)
    // Fuller bust users should go up one size for comfort
    if (shapeAnswers?.bust === 'fuller') {
      const idx = sizes.indexOf(bustSize)
      bustSize = sizes[Math.min(idx + 1, sizes.length - 1)] as BrazilianLetterSize
    }
    result.tops = bustSize
    result.outerwear = bustSize
  }

  // Bottoms: hip primary, waist secondary — take the larger
  if (measurements.hip_cm || measurements.waist_cm) {
    const hipSize = measurements.hip_cm ? hipToNumericSize(measurements.hip_cm) : 34
    const waistSize = measurements.waist_cm ? waistToNumericSize(measurements.waist_cm) : 34
    result.bottoms = (measurements.hip_cm && measurements.waist_cm
      ? Math.max(hipSize, waistSize)
      : measurements.hip_cm ? hipSize : waistSize) as BrazilianNumericSize
  }

  // Dresses: use the larger of bust/hip letter size
  if (measurements.bust_cm || measurements.hip_cm) {
    const bustLetterSize = measurements.bust_cm ? bustToLetterSize(measurements.bust_cm) : null
    const hipLetterSize = measurements.hip_cm ? hipToLetterSize(measurements.hip_cm) : null

    if (bustLetterSize && hipLetterSize) {
      const bustIdx = sizes.indexOf(bustLetterSize)
      const hipIdx = sizes.indexOf(hipLetterSize)
      result.dresses = sizes[Math.max(bustIdx, hipIdx)] as BrazilianLetterSize
    } else {
      result.dresses = (bustLetterSize ?? hipLetterSize) as BrazilianLetterSize
    }
  }

  return result
}

export function getTrueSizeForCategory(
  profile: SizeProfile,
  category: GarmentCategory
): BrazilianLetterSize | BrazilianNumericSize | undefined {
  const ts = profile.trueSizeByCategory
  if (!ts) return undefined
  switch (category) {
    case 'top': return ts.tops
    case 'bottom': return ts.bottoms
    case 'dress': return ts.dresses
    case 'outerwear': return ts.outerwear
  }
}
