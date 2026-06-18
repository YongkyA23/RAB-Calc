import { useMemo, useState } from 'react'
import { Button } from '../../components/ui/Button'
import { buildPriceEstimationCsv } from '../../lib/csv'
import { formatIdr } from '../../lib/format'
import { filterEstimates, getEmptyEstimateFilters, getStatusLabel, normalizeEstimateStatus } from './priceEstimationModel'

function Field({ children, label }) {
  return (
    <label className="block text-sm font-medium text-slate-700">
      <span>{label}</span>
      {children}
    </label>
  )
}

function Input(props) {
  return (
    <input
      className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
      {...props}
    />
  )
}

function Select(props) {
  return (
    <select
      className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
      {...props}
    />
  )
}

function statusBadge(estimate) {
  const status = normalizeEstimateStatus(estimate)
  const classes = status === 'draft' ? 'bg-amber-50 text-amber-700 ring-amber-200' : 'bg-emerald-50 text-emerald-700 ring-emerald-200'
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${classes}`}>{getStatusLabel(estimate)}</span>
}

function estimateLabel(estimate) {
  return estimate.jobNo || estimate.sku || estimate.client || 'Untitled estimate'
}

export function PriceEstimationListView({ estimates, loading, onCreateNew, onDeleteEstimate, onDuplicateEstimate, onEditDraft, onExportCsv, onViewEstimate }) {
  const [filters, setFilters] = useState(getEmptyEstimateFilters())
  const [draftToDelete, setDraftToDelete] = useState(null)
  const visibleEstimates = useMemo(() => filterEstimates(estimates, filters), [estimates, filters])

  function updateFilter(field, value) {
    setFilters((current) => ({ ...current, [field]: value }))
  }

  function exportCsv() {
    onExportCsv(visibleEstimates, buildPriceEstimationCsv(visibleEstimates))
  }

  function confirmDelete(estimate) {
    onDeleteEstimate?.(estimate)
    setDraftToDelete(null)
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-4 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-950">Price Estimation</h2>
          <p className="mt-1 text-sm text-slate-500">Manage draft and created price estimates.</p>
        </div>
        <div className="flex gap-2">
          <Button disabled={loading} onClick={exportCsv}>Export CSV</Button>
          <Button disabled={loading} onClick={onCreateNew} variant="primary">Create New</Button>
        </div>
      </div>

      <div className="grid gap-4 border-b border-slate-200 p-5 md:grid-cols-4">
        <Field label="Search">
          <Input onChange={(event) => updateFilter('query', event.target.value)} value={filters.query} />
        </Field>
        <Field label="Status">
          <Select onChange={(event) => updateFilter('status', event.target.value)} value={filters.status}>
            <option value="all">All statuses</option>
            <option value="draft">Draft</option>
            <option value="created">Created</option>
          </Select>
        </Field>
        <Field label="From date">
          <Input onChange={(event) => updateFilter('fromDate', event.target.value)} type="date" value={filters.fromDate} />
        </Field>
        <Field label="To date">
          <Input onChange={(event) => updateFilter('toDate', event.target.value)} type="date" value={filters.toDate} />
        </Field>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Estimate</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Client</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Project</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Total</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {visibleEstimates.map((estimate) => (
              <tr key={estimate.id}>
                <td className="px-4 py-3 font-semibold text-slate-900">{estimateLabel(estimate)}</td>
                <td className="px-4 py-3 text-slate-600">{estimate.client || '-'}</td>
                <td className="px-4 py-3 text-slate-600">{estimate.project || '-'}</td>
                <td className="px-4 py-3">{statusBadge(estimate)}</td>
                <td className="px-4 py-3 text-slate-600">{formatIdr(estimate.grandTotal)}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    <button aria-label={`View ${estimateLabel(estimate)}`} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50" onClick={() => onViewEstimate(estimate)} type="button">View</button>
                    <button aria-label={`Edit ${estimateLabel(estimate)}`} className="rounded-lg border border-amber-200 px-3 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-50" onClick={() => onEditDraft(estimate)} type="button">Edit</button>
                    <button aria-label={`Duplicate ${estimateLabel(estimate)}`} className="rounded-lg border border-blue-200 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-50" onClick={() => onDuplicateEstimate(estimate)} type="button">Duplicate</button>
                    <button aria-label={`Delete ${estimateLabel(estimate)}`} className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50" onClick={() => setDraftToDelete(estimate)} type="button">Delete</button>
                  </div>
                  {draftToDelete === estimate && onDeleteEstimate ? (
                    <div className="mt-2 rounded-lg border border-red-200 bg-red-50 p-3">
                      <p className="text-xs font-semibold text-red-800">Confirm deletion of "{estimateLabel(estimate)}"</p>
                      <div className="mt-2 flex gap-2">
                        <button aria-label="Confirm deletion" className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700" onClick={() => confirmDelete(estimate)} type="button">Delete permanently</button>
                        <button aria-label="Cancel deletion" className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50" onClick={() => setDraftToDelete(null)} type="button">Cancel</button>
                      </div>
                    </div>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
