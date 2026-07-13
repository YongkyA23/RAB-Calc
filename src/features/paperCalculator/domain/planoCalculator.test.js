import { describe, expect, it } from 'vitest'
import { calculatePlano } from './planoCalculator'

describe('calculatePlano', () => {
  it('compares normal and rotated schemes', () => {
    const result = calculatePlano({ planoWidth: '65', planoHeight: '100', cutWidth: '21', cutHeight: '29.7', maximizeRemainder: false })
    expect(result.status).toBe('ready')
    expect(result.data.schemes.map((scheme) => scheme.id)).toEqual(['normal', 'rotated'])
    expect(result.data.schemes[0]).toMatchObject({ columns: 3, rows: 3, totalCuts: 9 })
  })

  it('adds a non-overlapping remainder scheme when it improves yield', () => {
    const result = calculatePlano({ planoWidth: '65', planoHeight: '100', cutWidth: '22', cutHeight: '20', maximizeRemainder: true })
    const remainder = result.data.schemes.find((scheme) => scheme.id === 'remainder')
    expect(remainder?.totalCuts).toBeGreaterThan(result.data.schemes[0].totalCuts)
  })

  it('guards invalid and no-fit dimensions', () => {
    expect(calculatePlano({ planoWidth: '65', planoHeight: '100', cutWidth: '0', cutHeight: '20' }).status).toBe('invalid')
    expect(calculatePlano({ planoWidth: '65', planoHeight: '100', cutWidth: '200', cutHeight: '200' }).status).toBe('no-fit')
  })
})
