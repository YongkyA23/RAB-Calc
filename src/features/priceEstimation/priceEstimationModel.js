import { buildDraftFromQuote, filterQuotes } from '../jobLog/jobLogModel'

export function normalizeEstimateStatus(estimate) {
  return estimate?.status === 'draft' ? 'draft' : 'created'
}

export function getStatusLabel(estimate) {
  return normalizeEstimateStatus(estimate) === 'draft' ? 'Draft' : 'Created'
}

export function getEmptyEstimateFilters() {
  return { query: '', fromDate: '', toDate: '', createdBy: '', minTotal: '', maxTotal: '', status: 'all' }
}

export function filterEstimates(estimates, filters) {
  return filterQuotes(estimates, filters).filter((estimate) => {
    if (filters.status === 'all') return true
    return normalizeEstimateStatus(estimate) === filters.status
  })
}

export function buildDraftFromEstimate(estimate) {
  const draft = estimate.draft ? { ...estimate.draft } : buildDraftFromQuote(estimate)
  return { ...draft, sourceQuoteId: estimate.id }
}
