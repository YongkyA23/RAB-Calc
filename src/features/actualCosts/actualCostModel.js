function numberOrNull(value) {
  if (value === '' || value === null || value === undefined) return null
  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

function plannedQuantity(line) {
  return line.inputs?.qty ?? line.inputs?.quantity ?? line.inputs?.days ?? ''
}

function plannedUnitCost(line) {
  const quantity = Number(plannedQuantity(line))
  return quantity > 0 ? Number(line.computedTotal || 0) / quantity : ''
}

export function actualLineTotal(line) {
  const directAmount = numberOrNull(line.actualAmount)
  if (directAmount !== null) return directAmount

  const quantity = numberOrNull(line.actualQuantity)
  const unitCost = numberOrNull(line.actualUnitCost)
  return quantity !== null && unitCost !== null ? quantity * unitCost : 0
}

export function hasRecordedActual(line) {
  return numberOrNull(line.actualAmount) !== null
    || (numberOrNull(line.actualQuantity) !== null && numberOrNull(line.actualUnitCost) !== null)
}

export function createActualCostDraft(estimate) {
  return {
    id: estimate.id,
    estimateId: estimate.id,
    jobNo: estimate.jobNo ?? '',
    status: 'draft',
    baselineSnapshot: {
      id: estimate.id,
      jobNo: estimate.jobNo ?? '',
      sku: estimate.sku ?? '',
      client: estimate.client ?? '',
      project: estimate.project ?? '',
      grandTotal: Number(estimate.grandTotal) || 0,
      lineItems: (estimate.lineItems ?? []).map((line) => ({ ...line })),
    },
    lines: (estimate.lineItems ?? []).map((line) => ({
      id: `actual-${line.id}`,
      estimateLineId: line.id,
      layer: line.layer,
      name: line.priceSnapshot?.name ?? line.layer,
      plannedQuantity: plannedQuantity(line),
      plannedUnitCost: plannedUnitCost(line),
      plannedTotal: Number(line.computedTotal) || 0,
      actualQuantity: '',
      actualUnitCost: '',
      actualAmount: '',
      supplier: '',
      invoiceNo: '',
      transactionDate: '',
      notes: '',
    })),
    unplannedLines: [],
  }
}

export function createUnplannedActualLine() {
  return {
    id: globalThis.crypto?.randomUUID?.() ?? `unplanned-${Date.now()}`,
    name: '',
    actualQuantity: '',
    actualUnitCost: '',
    actualAmount: '',
    supplier: '',
    invoiceNo: '',
    transactionDate: '',
    notes: '',
  }
}

export function validateActualCostDraft(draft, finalize = false) {
  const errors = []
  const allLines = [...(draft.lines ?? []), ...(draft.unplannedLines ?? [])]

  for (const line of allLines) {
    if (line.actualAmount !== '' && Number(line.actualAmount) < 0) errors.push(`${line.name || 'Biaya aktual'} tidak boleh negatif`)
    if (line.actualQuantity !== '' && Number(line.actualQuantity) < 0) errors.push(`${line.name || 'Biaya aktual'}: jumlah tidak boleh negatif`)
    if (line.actualUnitCost !== '' && Number(line.actualUnitCost) < 0) errors.push(`${line.name || 'Biaya aktual'}: harga tidak boleh negatif`)
  }

  for (const line of draft.unplannedLines ?? []) {
    if (!line.name?.trim()) errors.push('Nama biaya di luar RAB wajib diisi')
    if (!hasRecordedActual(line)) errors.push(`${line.name || 'Biaya di luar RAB'} belum memiliki nilai aktual`)
  }

  if (finalize) {
    for (const line of draft.lines ?? []) {
      if (!hasRecordedActual(line)) errors.push(`${line.name} belum diaktualisasi`)
    }
  }

  return [...new Set(errors)]
}

function normalizeLine(line) {
  const recorded = hasRecordedActual(line)

  return {
    ...line,
    name: String(line.name ?? '').trim(),
    actualQuantity: numberOrNull(line.actualQuantity),
    actualUnitCost: numberOrNull(line.actualUnitCost),
    actualAmount: recorded ? actualLineTotal(line) : null,
    supplier: String(line.supplier ?? '').trim(),
    invoiceNo: String(line.invoiceNo ?? '').trim(),
    transactionDate: line.transactionDate || null,
    notes: String(line.notes ?? '').trim(),
  }
}

export function buildActualCostPayload(draft, editedBy, status = 'draft') {
  const lines = (draft.lines ?? []).map(normalizeLine)
  const unplannedLines = (draft.unplannedLines ?? []).map(normalizeLine)
  const baselineTotal = Number(draft.baselineSnapshot?.grandTotal) || 0
  const actualTotal = [...lines, ...unplannedLines].reduce((sum, line) => sum + (line.actualAmount ?? 0), 0)
  const variance = actualTotal - baselineTotal
  const now = new Date().toISOString()

  return {
    id: draft.id,
    estimateId: draft.estimateId,
    jobNo: draft.jobNo,
    status,
    baselineSnapshot: draft.baselineSnapshot,
    baselineTotal,
    lines,
    unplannedLines,
    actualTotal,
    variance,
    variancePercent: baselineTotal ? variance / baselineTotal * 100 : 0,
    updatedBy: editedBy.uid,
    updatedByName: editedBy.name,
    updatedAt: now,
    finalizedAt: status === 'finalized' ? now : null,
  }
}

export function summarizeActualCosts(group, actualCosts) {
  const byEstimateId = new Map(actualCosts.map((actualCost) => [actualCost.estimateId, actualCost]))
  const reports = group.estimates.map((estimate) => byEstimateId.get(estimate.id)).filter(Boolean)
  const plannedTotal = group.estimates.reduce((sum, estimate) => {
    const report = byEstimateId.get(estimate.id)
    return sum + (Number(report?.baselineTotal ?? estimate.grandTotal) || 0)
  }, 0)
  const actualTotal = reports.reduce((sum, report) => sum + (Number(report.actualTotal) || 0), 0)
  const variance = actualTotal - plannedTotal

  return {
    actualTotal,
    finalizedCount: reports.filter((report) => report.status === 'finalized').length,
    reportCount: reports.length,
    totalCount: group.estimates.length,
    plannedTotal,
    variance,
    variancePercent: plannedTotal ? variance / plannedTotal * 100 : 0,
  }
}
