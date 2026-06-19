import { useMemo, useState } from 'react'
import { TableSkeletonRows } from '../../components/ui/Table'
import { buildJobLogCsv } from '../../lib/csv'
import { formatIdr } from '../../lib/format'
import { buildDraftFromQuote, filterQuotes, getEmptyQuoteFilters } from './jobLogModel'

function Field({ children, label }) {
  return (
    <label className="block text-sm font-semibold text-slate-700">
      <span>{label}</span>
      {children}
    </label>
  )
}

function Input(props) {
  return (
    <input
      className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
      {...props}
    />
  )
}

export function JobLogView({ loading, onDuplicateQuote, onExportCsv, quotes }) {
  const [filters, setFilters] = useState(getEmptyQuoteFilters())
  const [selectedQuote, setSelectedQuote] = useState(null)
  const visibleQuotes = useMemo(() => filterQuotes(quotes, filters), [quotes, filters])

  function updateFilter(field, value) {
    setFilters((current) => ({ ...current, [field]: value }))
  }

  function exportCsv() {
    onExportCsv(visibleQuotes, buildJobLogCsv(visibleQuotes))
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.4fr_0.7fr]">
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-950">Job Log</h2>
            <p className="mt-2 text-sm text-slate-600">Search, review, duplicate, and export saved quotes.</p>
          </div>
          <button
            className="rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:bg-slate-300"
            disabled={loading}
            onClick={exportCsv}
            type="button"
          >
            Export CSV
          </button>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <Field label="Search">
            <Input onChange={(event) => updateFilter('query', event.target.value)} value={filters.query} />
          </Field>
          <Field label="From date">
            <Input onChange={(event) => updateFilter('fromDate', event.target.value)} type="date" value={filters.fromDate} />
          </Field>
          <Field label="To date">
            <Input onChange={(event) => updateFilter('toDate', event.target.value)} type="date" value={filters.toDate} />
          </Field>
          <Field label="Created by">
            <Input onChange={(event) => updateFilter('createdBy', event.target.value)} value={filters.createdBy} />
          </Field>
          <Field label="Min total">
            <Input onChange={(event) => updateFilter('minTotal', event.target.value)} value={filters.minTotal} />
          </Field>
          <Field label="Max total">
            <Input onChange={(event) => updateFilter('maxTotal', event.target.value)} value={filters.maxTotal} />
          </Field>
        </div>

        <div className="mt-6 overflow-hidden rounded-lg border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 font-semibold">No Job</th>
                <th className="px-4 py-3 font-semibold">Client</th>
                <th className="px-4 py-3 font-semibold">Project</th>
                <th className="px-4 py-3 font-semibold">Total</th>
                <th className="px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {loading ? (
                <TableSkeletonRows columns={5} />
              ) : visibleQuotes.map((quote) => (
                <tr key={quote.id}>
                  <td className="px-4 py-3 font-semibold text-slate-900">{quote.jobNo}</td>
                  <td className="px-4 py-3 text-slate-600">{quote.client}</td>
                  <td className="px-4 py-3 text-slate-600">{quote.project}</td>
                  <td className="px-4 py-3 text-slate-600">{formatIdr(quote.grandTotal)}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        aria-label={`View ${quote.jobNo}`}
                        className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        onClick={() => setSelectedQuote(quote)}
                        type="button"
                      >
                        View
                      </button>
                      <button
                        aria-label={`Duplicate ${quote.jobNo}`}
                        className="rounded-xl border border-blue-200 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-50"
                        onClick={() => onDuplicateQuote(buildDraftFromQuote(quote))}
                        type="button"
                      >
                        Duplicate
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <aside className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-bold text-slate-950">Quote detail</h3>
        {selectedQuote ? (
          <div className="mt-4 space-y-4 text-sm text-slate-600">
            <div>
              <p className="font-semibold text-slate-900">{selectedQuote.jobNo}</p>
              <p>{selectedQuote.client} · {selectedQuote.project}</p>
              <p>{formatIdr(selectedQuote.grandTotal)} · {selectedQuote.turnaroundDays} days</p>
            </div>
            <ul className="space-y-2">
              {(selectedQuote.lineItems ?? []).map((line) => (
                <li className="rounded-lg bg-slate-50 p-3" key={line.id}>
                  <span className="font-semibold text-slate-900">{line.priceSnapshot?.name ?? line.layer}</span>
                  <span className="ml-2">{formatIdr(line.computedTotal)}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="mt-4 text-sm text-slate-600">Select a quote to inspect saved line-item snapshots.</p>
        )}
      </aside>
    </div>
  )
}
