import { describe, expect, it } from 'vitest'
import { buildDraftFromQuote, filterQuotes, getEmptyQuoteFilters } from './jobLogModel'

const quotes = [
  {
    id: 'q1',
    date: '2026-06-17T10:00:00.000Z',
    jobNo: 'JOB-001',
    sku: 'SKU-A',
    client: 'PT Alpha',
    project: 'Carton Mockup',
    createdByName: 'Admin',
    grandTotal: 1000000,
    lineItems: [{ layer: 'print', inputs: { itemId: 'print-duplex', size: 'A3', qty: 2 } }],
  },
  {
    id: 'q2',
    date: '2026-06-18T10:00:00.000Z',
    jobNo: 'JOB-002',
    sku: 'SKU-B',
    client: 'PT Beta',
    project: 'Label Mockup',
    createdByName: 'Estimator',
    grandTotal: 5000000,
    lineItems: [],
  },
]

describe('job log model', () => {
  it('creates empty filters', () => {
    expect(getEmptyQuoteFilters()).toEqual({
      query: '',
      fromDate: '',
      toDate: '',
      createdBy: '',
      minTotal: '',
      maxTotal: '',
    })
  })

  it('filters quotes by query across job sku client and project', () => {
    expect(filterQuotes(quotes, { ...getEmptyQuoteFilters(), query: 'alpha' }).map((quote) => quote.id)).toEqual(['q1'])
    expect(filterQuotes(quotes, { ...getEmptyQuoteFilters(), query: 'SKU-B' }).map((quote) => quote.id)).toEqual(['q2'])
  })

  it('filters quotes by date creator and total range', () => {
    expect(
      filterQuotes(quotes, {
        ...getEmptyQuoteFilters(),
        fromDate: '2026-06-18',
        createdBy: 'Estimator',
        minTotal: '4000000',
        maxTotal: '6000000',
      }).map((quote) => quote.id),
    ).toEqual(['q2'])
  })

  it('builds a new draft from a saved quote', () => {
    expect(buildDraftFromQuote(quotes[0])).toEqual({
      header: { jobNo: '', sku: 'SKU-A', client: 'PT Alpha', project: 'Carton Mockup' },
      print: [{ itemId: 'print-duplex', size: 'A3', qty: 2 }],
      digital: [],
      manual: [],
      manpower: [],
      additional: [],
      sourceQuoteId: 'q1',
    })
  })
})
