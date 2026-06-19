import { Copy, Download, Edit3, Eye, Plus, Search, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { TableSkeletonRows } from '../../components/ui/Table'
import { buildPriceEstimationCsv } from '../../lib/csv'
import { formatIdr } from '../../lib/format'
import { filterEstimates, getEmptyEstimateFilters, getStatusLabel, normalizeEstimateStatus } from './priceEstimationModel'

function Field({ children, label }) {
  return (
    <label className="block text-sm font-bold text-slate-700">
      <span>{label}</span>
      {children}
    </label>
  )
}

function Input({ className = '', ...props }) {
  return (
    <input
      className={`mt-1.5 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium outline-none transition hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 ${className}`}
      {...props}
    />
  )
}

function Select(props) {
  return (
    <select
      className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium outline-none transition hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
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
    <section className="overflow-hidden rounded-4xl border border-white/80 bg-white shadow-xl shadow-slate-300/40">
      <div className="flex flex-col gap-4 border-b border-slate-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">Estimate board</p>
          <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950">Price Estimation</h2>
          <p className="mt-1 text-sm font-medium text-slate-500">Manage draft and created price estimates.</p>
        </div>
        <div className="flex gap-2">
          <Button disabled={loading} onClick={exportCsv}>
            <Download size={17} />
            Export CSV
          </Button>
          <Link className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-700" onClick={onCreateNew} to="/estimates/new">
            <Plus size={17} />
            Create New
          </Link>
        </div>
      </div>

      <div className="grid gap-4 border-b border-slate-100 bg-slate-50/70 p-5 md:grid-cols-4">
        <Field label="Search">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
            <Input className="pl-11" onChange={(event) => updateFilter('query', event.target.value)} value={filters.query} />
          </div>
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
          <thead className="bg-slate-50/80">
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
            {loading ? (
              <TableSkeletonRows columns={6} />
            ) : visibleEstimates.map((estimate) => (
              <tr className="transition hover:bg-blue-50/30" key={estimate.id}>
                <td className="px-4 py-3 font-semibold text-slate-900">{estimateLabel(estimate)}</td>
                <td className="px-4 py-3 text-slate-600">{estimate.client || '-'}</td>
                <td className="px-4 py-3 text-slate-600">{estimate.project || '-'}</td>
                <td className="px-4 py-3">{statusBadge(estimate)}</td>
                <td className="px-4 py-3 text-slate-600">{formatIdr(estimate.grandTotal)}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    <Link aria-label={`View ${estimateLabel(estimate)}`} className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50" onClick={() => onViewEstimate(estimate)} to={`/estimates/${estimate.id}`}><Eye size={14} />View</Link>
                    <Link aria-label={`Edit ${estimateLabel(estimate)}`} className="inline-flex items-center gap-1.5 rounded-xl border border-amber-200 px-3 py-1.5 text-xs font-bold text-amber-700 transition hover:border-amber-300 hover:bg-amber-50" onClick={() => onEditDraft(estimate)} to={`/estimates/${estimate.id}/edit`}><Edit3 size={14} />Edit</Link>
                    <button aria-label={`Duplicate ${estimateLabel(estimate)}`} className="inline-flex items-center gap-1.5 rounded-xl border border-blue-200 px-3 py-1.5 text-xs font-bold text-blue-700 transition hover:border-blue-300 hover:bg-blue-50" onClick={() => onDuplicateEstimate(estimate)} type="button"><Copy size={14} />Duplicate</button>
                    <button aria-label={`Delete ${estimateLabel(estimate)}`} className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 px-3 py-1.5 text-xs font-bold text-rose-700 transition hover:border-rose-300 hover:bg-rose-50" onClick={() => setDraftToDelete(estimate)} type="button"><Trash2 size={14} />Delete</button>
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
