import { describe, expect, it } from 'vitest'
import { createTimeDraft } from '../paperCalculatorDefaults'
import { calculateTimeEstimate } from './timeCalculator'

describe('calculateTimeEstimate', () => {
  it('calculates A3 duplex and laminate time', () => {
    const draft = createTimeDraft()
    draft.startAt = '2026-07-13T08:00'
    draft.jobs.a3 = { active: true, sheets: '100', mode: 'duplex' }
    draft.finishing.laminate = true
    const result = calculateTimeEstimate(draft)
    expect(result.status).toBe('ready')
    expect(result.data).toMatchObject({ jobMinutes: 13, totalFinishingSheets: 100, minTotalMinutes: 50, maxTotalMinutes: 50 })
  })

  it('calculates every book rule and multiple finishing ranges', () => {
    const draft = createTimeDraft()
    draft.jobs.saddle = { active: true, pages: '32', copies: '10', size: 'A5' }
    draft.jobs.perfect = { active: true, pages: '32', copies: '10', size: 'A5' }
    draft.jobs.hardCover = { active: true, pages: '32', copies: '10', size: 'A5' }
    draft.finishing.dieCut = true
    const result = calculateTimeEstimate(draft)
    expect(result.status).toBe('ready')
    expect(result.data.activeJobs).toHaveLength(3)
    expect(result.data.maxTotalMinutes).toBeGreaterThan(result.data.minTotalMinutes)
  })

  it('keeps active invalid jobs visible', () => {
    const draft = createTimeDraft()
    draft.jobs.a3.active = true
    const result = calculateTimeEstimate(draft)
    expect(result.status).toBe('invalid')
    expect(result.data.activeCount).toBe(1)
  })
})

