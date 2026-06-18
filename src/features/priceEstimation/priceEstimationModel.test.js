import { describe, expect, it } from 'vitest'
import { buildDraftFromEstimate, filterEstimates, getEmptyEstimateFilters, normalizeEstimateStatus } from './priceEstimationModel'

const estimates = [
  { id: 'e1', status: 'draft', date: '2026-06-17T10:00:00.000Z', jobNo: '', sku: 'SKU-A', client: 'PT Alpha', project: 'Carton', createdByName: 'Admin', grandTotal: 0, draft: { header: { jobNo: '', sku: 'SKU-A', client: 'PT Alpha', project: 'Carton' }, print: [], digital: [], manual: [], manpower: [], additional: [] } },
  { id: 'e2', status: 'created', date: '2026-06-18T10:00:00.000Z', jobNo: 'JOB-002', sku: 'SKU-B', client: 'PT Beta', project: 'Label', createdByName: 'Estimator', grandTotal: 5000000, lineItems: [] },
  { id: 'legacy', date: '2026-06-19T10:00:00.000Z', jobNo: 'JOB-003', sku: 'SKU-C', client: 'PT Legacy', project: 'Legacy', createdByName: 'Admin', grandTotal: 3000000, lineItems: [] },
]

describe('price estimation model', () => {
  it('normalizes legacy and finalized estimates as created', () => {
    expect(normalizeEstimateStatus({ status: 'draft' })).toBe('draft')
    expect(normalizeEstimateStatus({ status: 'created' })).toBe('created')
    expect(normalizeEstimateStatus({ status: 'finalized' })).toBe('created')
    expect(normalizeEstimateStatus({})).toBe('created')
  })

  it('creates empty estimate filters with status filter', () => {
    expect(getEmptyEstimateFilters()).toEqual({ query: '', fromDate: '', toDate: '', createdBy: '', minTotal: '', maxTotal: '', status: 'all' })
  })

  it('filters estimates by status and query', () => {
    expect(filterEstimates(estimates, { ...getEmptyEstimateFilters(), status: 'draft' }).map((estimate) => estimate.id)).toEqual(['e1'])
    expect(filterEstimates(estimates, { ...getEmptyEstimateFilters(), query: 'beta' }).map((estimate) => estimate.id)).toEqual(['e2'])
  })

  it('builds draft from saved raw draft when available', () => {
    expect(buildDraftFromEstimate(estimates[0])).toMatchObject({
      header: { jobNo: '', sku: 'SKU-A', client: 'PT Alpha', project: 'Carton' },
      sourceQuoteId: 'e1',
    })
  })
})
