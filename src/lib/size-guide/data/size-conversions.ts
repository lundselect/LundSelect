import { BrazilianLetterSize, BrazilianNumericSize } from '../types'

export const LETTER_SIZES: BrazilianLetterSize[] = ['PP', 'P', 'M', 'G', 'GG', 'XGG']
export const NUMERIC_SIZES: BrazilianNumericSize[] = [34, 36, 38, 40, 42, 44, 46, 48, 50]

// Standard BR size chart (matches /guia-de-tamanhos)
export const LETTER_SIZE_CHART: Record<BrazilianLetterSize, { bust: [number, number]; waist: [number, number]; hip: [number, number] }> = {
  PP:  { bust: [80, 84],   waist: [62, 66], hip: [88, 92]   },
  P:   { bust: [84, 88],   waist: [66, 70], hip: [92, 96]   },
  M:   { bust: [88, 92],   waist: [70, 74], hip: [96, 100]  },
  G:   { bust: [92, 98],   waist: [74, 80], hip: [100, 106] },
  GG:  { bust: [98, 104],  waist: [80, 86], hip: [106, 112] },
  XGG: { bust: [104, 110], waist: [86, 92], hip: [112, 118] },
}

export const NUMERIC_SIZE_CHART: Record<number, { waist: [number, number]; hip: [number, number] }> = {
  34: { waist: [62, 65], hip: [88, 91]   },
  36: { waist: [66, 69], hip: [92, 95]   },
  38: { waist: [70, 73], hip: [96, 99]   },
  40: { waist: [74, 77], hip: [100, 103] },
  42: { waist: [78, 82], hip: [104, 108] },
  44: { waist: [83, 87], hip: [109, 113] },
  46: { waist: [88, 92], hip: [114, 118] },
}

// New Match uses numeric for all categories — letter profile maps 1:1
export const LETTER_TO_NUMERIC: Record<BrazilianLetterSize, BrazilianNumericSize> = {
  PP: 34, P: 36, M: 38, G: 40, GG: 42, XGG: 44,
}

export const NUMERIC_TO_LETTER: Record<number, BrazilianLetterSize> = {
  34: 'PP', 36: 'P', 38: 'M', 40: 'G', 42: 'GG', 44: 'XGG',
}

export function getLetterSizeIndex(size: BrazilianLetterSize): number {
  return LETTER_SIZES.indexOf(size)
}

export function getLetterSizeFromIndex(index: number): BrazilianLetterSize {
  return LETTER_SIZES[Math.max(0, Math.min(LETTER_SIZES.length - 1, index))]
}

export function getNumericSizeIndex(size: number): number {
  return NUMERIC_SIZES.indexOf(size as BrazilianNumericSize)
}

export function getNumericSizeFromIndex(index: number): BrazilianNumericSize {
  return NUMERIC_SIZES[Math.max(0, Math.min(NUMERIC_SIZES.length - 1, index))]
}

export function bustToLetterSize(bust_cm: number): BrazilianLetterSize {
  for (const [size, range] of Object.entries(LETTER_SIZE_CHART)) {
    if (bust_cm >= range.bust[0] && bust_cm <= range.bust[1]) return size as BrazilianLetterSize
  }
  return bust_cm < 80 ? 'PP' : 'XGG'
}

export function hipToLetterSize(hip_cm: number): BrazilianLetterSize {
  for (const [size, range] of Object.entries(LETTER_SIZE_CHART)) {
    if (hip_cm >= range.hip[0] && hip_cm <= range.hip[1]) return size as BrazilianLetterSize
  }
  return hip_cm < 88 ? 'PP' : 'XGG'
}

export function hipToNumericSize(hip_cm: number): BrazilianNumericSize {
  for (const [sizeStr, range] of Object.entries(NUMERIC_SIZE_CHART)) {
    const size = Number(sizeStr)
    if (hip_cm >= range.hip[0] && hip_cm <= range.hip[1]) return size as BrazilianNumericSize
  }
  return hip_cm < 88 ? 34 : 46
}

export function waistToNumericSize(waist_cm: number): BrazilianNumericSize {
  for (const [sizeStr, range] of Object.entries(NUMERIC_SIZE_CHART)) {
    const size = Number(sizeStr)
    if (waist_cm >= range.waist[0] && waist_cm <= range.waist[1]) return size as BrazilianNumericSize
  }
  return waist_cm < 62 ? 34 : 46
}
