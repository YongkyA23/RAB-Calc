import { normalizeSearchText, parseNumberInput } from '../../lib/format'
import { createEmptyQuoteDraft } from '../estimation/estimationModel'

export function getEmptyQuoteFilters() {
  return {
    query: '',
    fromDate: '',
    toDate: '',
    createdBy: '',
    minTotal: '',
    maxTotal: '',
  }
}

function quoteDateOnly(quote) {
  return String(quote.date ?? '').slice(0, 10)
}

export function filterQuotes(quotes, filters) {
  const query = normalizeSearchText(filters.query)
  const createdBy = normalizeSearchText(filters.createdBy)
  const minTotal = filters.minTotal === '' ? null : parseNumberInput(filters.minTotal)
  const maxTotal = filters.maxTotal === '' ? null : parseNumberInput(filters.maxTotal)

  return quotes.filter((quote) => {
    const haystack = normalizeSearchText(
      [quote.jobNo, quote.sku, quote.client, quote.project, quote.createdByName].join(' '),
    )
    const date = quoteDateOnly(quote)

    if (query && !haystack.includes(query)) return false
    if (filters.fromDate && date < filters.fromDate) return false
    if (filters.toDate && date > filters.toDate) return false
    if (createdBy && normalizeSearchText(quote.createdByName) !== createdBy) return false
    if (minTotal !== null && quote.grandTotal < minTotal) return false
    if (maxTotal !== null && quote.grandTotal > maxTotal) return false

    return true
  })
}

export function buildDraftFromQuote(quote) {
  const draft = createEmptyQuoteDraft()
  draft.header = {
    jobNo: '',
    sku: quote.sku ?? '',
    client: quote.client ?? '',
    project: quote.project ?? '',
  }
  draft.sourceQuoteId = quote.id

  for (const line of quote.lineItems ?? []) {
    if (draft[line.layer]) {
      draft[line.layer].push({ ...line.inputs })
    }
  }

  return draft
}
