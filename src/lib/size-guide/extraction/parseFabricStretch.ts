import { StretchFactor } from '../types'

const HIGH = [/elastan[eo]/i, /lycra/i, /elastomero/i, /spandex/i]
const MEDIUM = [/malha/i, /jersey/i, /moletom/i]
const LOW = [/algodão/i, /linho/i, /viscose/i, /seda/i]
const NONE = [/couro/i, /suede/i, /jeans\s+rígid/i]

export function parseFabricStretch(composition: string): StretchFactor {
  if (NONE.some(r => r.test(composition))) return 'none'
  if (HIGH.some(r => r.test(composition))) return 'high'
  if (MEDIUM.some(r => r.test(composition))) return 'medium'
  if (LOW.some(r => r.test(composition))) return 'low'
  return 'none'
}
