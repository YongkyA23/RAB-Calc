import { describe, expect, it } from 'vitest'
import { canDeletePaperRecord, hasDuplicateCustomSize, hydratePaperWorkspace, validateCustomSize } from './paperCalculatorPersistence'

describe('paper calculator persistence model', () => {
  it('hydrates versioned workspace while preserving defaults', () => {
    const workspace = hydratePaperWorkspace({ schemaVersion: 1, activeTab: 'plano', drafts: { layout: { designWidth: '9' } } })
    expect(workspace.activeTab).toBe('plano')
    expect(workspace.drafts.layout).toMatchObject({ paperWidth: '48', designWidth: '9' })
    expect(workspace.drafts.time.jobs.a3.active).toBe(false)
  })

  it('validates and deduplicates custom sizes', () => {
    expect(validateCustomSize({ type: 'paper', label: 'A', width: 10, height: 20 })).toEqual([])
    expect(validateCustomSize({ type: 'other', label: '', width: 0, height: 20 })).toHaveLength(3)
    expect(hasDuplicateCustomSize([{ type: 'paper', width: 10, height: 20 }], { type: 'paper', width: '10', height: '20' })).toBe(true)
  })

  it('allows only owners and admins to delete records', () => {
    expect(canDeletePaperRecord({ createdBy: 'u1' }, { uid: 'u1', role: 'Estimator' })).toBe(true)
    expect(canDeletePaperRecord({ createdBy: 'u1' }, { uid: 'u2', role: 'Estimator' })).toBe(false)
    expect(canDeletePaperRecord({ createdBy: 'u1' }, { uid: 'u2', role: 'Admin' })).toBe(true)
  })
})

