import { normalizeSearchText } from '../../lib/format'

export function createEmptyVendorEstimateDraft() {
  return {
    projectTitle: '',
    vendorName: '',
    aeName: '',
    jobNo: '',
    quantity: '',
    unitPrice: '',
    attachmentUrl: '',
    attachmentName: '',
    attachmentType: '',
  }
}

export function validateVendorEstimateDraft(draft) {
  const errors = []

  if (!draft.projectTitle?.trim()) errors.push('Nama Job wajib diisi')
  if (!draft.vendorName?.trim()) errors.push('Nama vendor wajib diisi')
  if (!draft.aeName?.trim()) errors.push('Nama AE wajib diisi')
  if (!draft.jobNo?.trim()) errors.push('No Job wajib diisi')

  const quantity = Number(draft.quantity)
  if (!String(draft.quantity ?? '').trim()) {
    errors.push('Kuantiti wajib diisi')
  } else if (!Number.isInteger(quantity) || quantity <= 0) {
    errors.push('Kuantiti harus berupa bilangan bulat lebih dari 0')
  }

  const unitPrice = Number(draft.unitPrice)
  if (!String(draft.unitPrice ?? '').trim()) {
    errors.push('Harga satuan wajib diisi')
  } else if (!Number.isFinite(unitPrice) || unitPrice <= 0) {
    errors.push('Harga satuan harus lebih dari 0')
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
      estimate.jobNo,
      estimate.vendorName,
      estimate.aeName,
      estimate.attachmentName,
    ]
      .some((value) => normalizeSearchText(value).includes(query))
  })
}

export function buildVendorEstimateInput({ draft, existing, creator, id }) {
  const quantity = Number(draft.quantity)
  const unitPrice = Number(draft.unitPrice)

  return {
    id: existing?.id ?? id,
    projectTitle: draft.projectTitle.trim(),
    vendorName: draft.vendorName.trim(),
    aeName: draft.aeName?.trim() ?? '',
    jobNo: draft.jobNo.trim(),
    quantity,
    unitPrice,
    price: quantity * unitPrice,
    currency: 'IDR',
    attachmentUrl: draft.attachmentUrl?.trim() ?? '',
    attachmentName: draft.attachmentName?.trim() || '',
    attachmentType: draft.attachmentType || '',
    createdBy: creator,
    createdAt: existing?.createdAt,
  }
}

export function calculateVendorEstimateTotal(quantity, unitPrice) {
  const numericQuantity = Number(quantity)
  const numericUnitPrice = Number(unitPrice)

  if (!Number.isFinite(numericQuantity) || !Number.isFinite(numericUnitPrice)) return 0
  return Math.max(0, numericQuantity) * Math.max(0, numericUnitPrice)
}
