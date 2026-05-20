export class ValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ValidationError'
  }
}

export function requireString(value: unknown, field: string, maxLength = 2000): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new ValidationError(`${field} é obrigatório`)
  }
  if (value.length > maxLength) {
    throw new ValidationError(`${field} deve ter no máximo ${maxLength} caracteres`)
  }
  return value.trim()
}

export function requireEmail(value: unknown): string {
  const email = requireString(value, 'E-mail', 254)
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new ValidationError('E-mail inválido')
  }
  return email.toLowerCase()
}

export function optionalString(value: unknown, maxLength = 500): string | undefined {
  if (value === null || value === undefined || value === '') return undefined
  if (typeof value !== 'string') throw new ValidationError('Valor inválido')
  if (value.length > maxLength) throw new ValidationError(`Deve ter no máximo ${maxLength} caracteres`)
  return value.trim()
}

export function requireArray(value: unknown, field: string, maxItems = 20): string[] {
  if (!Array.isArray(value)) throw new ValidationError(`${field} deve ser uma lista`)
  if (value.length > maxItems) throw new ValidationError(`${field}: máximo ${maxItems} itens`)
  return value.filter((v): v is string => typeof v === 'string').map(s => s.trim()).slice(0, maxItems)
}
