import { describe, expect, it } from 'vitest'
import {
  buildVendorEstimateInput,
  createEmptyVendorEstimateDraft,
  filterVendorEstimates,
  validateVendorEstimateDraft,
} from './vendorEstimateModel'

describe('vendor estimate model', () => {
  it('creates empty draft', () => {
    expect(createEmptyVendorEstimateDraft()).toEqual({
      projectTitle: '',
      projectInfo: '',
      vendorName: '',
      price: '',
      attachmentUrl: '',
      attachmentName: '',
      attachmentType: '',
    })
  })

  it('validates required fields', () => {
    const errors = validateVendorEstimateDraft(createEmptyVendorEstimateDraft())
    expect(errors).toContain('Project title is required')
    expect(errors).toContain('Project info is required')
    expect(errors).toContain('Vendor name is required')
    expect(errors).toContain('Price is required')
    expect(errors).toContain('Attachment (PDF or image) is required')
  })

  it('filters by query across project/vendor/attachment name', () => {
    const estimates = [
      { projectTitle: 'Box A', projectInfo: 'Mockup', vendorName: 'PT Alpha', attachmentName: 'alpha.pdf' },
      { projectTitle: 'Label B', projectInfo: 'Sticker', vendorName: 'PT Beta', attachmentName: 'beta.pdf' },
    ]

    expect(filterVendorEstimates(estimates, { query: 'alpha' })).toHaveLength(1)
    expect(filterVendorEstimates(estimates, { query: 'label' })).toHaveLength(1)
    expect(filterVendorEstimates(estimates, { query: '' })).toHaveLength(2)
  })

  it('builds normalized input with numeric price', () => {
    expect(
      buildVendorEstimateInput({
        creator: { uid: 'u1', name: 'Admin' },
        draft: {
          projectTitle: ' Box ',
          projectInfo: ' Info ',
          vendorName: ' Vendor ',
          price: '1000',
          attachmentUrl: ' https://res.cloudinary.com/demo/raw/upload/a.pdf ',
          attachmentName: ' Quote.pdf ',
          attachmentType: 'pdf',
        },
        id: 've-1',
      }),
    ).toMatchObject({
      id: 've-1',
      projectTitle: 'Box',
      projectInfo: 'Info',
      vendorName: 'Vendor',
      price: 1000,
      currency: 'IDR',
      createdBy: { uid: 'u1', name: 'Admin' },
      attachmentUrl: 'https://res.cloudinary.com/demo/raw/upload/a.pdf',
      attachmentName: 'Quote.pdf',
      attachmentType: 'pdf',
    })
  })
})
