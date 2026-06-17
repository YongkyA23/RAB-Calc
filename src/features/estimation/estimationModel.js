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

export function validateQuoteDraft(draft, priceItems) {
  const errors = []

  if (!draft.header.jobNo?.trim()) errors.push('No Job is required')
  if (!draft.header.sku?.trim()) errors.push('SKU is required')
  if (!draft.header.client?.trim()) errors.push('Client is required')
  if (!draft.header.project?.trim()) errors.push('Project is required')
  if (!hasAnyLine(draft)) errors.push('At least one cost line is required')

  for (const line of draft.manual ?? []) {
    const item = findItem(priceItems, line.itemId)
    if (item?.minimumType === 'byRequest' && (!Number(line.manualQuotedAmount) || Number(line.manualQuotedAmount) <= 0)) {
      errors.push(`Manual quoted amount is required for ${item.name}`)
    }
  }

  return errors
}

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

  const additionalLines = (draft.additional ?? []).map((line) => {
    const item = findItem(priceItems, line.itemId)
    const computedTotal = calculateAdditionalLineTotal({
      mode: item.additionalMode,
      amount: line.amount,
      quantity: line.quantity,
      rate: item.rate,
    })
    return buildLine({ layer: 'additional', input: line, item, computedTotal })
  })

  const totals = {
    print: sumLayerTotals(printLines.map((line) => line.computedTotal)),
    digital: sumLayerTotals(digitalLines.map((line) => line.computedTotal)),
    manual: sumLayerTotals(manualLines.map((line) => line.computedTotal)),
    manpower: sumLayerTotals(manpowerLines.map((line) => line.computedTotal)),
    additional: sumLayerTotals(additionalLines.map((line) => line.computedTotal)),
  }
  const lineItems = [...printLines, ...digitalLines, ...manualLines, ...manpowerLines, ...additionalLines]

  return {
    id: `quote-${Date.now()}`,
    header: { ...draft.header },
    lineItems,
    totals,
    grandTotal: calculateGrandTotal(totals),
    turnaroundDays: calculateTurnaroundDays(lineItems.map((line) => line.priceSnapshot?.turnaroundDays)),
    createdBy,
  }
}
