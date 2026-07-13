import { describe, expect, it } from 'vitest'
import { addCalendarMinutes, calculateWaste, parseCalculatorDecimal, parseIdrInput, parseWholeQuantity, roundPages } from './numbers'

describe('paper calculator number helpers', () => {
  it('parses Indonesian and dot decimals without collapsing blank values', () => {
    expect(parseCalculatorDecimal('29,7')).toBe(29.7)
    expect(parseCalculatorDecimal('29.7')).toBe(29.7)
    expect(parseCalculatorDecimal('')).toBeNull()
    expect(Number.isNaN(parseCalculatorDecimal('abc'))).toBe(true)
  })

  it('parses grouped rupiah and validates whole quantities', () => {
    expect(parseIdrInput('Rp 1.000.000')).toBe(1000000)
    expect(parseWholeQuantity('20')).toBe(20)
    expect(Number.isNaN(parseWholeQuantity('2,5'))).toBe(true)
  })

  it('rounds waste, pages, and calendar minutes', () => {
    expect(calculateWaste(41, 5)).toBe(3)
    expect(roundPages(101, 4)).toBe(104)
    expect(addCalendarMinutes('2026-07-13T08:00', 90)?.getHours()).toBe(9)
  })
})

