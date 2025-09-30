const CEDULA_LENGTH = 11
const CEDULA_WEIGHTS = [1, 2, 1, 2, 1, 2, 1, 2, 1, 2]

export function normalizeIdentityDocument(event?: string | Event): string {
  const value = typeof event === 'string' ? event : event.target?.['value']
  if (!value) {
    return ''
  }

  return value.replace(/\D/g, '')
}

export function isValidDominicanIdentityDocument(
  value?: string | null
): boolean {
  const normalized = normalizeIdentityDocument(value)

  if (normalized.length !== CEDULA_LENGTH || /[^0-9]/.test(normalized)) {
    return false
  }

  let checksum = 0
  for (let index = 0; index < CEDULA_LENGTH - 1; index += 1) {
    let product = Number(normalized[index]) * CEDULA_WEIGHTS[index]

    if (product >= 10) {
      product = Math.floor(product / 10) + (product % 10)
    }

    checksum += product
  }

  const remainder = checksum % 10
  const expectedDigit = remainder === 0 ? 0 : 10 - remainder

  return Number(normalized[CEDULA_LENGTH - 1]) === expectedDigit
}
