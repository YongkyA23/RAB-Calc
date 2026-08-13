import { parseNumberInput } from '../../lib/format'

const FIELD_SCHEMAS = {
  print: ['name', 'prices', 'turnaroundDays', 'a3Only'],
  digital: ['name', 'prices', 'turnaroundDays', 'a3Only'],
  manual: ['name', 'toolingRate', 'laborRate', 'minimumType', 'minimumCharge', 'turnaroundDays'],
  manpower: ['name', 'dailyRate', 'turnaroundDays'],
  additional: ['name', 'additionalMode', 'rate', 'unitLabel', 'turnaroundDays'],
}

export function getCategoryFieldSchema(category) {
  return category?.fieldSchema?.length
    ? category.fieldSchema
    : FIELD_SCHEMAS[category?.layer] ?? ['name', 'turnaroundDays']
}

export function createPriceItemId(layer) {
  return `${layer}-${globalThis.crypto?.randomUUID?.() ?? Date.now()}`
}

export function getEmptyPriceItemDraft(layer) {
  return {
    id: '',
    categoryId: '',
    categoryLayer: layer,
    name: '',
    prices: { A3: 0, B2: 0, LARGE_FORMAT: 0 },
    pricesAbove10: { A3: 0, B2: 0, LARGE_FORMAT: 0 },
    toolingRate: null,
    laborRate: null,
    minimumCharge: null,
    minimumType: 'numeric',
    dailyRate: null,
    turnaroundDays: 0,
    a3Only: false,
    additionalMode: layer === 'additional' ? 'manual' : null,
    unitLabel: '',
    rate: null,
    active: true,
  }
}

export function buildPriceItemPayload(draft) {
  const a3Only = Boolean(draft.a3Only)
  const optionalPrice = (value) => {
    const parsed = parseNumberInput(value)
    return parsed > 0 ? parsed : null
  }

  return {
    ...draft,
    name: draft.name.trim(),
    prices: {
      A3: parseNumberInput(draft.prices?.A3),
      B2: a3Only ? null : parseNumberInput(draft.prices?.B2),
      LARGE_FORMAT: a3Only ? null : optionalPrice(draft.prices?.LARGE_FORMAT),
    },
    pricesAbove10: {
      A3: optionalPrice(draft.pricesAbove10?.A3),
      B2: a3Only ? null : optionalPrice(draft.pricesAbove10?.B2),
      LARGE_FORMAT: a3Only ? null : optionalPrice(draft.pricesAbove10?.LARGE_FORMAT),
    },
    toolingRate: draft.toolingRate === null || draft.toolingRate === '' ? null : Number(draft.toolingRate),
    laborRate: draft.laborRate === null || draft.laborRate === '' ? null : Number(draft.laborRate),
    minimumCharge:
      draft.minimumCharge === null || draft.minimumCharge === ''
        ? null
        : parseNumberInput(draft.minimumCharge),
    dailyRate: draft.dailyRate === null || draft.dailyRate === '' ? null : parseNumberInput(draft.dailyRate),
    turnaroundDays: parseNumberInput(draft.turnaroundDays),
    additionalMode: draft.additionalMode || null,
    unitLabel: draft.unitLabel || null,
    rate: draft.rate === null || draft.rate === '' ? null : Number(draft.rate),
    a3Only,
    active: draft.active !== false,
  }
}

export function validatePriceItemDraft(draft, fieldSchema) {
  const errors = []
  const hasField = (field) => fieldSchema.includes(field)
  const positive = (value) => Number.isFinite(Number(value)) && Number(value) > 0

  if (!draft.name?.trim()) errors.push('Nama item wajib diisi')
  if (!draft.categoryId) errors.push('Kategori item belum dipilih')

  if (hasField('prices') && !positive(draft.prices?.A3)) {
    errors.push('Harga A3 harus lebih dari 0')
  }

  if (hasField('prices') && !draft.a3Only && !positive(draft.prices?.B2)) {
    errors.push('Harga B2 harus lebih dari 0, atau pilih hanya A3')
  }

  if (hasField('prices') && positive(draft.pricesAbove10?.LARGE_FORMAT) && !positive(draft.prices?.LARGE_FORMAT)) {
    errors.push('Isi harga Large Format 1–10 sebelum harga > 10')
  }

  if (hasField('laborRate') && !positive(draft.laborRate)) {
    errors.push('Tarif tenaga kerja harus lebih dari 0')
  }

  if (hasField('dailyRate') && !positive(draft.dailyRate)) {
    errors.push('Tarif harian harus lebih dari 0')
  }

  if (hasField('rate') && draft.additionalMode !== 'manual' && !positive(draft.rate)) {
    errors.push('Tarif harus lebih dari 0')
  }

  return errors
}

export function filterPriceItemsByLayer(items, layer) {
  return items.filter((item) => item.categoryLayer === layer && item.active !== false)
}

export function summarizeAuditEntry(entry) {
  const fields = entry.changedFields?.length ? entry.changedFields.join(', ') : 'no fields'
  return `${entry.action} ${entry.itemId}: ${fields} by ${entry.editedBy}`
}
