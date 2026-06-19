import { describe, expect, it, vi } from 'vitest'
import { buildInternalEstimatePdfHtml, printInternalEstimatePdf } from './estimatePdf'

const estimate = {
  id: 'e1',
  status: 'created',
  date: '2026-06-19T10:00:00.000Z',
  jobNo: 'JOB-001',
  sku: 'SKU-1',
  client: 'PT <Client>',
  project: 'Carton & Label',
  createdByName: 'Admin',
  totals: { print: 1000, digital: 2000, manual: 3000, manpower: 4000, additional: 5000 },
  grandTotal: 15000,
  turnaroundDays: 2,
  lineItems: [
    {
      id: 'line-1',
      layer: 'print',
      computedTotal: 1000,
      inputs: { size: 'A3', qty: 2, notes: '<rush>' },
      priceSnapshot: { name: 'Duplex <270>', prices: { A3: 500 } },
    },
    {
      id: 'line-2',
      layer: 'manpower',
      computedTotal: 4000,
      inputs: { days: 2 },
      priceSnapshot: { name: 'Installer', dailyRate: 2000 },
    },
  ],
}

describe('estimate PDF helpers', () => {
  it('builds internal estimate detail HTML with escaped estimate and line item data', () => {
    const html = buildInternalEstimatePdfHtml(estimate)

    expect(html).toContain('Internal Estimate Detail')
    expect(html).toContain('JOB-001')
    expect(html).toContain('SKU-1')
    expect(html).toContain('PT &lt;Client&gt;')
    expect(html).toContain('Carton &amp; Label')
    expect(html).toContain('Rp 15.000')
    expect(html).toContain('Duplex &lt;270&gt;')
    expect(html).toContain('Notes: &lt;rush&gt;')
    expect(html).toContain('Rp 500 × 2 = Rp 1.000')
    expect(html).toContain('Rp 2.000 × 2 day = Rp 4.000')
    expect(html).not.toContain('PT <Client>')
    expect(html).not.toContain('<rush>')
  })

  it('opens a print window and writes the internal estimate PDF HTML', () => {
    const write = vi.fn()
    const close = vi.fn()
    const focus = vi.fn()
    const print = vi.fn()
    const opener = vi.fn(() => ({ document: { write, close }, focus, print }))

    printInternalEstimatePdf(estimate, opener)

    expect(opener).toHaveBeenCalledWith('', '_blank', 'width=900,height=700')
    expect(write).toHaveBeenCalledWith(expect.stringContaining('Internal Estimate Detail'))
    expect(close).toHaveBeenCalledOnce()
    expect(focus).toHaveBeenCalledOnce()
    expect(print).toHaveBeenCalledOnce()
  })
})
