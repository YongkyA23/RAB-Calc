import { describe, expect, it } from 'vitest'
import { buildQuoteFromDraft, createEmptyQuoteDraft, validateQuoteDraft } from './estimationModel'

const items = [
  { id: 'print-duplex', categoryLayer: 'print', name: 'Duplex', prices: { A3: 30000, B2: 40000, LARGE_FORMAT: 80000 }, pricesAbove10: { A3: 25000, B2: 35000, LARGE_FORMAT: 70000 }, turnaroundDays: 1 },
  { id: 'digital-lam', categoryLayer: 'digital', name: 'Laminating', prices: { A3: 10000, B2: 15000 }, turnaroundDays: 1 },
  { id: 'manual-die', categoryLayer: 'manual', name: 'Die Cut Manual', toolingRate: 3500, laborRate: 15, minimumType: 'numeric', minimumCharge: 250000, turnaroundDays: 3 },
  { id: 'manual-request', categoryLayer: 'manual', name: 'UV Matte', toolingRate: null, laborRate: 0.75, minimumType: 'byRequest', minimumCharge: null, turnaroundDays: 2 },
  { id: 'manpower-default', categoryLayer: 'manpower', name: 'Default Manpower', dailyRate: 275000, turnaroundDays: 0 },
  { id: 'additional-paper', categoryLayer: 'additional', name: 'Paper Purchase', additionalMode: 'rate', rate: 5000, unitLabel: 'sheet', turnaroundDays: 0 },
  { id: 'additional-operator', categoryLayer: 'additional', name: 'Operator Fee', additionalMode: 'manual', turnaroundDays: 0 },
  { id: 'additional-rush', categoryLayer: 'additional', name: 'Rush Job', additionalMode: 'percent', rate: 10, unitLabel: '%', turnaroundDays: 0 },
]

describe('estimation model', () => {
  it('creates an empty quote draft with required layers', () => {
    expect(createEmptyQuoteDraft()).toMatchObject({
      header: { jobNo: '', sku: '', client: '', project: '', aeName: '' },
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
      'Nama AE wajib diisi',
      'At least one cost line is required',
    ])
  })

  it('builds quote totals from all cost layers', () => {
    const draft = {
      header: { jobNo: 'JOB-001', sku: 'SKU-1', client: 'PT Client', project: 'Mockup', aeName: 'Ayu' },
      print: [{ itemId: 'print-duplex', size: 'B2', qty: 110 }],
      digital: [{ itemId: 'digital-lam', size: 'A3', qty: 12 }],
      manual: [{ itemId: 'manual-die', p: 10, l: 10, qty: 2, jmlAlat: 1 }],
      manpower: [{ itemId: 'manpower-default', days: 3 }],
      additional: [{ itemId: 'additional-paper', quantity: 200 }],
    }

    const quote = buildQuoteFromDraft(draft, items, { uid: 'u1', name: 'Admin' })

    expect(quote.totals).toEqual({
      print: 3850000,
      digital: 120000,
      manual: 600000,
      manpower: 825000,
      additional: 1000000,
    })
    expect(quote.grandTotal).toBe(6395000)
    expect(quote.turnaroundDays).toBe(3)
    expect(quote.lineItems).toHaveLength(5)
    expect(quote.createdBy).toEqual({ uid: 'u1', name: 'Admin' })
    expect(quote.lineItems[0].unitPrice).toBe(35000)
  })

  it('uses a percentage configured in master data and excludes manpower from its base', () => {
    const draft = {
      header: { jobNo: 'JOB-002', sku: 'SKU-2', client: 'PT Client', project: 'Rush', aeName: 'Ayu' },
      print: [{ itemId: 'print-duplex', size: 'A3', qty: 10 }],
      digital: [],
      manual: [],
      manpower: [{ itemId: 'manpower-default', days: 1 }],
      additional: [{ itemId: 'additional-rush' }],
    }

    const quote = buildQuoteFromDraft(draft, items, { uid: 'u1', name: 'Admin' })

    expect(quote.totals.additional).toBe(30000)
    expect(quote.grandTotal).toBe(605000)
  })

  it('multiplies a manual additional amount by its quantity', () => {
    const draft = {
      header: { jobNo: 'JOB-004', sku: 'SKU-4', client: 'PT Client', project: 'Install', aeName: 'Ayu' },
      print: [],
      digital: [],
      manual: [],
      manpower: [],
      additional: [{ itemId: 'additional-operator', amount: 45000, quantity: 2 }],
    }

    const quote = buildQuoteFromDraft(draft, items, { uid: 'u1', name: 'Admin' })

    expect(quote.totals.additional).toBe(90000)
    expect(quote.grandTotal).toBe(90000)
  })

  it('reports an unavailable Large Format price before estimate creation', () => {
    const draft = {
      header: { jobNo: 'JOB-003', sku: 'SKU-3', client: 'PT Client', project: 'Banner', aeName: 'Ayu' },
      print: [{ itemId: 'digital-lam', size: 'LARGE_FORMAT', qty: 2 }],
      digital: [],
      manual: [],
      manpower: [],
      additional: [],
    }

    expect(validateQuoteDraft(draft, items)).toContain(
      'Harga print untuk ukuran Large Format belum tersedia',
    )
  })
})
