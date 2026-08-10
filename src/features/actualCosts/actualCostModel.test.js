import { describe, expect, it } from 'vitest'
import {
  actualLineTotal,
  buildActualCostPayload,
  createActualCostDraft,
  summarizeActualCosts,
  validateActualCostDraft,
} from './actualCostModel'

const estimate = {
  id: 'e1',
  jobNo: 'JOB-1',
  sku: 'SKU-1',
  client: 'Client',
  project: 'Box',
  grandTotal: 300000,
  lineItems: [
    { id: 'l1', layer: 'print', inputs: { qty: 10 }, priceSnapshot: { name: 'Art Carton' }, computedTotal: 300000 },
  ],
}

describe('actual cost model', () => {
  it('creates an editable draft with a locked RAB baseline', () => {
    expect(createActualCostDraft(estimate)).toMatchObject({
      estimateId: 'e1',
      baselineSnapshot: { grandTotal: 300000 },
      lines: [{ estimateLineId: 'l1', plannedQuantity: 10, plannedUnitCost: 30000, plannedTotal: 300000 }],
    })
  })

  it('uses direct actual amount or calculates quantity times unit cost', () => {
    expect(actualLineTotal({ actualAmount: '275000' })).toBe(275000)
    expect(actualLineTotal({ actualAmount: '', actualQuantity: '11', actualUnitCost: '26000' })).toBe(286000)
  })

  it('requires every planned line before finalization', () => {
    const draft = createActualCostDraft(estimate)
    expect(validateActualCostDraft(draft, false)).toEqual([])
    expect(validateActualCostDraft(draft, true)).toEqual(['Art Carton belum diaktualisasi'])
  })

  it('keeps an empty draft line unrecorded after saving', () => {
    const payload = buildActualCostPayload(createActualCostDraft(estimate), { uid: 'u1', name: 'Admin' })

    expect(payload.lines[0].actualAmount).toBeNull()
    expect(validateActualCostDraft(payload, true)).toEqual(['Art Carton belum diaktualisasi'])
  })

  it('builds actual totals and variance including unplanned cost', () => {
    const draft = createActualCostDraft(estimate)
    draft.lines[0].actualAmount = '275000'
    draft.unplannedLines.push({ id: 'u1', name: 'Delivery', actualAmount: '50000' })

    expect(buildActualCostPayload(draft, { uid: 'u1', name: 'Admin' }, 'finalized')).toMatchObject({
      actualTotal: 325000,
      baselineTotal: 300000,
      variance: 25000,
      variancePercent: 8.333333333333332,
      status: 'finalized',
    })
  })

  it('summarizes actualization progress for a No Job group', () => {
    const group = { grandTotal: 500000, estimates: [{ id: 'e1', grandTotal: 300000 }, { id: 'e2', grandTotal: 200000 }] }
    const summary = summarizeActualCosts(group, [
      { estimateId: 'e1', actualTotal: 325000, status: 'finalized' },
      { estimateId: 'e2', actualTotal: 100000, status: 'draft' },
    ])

    expect(summary).toMatchObject({ actualTotal: 425000, variance: -75000, finalizedCount: 1, reportCount: 2 })
  })
})
