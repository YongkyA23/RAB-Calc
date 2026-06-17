import { describe, expect, it } from 'vitest'
import { buildCsv, buildJobLogCsv } from './csv'

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

  it('builds job log CSV with required columns', () => {
    const csv = buildJobLogCsv([
      {
        date: '2026-06-17',
        jobNo: 'JOB-001',
        sku: 'SKU-1',
        client: 'PT Client',
        project: 'Carton Mockup',
        createdByName: 'Admin',
        totals: { print: 1000, digital: 2000, manual: 3000, manpower: 4000, additional: 5000 },
        grandTotal: 15000,
      },
    ])

    expect(csv).toContain('Date,No Job,SKU,Client,Project,Created By,Total Print')
    expect(csv).toContain('2026-06-17,JOB-001,SKU-1,PT Client,Carton Mockup,Admin,1000,2000,3000,4000,5000,15000')
  })
})
