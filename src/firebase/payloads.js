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
      changedFields.push(key)
      previousValues[key] = previous[key]
      newValues[key] = next[key]
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

export function buildQuotePayload({
  id,
  header,
  lineItems,
  totals,
  grandTotal,
  turnaroundDays,
  createdBy,
  sourceQuoteId = null,
}) {
  return {
    id,
    jobNo: header.jobNo,
    sku: header.sku,
    client: header.client,
    project: header.project,
    date: new Date().toISOString(),
    createdBy: createdBy.uid,
    createdByName: createdBy.name,
    sourceQuoteId,
    lineItems,
    totals,
    grandTotal,
    turnaroundDays,
    status: 'finalized',
  }
}
