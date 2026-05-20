import { ModelInfo } from '../types'

// Matches: "modelo veste P, tem 1.74m" | "modelo: 38, 1.70m" | "1.74m e veste P"
const PATTERNS = [
  /modelo\s+(?:veste\s+)?([A-Z]{1,3}|\d{2})[,.]?\s*(?:tem|altura|mede|com)?\s*(1[.,]\d{2})\s*m/i,
  /modelo\s*:\s*([A-Z]{1,3}|\d{2})[,\s]+(?:altura|h)?\s*(1[.,]\d{2})\s*m/i,
  /(1[.,]\d{2})\s*m\s+(?:e\s+)?(?:veste|usa)\s+([A-Z]{1,3}|\d{2})/i,
]

export function parseModelInfo(text: string): ModelInfo | undefined {
  for (const pattern of PATTERNS) {
    const match = text.match(pattern)
    if (match) {
      const [, a, b] = match
      const isHeightFirst = /1[.,]\d{2}/.test(a)
      const heightStr = isHeightFirst ? a : b
      const sizeStr = isHeightFirst ? b : a

      const height_cm = Math.round(parseFloat(heightStr.replace(',', '.')) * 100)
      const numericSize = parseInt(sizeStr)

      if (height_cm >= 150 && height_cm <= 200) {
        return {
          height_cm,
          sizeWorn: isNaN(numericSize) ? (sizeStr.toUpperCase() as any) : numericSize,
        }
      }
    }
  }
  return undefined
}
