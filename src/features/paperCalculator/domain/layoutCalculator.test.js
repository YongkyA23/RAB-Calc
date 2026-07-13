import { describe, expect, it } from 'vitest'
import { calculateLayout } from './layoutCalculator'

const base = {
  paperWidth: '48', paperHeight: '32', designWidth: '9', designHeight: '5,5', gap: '0', requiredQty: '1000',
  allowRotate: true, pricePerRim: '500.000', sheetsPerRim: '500', wastePercent: '5',
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
})

