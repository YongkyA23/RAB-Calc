import { describe, expect, it } from 'vitest'
import {
  buildVendorEstimateInput,
  calculateVendorEstimateTotal,
  createEmptyVendorEstimateDraft,
  filterVendorEstimates,
  validateVendorEstimateDraft,
} from './vendorEstimateModel'

describe('vendor estimate model', () => {
  it('creates empty draft', () => {
    expect(createEmptyVendorEstimateDraft()).toEqual({
      projectTitle: '',
      vendorName: '',
      aeName: '',
      jobNo: '',
      quantity: '',
      unitPrice: '',
      attachmentUrl: '',
      attachmentName: '',
      attachmentType: '',
    })
  })

  it('validates required fields', () => {
    const errors = validateVendorEstimateDraft(createEmptyVendorEstimateDraft())
    expect(errors).toContain('Nama Job wajib diisi')
    expect(errors).toContain('Nama vendor wajib diisi')
    expect(errors).toContain('Nama AE wajib diisi')
    expect(errors).toContain('No Job wajib diisi')
    expect(errors).toContain('Kuantiti wajib diisi')
    expect(errors).toContain('Harga satuan wajib diisi')
    expect(errors).toContain('Attachment (PDF or image) is required')
  })

  it('filters by query across project/vendor/attachment name', () => {
    const estimates = [
      { projectTitle: 'Box A', jobNo: 'JOB-001', vendorName: 'PT Alpha', attachmentName: 'alpha.pdf' },
      { projectTitle: 'Label B', jobNo: 'JOB-002', vendorName: 'PT Beta', attachmentName: 'beta.pdf' },
    ]

    expect(filterVendorEstimates(estimates, { query: 'alpha' })).toHaveLength(1)
    expect(filterVendorEstimates(estimates, { query: 'label' })).toHaveLength(1)
    expect(filterVendorEstimates(estimates, { query: 'job-002' })).toHaveLength(1)
    expect(filterVendorEstimates(estimates, { query: '' })).toHaveLength(2)
  })

  it('builds normalized input with numeric price', () => {
    expect(
      buildVendorEstimateInput({
        creator: { uid: 'u1', name: 'Admin' },
        draft: {
          projectTitle: ' Box ',
          vendorName: ' Vendor ',
          aeName: ' Ayu ',
          jobNo: ' JOB-001 ',
          quantity: '5',
          unitPrice: '1000',
          attachmentUrl: ' https://res.cloudinary.com/demo/raw/upload/a.pdf ',
          attachmentName: ' Quote.pdf ',
          attachmentType: 'pdf',
        },
        id: 've-1',
      }),
    ).toMatchObject({
      id: 've-1',
      projectTitle: 'Box',
      vendorName: 'Vendor',
      aeName: 'Ayu',
      jobNo: 'JOB-001',
      quantity: 5,
      unitPrice: 1000,
      price: 5000,
      currency: 'IDR',
      createdBy: { uid: 'u1', name: 'Admin' },
      attachmentUrl: 'https://res.cloudinary.com/demo/raw/upload/a.pdf',
      attachmentName: 'Quote.pdf',
      attachmentType: 'pdf',
    })
  })

  it('calculates total from quantity and unit price', () => {
    expect(calculateVendorEstimateTotal('12', '25000')).toBe(300000)
    expect(calculateVendorEstimateTotal('', '25000')).toBe(0)
  })
})
