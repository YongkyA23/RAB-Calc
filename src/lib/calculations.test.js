import { describe, expect, it } from 'vitest'
import {
  calculateAdditionalLineTotal,
  calculateDigitalLineTotal,
  calculateGrandTotal,
  calculateManualLineTotal,
  calculateManpowerLineTotal,
  calculatePrintLineTotal,
  calculateTurnaroundDays,
  sumLayerTotals,
} from './calculations'

describe('calculation engine', () => {
  it('calculates repeatable print line totals and sums them', () => {
    const lines = [
      { qty: 110, item: { prices: { B2: 40000 } }, size: 'B2' },
      { qty: 2, item: { prices: { A3: 25000 } }, size: 'A3' },
    ]

    const totals = lines.map(calculatePrintLineTotal)

    expect(totals).toEqual([4400000, 50000])
    expect(sumLayerTotals(totals)).toBe(4450000)
  })

  it('blocks print size with no price', () => {
    expect(() =>
      calculatePrintLineTotal({ qty: 1, item: { prices: { A3: 25000, B2: null } }, size: 'B2' }),
    ).toThrow('No price is configured for B2')
  })

  it('calculates digital finishing line total', () => {
    expect(
      calculateDigitalLineTotal({ qty: 12, item: { prices: { A3: 20000 } }, size: 'A3' }),
    ).toBe(240000)
  })

  it('applies numeric manual finishing minimum when formula is lower', () => {
    expect(
      calculateManualLineTotal({
        p: 10,
        l: 10,
        qty: 2,
        jmlAlat: 1,
        item: {
          toolingRate: 2500,
          laborRate: 25,
          minimumType: 'numeric',
          minimumCharge: 300000,
        },
      }),
    ).toEqual({ toolingCost: 250000, laborCost: 5000, formulaTotal: 255000, total: 300000 })
  })

  it('uses formula total for by-request manual finishing', () => {
    expect(
      calculateManualLineTotal({
        p: 10,
        l: 10,
        qty: 2,
        jmlAlat: 0,
        item: {
          toolingRate: null,
          laborRate: 0.75,
          minimumType: 'byRequest',
          minimumCharge: null,
        },
      }),
    ).toEqual({ toolingCost: 0, laborCost: 150, formulaTotal: 150, total: 150 })
  })

  it('calculates no-tooling manual finishing with zero tooling cost', () => {
    expect(
      calculateManualLineTotal({
        p: 100,
        l: 20,
        qty: 4,
        jmlAlat: 0,
        item: {
          toolingRate: null,
          laborRate: 0.75,
          minimumType: 'numeric',
          minimumCharge: 600000,
        },
      }),
    ).toEqual({ toolingCost: 0, laborCost: 6000, formulaTotal: 6000, total: 600000 })
  })

  it('calculates manpower line total', () => {
    expect(calculateManpowerLineTotal({ days: 3, rate: 275000 })).toBe(825000)
  })

  it('calculates additional manual amount and rate based totals', () => {
    expect(calculateAdditionalLineTotal({ mode: 'manual', amount: 125000 })).toBe(125000)
    expect(calculateAdditionalLineTotal({ mode: 'rate', quantity: 200, rate: 5000 })).toBe(1000000)
  })

  it('calculates additional area-rate totals', () => {
    expect(calculateAdditionalLineTotal({ mode: 'area', lengthCm: 10, widthCm: 20, quantity: 2, rate: 5 })).toBe(2000)
  })

  it('calculates grand total from layer totals', () => {
    expect(
      calculateGrandTotal({
        print: 4450000,
        digital: 240000,
        manual: 900000,
        manpower: 825000,
        additional: 1125000,
      }),
    ).toBe(7540000)
  })

  it('uses maximum selected component turnaround days', () => {
    expect(calculateTurnaroundDays([1, 2, 3, 0, null, undefined])).toBe(3)
  })
})
