export function formatIdr(value) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  })
    .format(Number(value) || 0)
    .replace(/\s/g, ' ')
}

export function parseNumberInput(value) {
  if (value === null || value === undefined || value === '') {
    return 0
  }

  const normalized = String(value).replace(/[^\d-]/g, '')
  const number = Number(normalized)

  return Number.isFinite(number) ? number : 0
}

export function normalizeSearchText(value) {
  return String(value ?? '').trim().toLowerCase().replace(/\s+/g, ' ')
}

export function formatDateForInput(date) {
  return date.toISOString().slice(0, 10)
}
