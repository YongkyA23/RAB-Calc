import { buildDraftFromQuote, filterQuotes } from '../jobLog/jobLogModel'
import { createEmptyQuoteDraft } from '../estimation/estimationModel'

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

export function groupEstimatesByJobNo(estimates) {
  const groups = new Map()

  for (const estimate of estimates) {
    const jobNo = String(estimate.jobNo ?? '').trim()
    const key = jobNo.toLowerCase() || '__without-job'
    const group = groups.get(key) ?? { key, jobNo: jobNo || 'Tanpa No Job', estimates: [], grandTotal: 0 }
    group.estimates.push(estimate)
    group.grandTotal += Number(estimate.grandTotal) || 0
    groups.set(key, group)
  }

  return [...groups.values()]
}

export function createDraftForJob(group) {
  const draft = createEmptyQuoteDraft()
  const latestEstimate = group.estimates[0]
  draft.header = {
    ...draft.header,
    jobNo: group.key === '__without-job' ? '' : group.jobNo,
    client: latestEstimate?.client ?? '',
  }
  return draft
}

export function buildDraftFromEstimate(estimate) {
  const draft = estimate.draft ? { ...estimate.draft } : buildDraftFromQuote(estimate)
  return {
    ...draft,
    header: { ...draft.header, jobNo: estimate.jobNo ?? draft.header?.jobNo ?? '' },
    sourceQuoteId: estimate.id,
  }
}
