function requirePositiveNumber(value, label) {
  const number = Number(value)

  if (!Number.isFinite(number) || number <= 0) {
    throw new Error(`${label} must be greater than 0`)
  }

  return number
}

function optionalNumber(value, fallback = 0) {
  const number = Number(value)

  if (!Number.isFinite(number)) {
    return fallback
  }

  return number
}

export const PRICE_SIZE_OPTIONS = [
  { value: 'A3', label: 'A3' },
  { value: 'B2', label: 'B2' },
  { value: 'LARGE_FORMAT', label: 'Large Format' },
]

export function getUnitPrice(item, size, qty = 1) {
  const standardPrice = item?.prices?.[size]
  const bulkPrice = item?.pricesAbove10?.[size]
  const hasBulkPrice = Number.isFinite(Number(bulkPrice)) && Number(bulkPrice) > 0
  const price = Number(qty) > 10 && hasBulkPrice ? bulkPrice : standardPrice

  if (!Number.isFinite(Number(price)) || Number(price) <= 0) {
    throw new Error(`No price is configured for ${size}`)
  }

  return Number(price)
}

export function calculatePrintLineTotal({ item, size, qty }) {
  const quantity = requirePositiveNumber(qty, 'Qty')
  return getUnitPrice(item, size, quantity) * quantity
}

export function calculateDigitalLineTotal({ item, size, qty }) {
  const quantity = requirePositiveNumber(qty, 'Qty')
  return getUnitPrice(item, size, quantity) * quantity
}

export function calculateManualLineTotal({ item, p, l, qty, jmlAlat = 1 }) {
  const length = requirePositiveNumber(p, 'P')
  const width = requirePositiveNumber(l, 'L')
  const quantity = requirePositiveNumber(qty, 'Qty')
  const toolCount = optionalNumber(jmlAlat, 0)
  const toolingRate = optionalNumber(item?.toolingRate, 0)
  const laborRate = optionalNumber(item?.laborRate, 0)
  const toolingCost = length * width * toolingRate * toolCount
  const laborCost = length * width * laborRate * quantity
  const formulaTotal = toolingCost + laborCost
  const laborCharge = item?.minimumType === 'byRequest'
    ? laborCost
    : Math.max(optionalNumber(item?.minimumCharge, 0), laborCost)

  return {
    toolingCost,
    laborCost,
    laborCharge,
    formulaTotal,
    total: toolingCost + laborCharge,
  }
}

export function calculateManpowerLineTotal({ days, rate }) {
  return requirePositiveNumber(days, 'Days') * requirePositiveNumber(rate, 'Rate')
}

export function calculateAdditionalLineTotal({ mode, amount, quantity, rate, lengthCm, widthCm, percent, baseTotal }) {
  const percentage = percent || (mode === 'percent' ? rate : 0)
  const resolvedQuantity = quantity ?? 1

  if (percentage) {
    return optionalNumber(baseTotal, 0) * requirePositiveNumber(percentage, 'Percent') / 100
  }

  if (mode === 'manual') {
    return requirePositiveNumber(amount, 'Amount') * requirePositiveNumber(resolvedQuantity, 'Quantity')
  }

  if (mode === 'rate') {
    return requirePositiveNumber(resolvedQuantity, 'Quantity') * requirePositiveNumber(rate, 'Rate')
  }

  if (mode === 'area') {
    return requirePositiveNumber(lengthCm, 'Length')
      * requirePositiveNumber(widthCm, 'Width')
      * requirePositiveNumber(resolvedQuantity, 'Quantity')
      * requirePositiveNumber(rate, 'Rate')
  }

  return 0
}

export function sumLayerTotals(totals) {
  return totals.reduce((sum, total) => sum + optionalNumber(total, 0), 0)
}

export function calculateGrandTotal({ print = 0, digital = 0, manual = 0, manpower = 0, additional = 0 }) {
  return [print, digital, manual, manpower, additional].reduce(
    (sum, total) => sum + optionalNumber(total, 0),
    0,
  )
}

export function calculateTurnaroundDays(days) {
  return Math.max(0, ...days.map((day) => optionalNumber(day, 0)))
}
