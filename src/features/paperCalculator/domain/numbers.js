const GROUPING_OR_DECIMAL = /[.,]/g

export function parseCalculatorDecimal(value) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : Number.NaN
  const raw = String(value ?? '').trim().replace(/\s+/g, '')
  if (!raw) return null

  const separators = [...raw.matchAll(GROUPING_OR_DECIMAL)]
  let normalized = raw
  if (separators.length) {
    const lastSeparator = separators.at(-1)
    const decimalIndex = lastSeparator.index
    const integerPart = raw.slice(0, decimalIndex).replace(/[.,]/g, '')
    const decimalPart = raw.slice(decimalIndex + 1)
    normalized = separators.length === 1
      ? raw.replace(',', '.')
      : `${integerPart}.${decimalPart}`
  }

  const number = Number(normalized)
  return Number.isFinite(number) ? number : Number.NaN
}

export function parseWholeQuantity(value) {
  const number = parseCalculatorDecimal(value)
  if (number === null) return null
  return Number.isInteger(number) && number >= 0 ? number : Number.NaN
}

export function parseIdrInput(value) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : Number.NaN
  const raw = String(value ?? '').trim()
  if (!raw) return null
  const negative = raw.startsWith('-')
  const digits = raw.replace(/[^0-9]/g, '')
  if (!digits) return Number.NaN
  const number = Number(`${negative ? '-' : ''}${digits}`)
  return Number.isFinite(number) ? number : Number.NaN
}

export function calculateWaste(baseQty, wastePercent) {
  const base = Number(baseQty)
  const percent = Number(wastePercent)
  if (!Number.isFinite(base) || !Number.isFinite(percent) || base < 0 || percent < 0) return 0
  return Math.ceil(base * (percent / 100))
}

export function formatDecimal(value, maximumFractionDigits = 2) {
  if (!Number.isFinite(value)) return '—'
  return new Intl.NumberFormat('id-ID', { maximumFractionDigits }).format(value)
}

export function formatDuration(totalMinutes) {
  if (!Number.isFinite(totalMinutes)) return '—'
  const minutes = Math.max(0, Math.ceil(totalMinutes))
  const days = Math.floor(minutes / 1440)
  const hours = Math.floor((minutes % 1440) / 60)
  const rest = minutes % 60
  return [days ? `${days} hari` : '', hours ? `${hours} jam` : '', rest || (!days && !hours) ? `${rest} menit` : '']
    .filter(Boolean)
    .join(' ')
}

export function addCalendarMinutes(value, minutes) {
  const date = value instanceof Date ? new Date(value) : new Date(value)
  if (Number.isNaN(date.getTime()) || !Number.isFinite(minutes)) return null
  date.setMinutes(date.getMinutes() + minutes)
  return date
}

export function roundPages(pageCount, multiple) {
  const pages = Number(pageCount)
  if (!Number.isFinite(pages) || pages <= 0 || !Number.isFinite(multiple) || multiple <= 0) return 0
  return Math.ceil(Math.ceil(pages) / multiple) * multiple
}

export function isBlank(value) {
  return String(value ?? '').trim() === ''
}

