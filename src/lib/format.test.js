import { describe, expect, it } from 'vitest'
import { formatDateForInput, formatIdr, normalizeSearchText, parseNumberInput } from './format'

describe('format helpers', () => {
  it('formats IDR with Indonesian separators and no decimals', () => {
    expect(formatIdr(7540000)).toBe('Rp 7.540.000')
  })

  it('parses number input containing separators', () => {
    expect(parseNumberInput('7.540.000')).toBe(7540000)
    expect(parseNumberInput('')).toBe(0)
  })

  it('normalizes search text for filters', () => {
    expect(normalizeSearchText('  PT Example Mockup  ')).toBe('pt example mockup')
  })

  it('formats a date for HTML date input', () => {
    expect(formatDateForInput(new Date('2026-06-17T10:30:00.000Z'))).toBe('2026-06-17')
  })
})
