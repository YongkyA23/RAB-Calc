export function buildUserProfilePayload({ uid, email, name, role = 'Estimator', status = 'active' }) {
  return {
    uid,
    email,
    name,
    role,
    status,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}

export function diffChangedFields(previous = {}, next = {}) {
  const changedFields = []
  const previousValues = {}
  const newValues = {}
  const keys = new Set([...Object.keys(previous), ...Object.keys(next)])

  for (const key of keys) {
    if (JSON.stringify(previous[key]) !== JSON.stringify(next[key])) {
      if (previous[key] !== undefined || next[key] !== undefined) changedFields.push(key)
      if (previous[key] !== undefined) previousValues[key] = previous[key]
      if (next[key] !== undefined) newValues[key] = next[key]
    }
  }

  return { changedFields, previousValues, newValues }
}

export function buildPriceAuditEntry({ itemId, categoryId, action, previous = {}, next = {}, editedBy }) {
  const diff = diffChangedFields(previous, next)

  return {
    itemId,
    categoryId,
    action,
    changedFields: diff.changedFields,
    previousValues: diff.previousValues,
    newValues: diff.newValues,
    editedBy,
    editedAt: new Date().toISOString(),
  }
}

export function buildEstimatePayload({
  id,
  header,
  lineItems = [],
  totals = { print: 0, digital: 0, manual: 0, manpower: 0, additional: 0 },
  grandTotal = 0,
  turnaroundDays = 0,
  createdBy,
  sourceQuoteId = null,
  status = 'created',
  draft = null,
}) {
  const now = new Date().toISOString()

  return {
    id,
    jobNo: header?.jobNo ?? '',
    sku: header?.sku ?? '',
    client: header?.client ?? '',
    project: header?.project ?? '',
    date: now,
    updatedAt: now,
    createdBy: createdBy.uid,
    createdByName: createdBy.name,
    sourceQuoteId,
    draft,
    lineItems,
    totals,
    grandTotal,
    turnaroundDays,
    status,
  }
}

export function buildQuotePayload(input) {
  return buildEstimatePayload({ ...input, status: input.status === 'draft' ? 'draft' : 'created' })
}

export function buildVendorEstimatePayload({
  id,
  projectTitle = '',
  projectInfo = '',
  vendorName = '',
  price = 0,
  currency = 'IDR',
  attachmentUrl = '',
  attachmentName = '',
  attachmentType = '',
  createdBy,
  createdAt,
}) {
  const now = new Date().toISOString()
  const numericPrice = Number(price)

  return {
    id,
    projectTitle,
    projectInfo,
    vendorName,
    price: Number.isFinite(numericPrice) ? numericPrice : 0,
    currency,
    attachmentUrl,
    attachmentName,
    attachmentType,
    createdBy: createdBy?.uid ?? '',
    createdByName: createdBy?.name ?? '',
    createdAt: createdAt ?? now,
    updatedAt: now,
  }
}
