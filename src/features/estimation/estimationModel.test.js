import { describe, expect, it } from 'vitest'
import { buildQuoteFromDraft, createEmptyQuoteDraft, validateQuoteDraft } from './estimationModel'

const items = [
  { id: 'print-duplex', categoryLayer: 'print', name: 'Duplex', prices: { A3: 30000, B2: 40000 }, turnaroundDays: 1 },
  { id: 'digital-lam', categoryLayer: 'digital', name: 'Laminating', prices: { A3: 10000, B2: 15000 }, turnaroundDays: 1 },
  { id: 'manual-die', categoryLayer: 'manual', name: 'Die Cut Manual', toolingRate: 3500, laborRate: 15, minimumType: 'numeric', minimumCharge: 250000, turnaroundDays: 3 },
  { id: 'manual-request', categoryLayer: 'manual', name: 'UV Matte', toolingRate: null, laborRate: 0.75, minimumType: 'byRequest', minimumCharge: null, turnaroundDays: 2 },
  { id: 'manpower-default', categoryLayer: 'manpower', name: 'Default Manpower', dailyRate: 275000, turnaroundDays: 0 },
  { id: 'additional-paper', categoryLayer: 'additional', name: 'Paper Purchase', additionalMode: 'rate', rate: 5000, unitLabel: 'sheet', turnaroundDays: 0 },
]

describe('estimation model', () => {
  it('creates an empty quote draft with required layers', () => {
    expect(createEmptyQuoteDraft()).toMatchObject({
      header: { jobNo: '', sku: '', client: '', project: '' },
      print: [],
      digital: [],
      manual: [],
      manpower: [],
      additional: [],
    })
  })

  it('validates required job header fields', () => {
    expect(validateQuoteDraft(createEmptyQuoteDraft(), items)).toEqual([
      'No Job is required',
      'SKU is required',
      'Client is required',
      'Project is required',
      'At least one cost line is required',
    ])
  })

  it('builds quote totals from all cost layers', () => {
    const draft = {
      header: { jobNo: 'JOB-001', sku: 'SKU-1', client: 'PT Client', project: 'Mockup' },
      print: [{ itemId: 'print-duplex', size: 'B2', qty: 110 }],
      digital: [{ itemId: 'digital-lam', size: 'A3', qty: 12 }],
      manual: [{ itemId: 'manual-die', p: 10, l: 10, qty: 2, jmlAlat: 1 }],
      manpower: [{ itemId: 'manpower-default', days: 3 }],
      additional: [{ itemId: 'additional-paper', quantity: 200 }],
    }

    const quote = buildQuoteFromDraft(draft, items, { uid: 'u1', name: 'Admin' })

    expect(quote.totals).toEqual({
      print: 4400000,
      digital: 120000,
      manual: 353000,
      manpower: 825000,
      additional: 1000000,
    })
    expect(quote.grandTotal).toBe(6698000)
    expect(quote.turnaroundDays).toBe(3)
    expect(quote.lineItems).toHaveLength(5)
    expect(quote.createdBy).toEqual({ uid: 'u1', name: 'Admin' })
  })

  it('requires manual quoted amount for by-request manual finishing', () => {
    const draft = {
      header: { jobNo: 'JOB-001', sku: 'SKU-1', client: 'PT Client', project: 'Mockup' },
      print: [],
      digital: [],
      manual: [{ itemId: 'manual-request', p: 10, l: 10, qty: 2, jmlAlat: 0 }],
      manpower: [],
      additional: [],
    }

    expect(validateQuoteDraft(draft, items)).toContain('Manual quoted amount is required for UV Matte')
  })
})
