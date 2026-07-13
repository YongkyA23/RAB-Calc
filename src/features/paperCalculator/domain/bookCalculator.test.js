import { describe, expect, it } from 'vitest'
import { calculateBook } from './bookCalculator'

const base = {
  paperWidth: '48', paperHeight: '32', bookWidth: '14.8', bookHeight: '21', pages: '100', copies: '200',
  printMode: 'duplex', binding: 'perfect', coverType: 'soft', spineThickness: '0.8',
  contentPricePerRim: '500000', coverPricePerRim: '750000', sheetsPerRim: '500', wastePercent: '5',
}

describe('calculateBook', () => {
  it('calculates duplex content, cover, waste, and cost', () => {
    const result = calculateBook(base)
    expect(result.status).toBe('ready')
    expect(result.data.booksPerSheet).toBe(4)
    expect(result.data.contentSheetsPerBook).toBe(13)
    expect(result.data.contentSheetsTotal).toBe(2600)
    expect(result.data.coverPerSheet).toBe(2)
    expect(result.data.coverSheetsTotal).toBe(100)
    expect(result.data.recommendedOrder).toBeGreaterThan(2700)
    expect(result.data.totalCost).toBeGreaterThan(0)
  })

  it('rounds saddle pages and emits a warning', () => {
    const result = calculateBook({ ...base, pages: '101', binding: 'saddle' })
    expect(result.data.finalPages).toBe(104)
    expect(result.warnings.join(' ')).toMatch(/kelipatan 4/i)
  })

  it('supports no separate cover', () => {
    const result = calculateBook({ ...base, coverType: 'none', coverPricePerRim: '' })
    expect(result.data.coverSheetsTotal).toBe(0)
    expect(result.data.coverCost).toBe(0)
  })

  it('reports a cover that does not fit', () => {
    const result = calculateBook({ ...base, bookWidth: '30', bookHeight: '30', spineThickness: '5' })
    expect(result.status).toBe('no-fit')
  })
})

