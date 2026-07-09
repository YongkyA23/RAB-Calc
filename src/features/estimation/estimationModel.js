import {
  calculateAdditionalLineTotal,
  calculateDigitalLineTotal,
  calculateGrandTotal,
  calculateManualLineTotal,
  calculateManpowerLineTotal,
  calculatePrintLineTotal,
  calculateTurnaroundDays,
  sumLayerTotals,
} from '../../lib/calculations'

export function createEmptyQuoteDraft() {
  return {
    header: { jobNo: '', sku: '', client: '', project: '' },
    print: [],
    digital: [],
    manual: [],
    manpower: [],
    additional: [],
  }
}

function findItem(items, itemId) {
  return items.find((item) => item.id === itemId)
}

function hasAnyLine(draft) {
  return ['print', 'digital', 'manual', 'manpower', 'additional'].some((layer) => draft[layer]?.length > 0)
}

function isPositiveNumber(value) {
  const number = Number(value)
  return Number.isFinite(number) && number > 0
}

function isNonNegativeNumber(value) {
  const number = Number(value)
  return Number.isFinite(number) && number >= 0
}

function validatePositive(errors, value, message) {
  if (!isPositiveNumber(value)) errors.push(message)
}

function validateNonNegative(errors, value, message) {
  if (!isNonNegativeNumber(value)) errors.push(message)
}

export function validateQuoteDraft(draft, priceItems) {
  const errors = []

  if (!draft.header.jobNo?.trim()) errors.push('No Job is required')
  if (!draft.header.sku?.trim()) errors.push('SKU is required')
  if (!draft.header.client?.trim()) errors.push('Client is required')
  if (!draft.header.project?.trim()) errors.push('Project is required')
  if (!hasAnyLine(draft)) errors.push('At least one cost line is required')

  for (const line of draft.print ?? []) {
    validatePositive(errors, line.qty, 'Print quantity must be greater than 0')
  }

  for (const line of draft.digital ?? []) {
    validatePositive(errors, line.qty, 'Digital quantity must be greater than 0')
  }

  for (const line of draft.manual ?? []) {
    validatePositive(errors, line.p, 'Manual length must be greater than 0')
    validatePositive(errors, line.l, 'Manual width must be greater than 0')
    validatePositive(errors, line.qty, 'Manual quantity must be greater than 0')
    validateNonNegative(errors, line.jmlAlat ?? 0, 'Manual tool count cannot be negative')
  }

  for (const line of draft.manpower ?? []) {
    validatePositive(errors, line.days, 'Manpower days must be greater than 0')
  }

  for (const line of draft.additional ?? []) {
    const item = findItem(priceItems, line.itemId)
    validatePositive(errors, line.quantity, 'Additional quantity must be greater than 0')

    if (item?.additionalMode === 'area') {
      validatePositive(errors, line.lengthCm, 'Additional length must be greater than 0')
      validatePositive(errors, line.widthCm, 'Additional width must be greater than 0')
    } else {
      validatePositive(errors, line.amount ?? item?.rate, 'Additional amount must be greater than 0')
    }
  }

  return errors
}

export const validateEstimateForCreation = validateQuoteDraft

function itemSnapshot(item) {
  return { ...item }
}

function buildLine({ layer, input, item, computedTotal, details = {} }) {
  return {
    id: `${layer}-${input.itemId}-${crypto.randomUUID?.() ?? Date.now()}`,
    layer,
    inputs: { ...input },
    priceSnapshot: itemSnapshot(item),
    computedTotal,
    ...details,
  }
}

export function buildQuoteFromDraft(draft, priceItems, createdBy) {
  const printLines = (draft.print ?? []).map((line) => {
    const item = findItem(priceItems, line.itemId)
    const computedTotal = calculatePrintLineTotal({ item, size: line.size ?? 'A3', qty: line.qty })
    return buildLine({ layer: 'print', input: line, item, computedTotal })
  })

  const digitalLines = (draft.digital ?? []).map((line) => {
    const item = findItem(priceItems, line.itemId)
    const computedTotal = calculateDigitalLineTotal({ item, size: line.size ?? 'A3', qty: line.qty })
    return buildLine({ layer: 'digital', input: line, item, computedTotal })
  })

  const manualLines = (draft.manual ?? []).map((line) => {
    const item = findItem(priceItems, line.itemId)
    const result = calculateManualLineTotal({ item, ...line })
    return buildLine({ layer: 'manual', input: line, item, computedTotal: result.total, details: result })
  })

  const manpowerLines = (draft.manpower ?? []).map((line) => {
    const item = findItem(priceItems, line.itemId)
    const computedTotal = calculateManpowerLineTotal({ days: line.days, rate: item.dailyRate })
    return buildLine({ layer: 'manpower', input: line, item, computedTotal })
  })

  const additionalLines = []
  let additionalRunningTotal = 0

  for (const line of draft.additional ?? []) {
    const item = findItem(priceItems, line.itemId)
    const linePercent = Number(line.percent) || 0
    const base = linePercent ? sumLayerTotals([...printLines, ...digitalLines, ...manualLines, ...manpowerLines].map((l) => l.computedTotal)) + additionalRunningTotal : 0
    const computedTotal = calculateAdditionalLineTotal({
      mode: item.additionalMode,
      amount: line.amount,
      quantity: line.quantity,
      rate: item.rate,
      lengthCm: line.lengthCm,
      widthCm: line.widthCm,
      percent: linePercent,
      baseTotal: base,
    })
    additionalLines.push(buildLine({ layer: 'additional', input: line, item, computedTotal }))
    additionalRunningTotal += computedTotal
  }

  const totals = {
    print: sumLayerTotals(printLines.map((line) => line.computedTotal)),
    digital: sumLayerTotals(digitalLines.map((line) => line.computedTotal)),
    manual: sumLayerTotals(manualLines.map((line) => line.computedTotal)),
    manpower: sumLayerTotals(manpowerLines.map((line) => line.computedTotal)),
    additional: sumLayerTotals(additionalLines.map((line) => line.computedTotal)),
  }
  const lineItems = [...printLines, ...digitalLines, ...manualLines, ...manpowerLines, ...additionalLines]

  return {
    id: `estimate-${Date.now()}`,
    header: { ...draft.header },
    lineItems,
    totals,
    grandTotal: calculateGrandTotal(totals),
    turnaroundDays: calculateTurnaroundDays(lineItems.map((line) => line.priceSnapshot?.turnaroundDays)),
    createdBy,
    draft: { ...draft },
    status: 'created',
  }
}

export function buildCreatedEstimateFromDraft(draft, priceItems, createdBy) {
  return buildQuoteFromDraft(draft, priceItems, createdBy)
}

export function buildDraftEstimateFromDraft(draft, createdBy, existingId = null, priceItems = []) {
  let computed
  try {
    computed = buildQuoteFromDraft(draft, priceItems, createdBy)
  } catch {
    computed = { lineItems: [], totals: { print: 0, digital: 0, manual: 0, manpower: 0, additional: 0 }, grandTotal: 0, turnaroundDays: 0 }
  }
  return {
    id: existingId ?? `estimate-${Date.now()}`,
    header: { ...draft.header },
    lineItems: computed.lineItems,
    totals: computed.totals,
    grandTotal: computed.grandTotal,
    turnaroundDays: computed.turnaroundDays,
    createdBy,
    draft: { ...draft },
    sourceQuoteId: draft.sourceQuoteId ?? null,
    status: 'draft',
  }
}
