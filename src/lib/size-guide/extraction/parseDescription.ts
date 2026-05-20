import { extractFitFromText } from '../data/pt-br-fit-keywords'
import { GarmentFit, StretchFactor } from '../types'

export interface ParsedDescription {
  inferredFit?: GarmentFit
  stretchFactor?: StretchFactor
}

export function parseDescription(text: string): ParsedDescription {
  const { fit, stretch } = extractFitFromText(text)
  return {
    inferredFit: fit,
    stretchFactor: stretch,
  }
}
