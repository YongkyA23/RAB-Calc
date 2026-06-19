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

function getUnitPrice(item, size) {
  const price = item?.prices?.[size]

  if (!Number.isFinite(Number(price)) || Number(price) <= 0) {
    throw new Error(`No price is configured for ${size}`)
  }

  return Number(price)
}

export function calculatePrintLineTotal({ item, size, qty }) {
  return getUnitPrice(item, size) * requirePositiveNumber(qty, 'Qty')
}

export function calculateDigitalLineTotal({ item, size, qty }) {
  return getUnitPrice(item, size) * requirePositiveNumber(qty, 'Qty')
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

  return {
    toolingCost,
    laborCost,
    formulaTotal,
    total: item?.minimumType === 'byRequest' ? formulaTotal : Math.max(optionalNumber(item?.minimumCharge, 0), formulaTotal),
  }
}

export function calculateManpowerLineTotal({ days, rate }) {
  return requirePositiveNumber(days, 'Days') * requirePositiveNumber(rate, 'Rate')
}

export function calculateAdditionalLineTotal({ mode, amount, quantity, rate, lengthCm, widthCm }) {
  if (mode === 'manual') {
    return requirePositiveNumber(amount, 'Amount')
  }

  if (mode === 'rate') {
    return requirePositiveNumber(quantity, 'Quantity') * requirePositiveNumber(rate, 'Rate')
  }

  if (mode === 'area') {
    return requirePositiveNumber(lengthCm, 'Length')
      * requirePositiveNumber(widthCm, 'Width')
      * requirePositiveNumber(quantity, 'Quantity')
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
