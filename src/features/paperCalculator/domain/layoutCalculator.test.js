import { describe, expect, it } from 'vitest'
import { calculateLayout, getSheetItemCount } from './layoutCalculator'

const base = {
  paperWidth: '48', paperHeight: '32', designWidth: '9', designHeight: '5,5', gap: '0', requiredQty: '1000',
  allowRotate: true, pricePerRim: '500.000', sheetsPerRim: '500', wastePercent: '5',
}

const capacityTen = {
  ...base,
  paperWidth: '20',
  paperHeight: '10',
  designWidth: '4',
  designHeight: '5',
  wastePercent: '0',
}

describe('calculateLayout', () => {
  it('calculates placement, sheets, waste, and cost', () => {
    const result = calculateLayout(base)
    expect(result.status).toBe('ready')
    expect(result.data).toMatchObject({ pcsPerSheet: 25, columns: 5, rows: 5, requiredSheets: 40, wasteSheets: 2, totalOrderSheets: 42, estimatedPaperCost: 42000 })
  })

  it('uses the documented gap formula and normal tie breaking', () => {
    const result = calculateLayout({ ...base, paperWidth: '20', paperHeight: '20', designWidth: '9', designHeight: '9', gap: '1', requiredQty: '' })
    expect(result.data).toMatchObject({ columns: 2, rows: 2, orientation: 'Normal', requiredSheets: null })
  })

  it('returns no-fit without infinite quantities', () => {
    const result = calculateLayout({ ...base, designWidth: '100', designHeight: '100' })
    expect(result.status).toBe('no-fit')
    expect(result.data.requiredSheets).toBeNull()
  })

  it('keeps layout ready when optional price is blank', () => {
    const result = calculateLayout({ ...base, pricePerRim: '' })
    expect(result.status).toBe('ready')
    expect(result.data.estimatedPaperCost).toBeNull()
  })

  it('builds a compact sheet preview for full and partial sheets', () => {
    const result = calculateLayout({ ...capacityTen, requiredQty: '125' })

    expect(result.data).toMatchObject({ pcsPerSheet: 10, requiredSheets: 13 })
    expect(result.data.sheetPreview).toEqual({
      mode: 'production',
      totalSheets: 13,
      fullSheets: 12,
      partialSheets: 1,
      partialItems: 5,
      lastSheetItems: 5,
    })
    expect(getSheetItemCount(result.data.sheetPreview, result.data.pcsPerSheet, 1)).toBe(10)
    expect(getSheetItemCount(result.data.sheetPreview, result.data.pcsPerSheet, 13)).toBe(5)
  })

  it('handles exact multiples and quantities smaller than one sheet', () => {
    const exact = calculateLayout({ ...capacityTen, requiredQty: '120' })
    const partial = calculateLayout({ ...capacityTen, requiredQty: '5' })

    expect(exact.data.sheetPreview).toMatchObject({ totalSheets: 12, fullSheets: 12, partialSheets: 0, partialItems: 0, lastSheetItems: 10 })
    expect(partial.data.sheetPreview).toMatchObject({ totalSheets: 1, fullSheets: 0, partialSheets: 1, partialItems: 5, lastSheetItems: 5 })
  })

  it('keeps quantity-free previews in capacity mode', () => {
    const result = calculateLayout({ ...capacityTen, requiredQty: '' })

    expect(result.data.requiredSheets).toBeNull()
    expect(result.data.sheetPreview).toEqual({ mode: 'capacity', totalSheets: 1, fullSheets: null, partialSheets: 0, partialItems: null, lastSheetItems: 10 })
  })

  it('does not allocate an array for very large sheet counts', () => {
    const result = calculateLayout({ ...capacityTen, requiredQty: '1000000000' })

    expect(result.data.sheetPreview.totalSheets).toBe(100000000)
    expect(result.data.sheetPreview).not.toHaveProperty('sheets')
  })
})
