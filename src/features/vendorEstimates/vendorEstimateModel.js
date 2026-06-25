import { normalizeSearchText } from '../../lib/format'

export function createEmptyVendorEstimateDraft() {
  return {
    projectTitle: '',
    projectInfo: '',
    vendorName: '',
    price: '',
    attachmentUrl: '',
    attachmentName: '',
    attachmentType: '',
  }
}

export function validateVendorEstimateDraft(draft) {
  const errors = []

  if (!draft.projectTitle?.trim()) errors.push('Project title is required')
  if (!draft.projectInfo?.trim()) errors.push('Project info is required')
  if (!draft.vendorName?.trim()) errors.push('Vendor name is required')

  const priceNumber = Number(draft.price)
  if (!String(draft.price ?? '').trim()) {
    errors.push('Price is required')
  } else if (!Number.isFinite(priceNumber) || priceNumber < 0) {
    errors.push('Price must be a valid number')
  }

  if (!draft.attachmentUrl?.trim()) {
    errors.push('Attachment (PDF or image) is required')
  }

  return errors
}

export function filterVendorEstimates(estimates, filters) {
  const query = normalizeSearchText(filters.query)

  return estimates.filter((estimate) => {
    if (!query) return true

    return [
      estimate.projectTitle,
      estimate.projectInfo,
      estimate.vendorName,
      estimate.attachmentName,
    ]
      .some((value) => normalizeSearchText(value).includes(query))
  })
}

export function buildVendorEstimateInput({ draft, existing, creator, id }) {
  return {
    id: existing?.id ?? id,
    projectTitle: draft.projectTitle.trim(),
    projectInfo: draft.projectInfo.trim(),
    vendorName: draft.vendorName.trim(),
    price: Number(draft.price || 0),
    currency: 'IDR',
    attachmentUrl: draft.attachmentUrl?.trim() ?? '',
    attachmentName: draft.attachmentName?.trim() || '',
    attachmentType: draft.attachmentType || '',
    createdBy: creator,
    createdAt: existing?.createdAt,
  }
}
