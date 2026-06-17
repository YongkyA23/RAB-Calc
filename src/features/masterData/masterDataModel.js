import { parseNumberInput } from '../../lib/format'

export function getEmptyPriceItemDraft(layer) {
  return {
    id: '',
    categoryId: '',
    categoryLayer: layer,
    name: '',
    prices: { A3: 0, B2: 0 },
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
  return {
    ...draft,
    name: draft.name.trim(),
    prices: {
      A3: parseNumberInput(draft.prices?.A3),
      B2: parseNumberInput(draft.prices?.B2),
    },
    toolingRate: draft.toolingRate === null || draft.toolingRate === '' ? null : Number(draft.toolingRate),
    laborRate: draft.laborRate === null || draft.laborRate === '' ? null : Number(draft.laborRate),
    minimumCharge:
      draft.minimumCharge === null || draft.minimumCharge === ''
        ? null
        : parseNumberInput(draft.minimumCharge),
    dailyRate: draft.dailyRate === null || draft.dailyRate === '' ? null : parseNumberInput(draft.dailyRate),
    turnaroundDays: parseNumberInput(draft.turnaroundDays),
    rate: draft.rate === null || draft.rate === '' ? null : Number(draft.rate),
    active: draft.active !== false,
  }
}

export function filterPriceItemsByLayer(items, layer) {
  return items.filter((item) => item.categoryLayer === layer && item.active !== false)
}

export function summarizeAuditEntry(entry) {
  const fields = entry.changedFields?.length ? entry.changedFields.join(', ') : 'no fields'
  return `${entry.action} ${entry.itemId}: ${fields} by ${entry.editedBy}`
}
