import { describe, expect, it } from 'vitest'
import { buildCsv, buildJobLogCsv, buildVendorEstimateCsv } from './csv'

describe('csv helpers', () => {
  it('escapes commas quotes and newlines', () => {
    expect(
      buildCsv({
        headers: ['Client', 'Project'],
        rows: [{ client: 'PT Example, Tbk', project: 'Box "A"\nMockup' }],
        columns: [
          { header: 'Client', value: (row) => row.client },
          { header: 'Project', value: (row) => row.project },
        ],
      }),
    ).toBe('Client,Project\r\n"PT Example, Tbk","Box ""A""\nMockup"')
  })

  it('builds price estimation CSV with required columns', () => {
    const csv = buildJobLogCsv([
      {
        date: '2026-06-17',
        jobNo: 'JOB-001',
        sku: 'SKU-1',
        client: 'PT Client',
        project: 'Carton Mockup',
        aeName: 'Ayu',
        createdByName: 'Admin',
        totals: { print: 1000, digital: 2000, manual: 3000, manpower: 4000, additional: 5000 },
        grandTotal: 15000,
      },
    ])

    expect(csv).toContain('Date,Status,No Job,SKU,Client,Project,AE Name,Created By,Total Print')
    expect(csv).toContain('2026-06-17,Created,JOB-001,SKU-1,PT Client,Carton Mockup,Ayu,Admin,1000,2000,3000,4000,5000,15000')
  })

  it('builds vendor estimate CSV with quantity unit price and total', () => {
    const csv = buildVendorEstimateCsv([{
      projectTitle: 'Banner',
      jobNo: 'JOB-001',
      vendorName: 'Vendor A',
      aeName: 'Ayu',
      quantity: 3,
      unitPrice: 2000,
      price: 6000,
    }])

    expect(csv).toContain('Job Name,Job No,Vendor,AE Name,Quantity,Unit Price,Total Price')
    expect(csv).toContain('Banner,JOB-001,Vendor A,Ayu,3,2000,6000')
  })
})
