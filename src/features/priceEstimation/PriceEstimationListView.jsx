import { ArrowDown, ArrowUp, ArrowUpDown, Copy, Download, Edit3, Eye, FileText, Plus, Search, Trash2, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Field, Input, Select } from '../../components/ui/Form'
import { TableSkeletonRows } from '../../components/ui/Table'
import { buildPriceEstimationCsv } from '../../lib/csv'
import { formatIdr } from '../../lib/format'
import { filterEstimates, getEmptyEstimateFilters, getStatusLabel, normalizeEstimateStatus } from './priceEstimationModel'

function statusBadge(estimate) {
  const status = normalizeEstimateStatus(estimate)
  const classes = status === 'draft' ? 'bg-amber-50 text-amber-700 ring-amber-200' : 'bg-emerald-50 text-emerald-700 ring-emerald-200'
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${classes}`}>{getStatusLabel(estimate)}</span>
}

function estimateLabel(estimate) {
  return estimate.jobNo || estimate.sku || estimate.client || 'Estimasi tanpa judul'
}

function sortValue(estimate, key) {
  switch (key) {
    case 'estimate':
      return estimateLabel(estimate).toLowerCase()
    case 'client':
      return (estimate.client || '').toLowerCase()
    case 'project':
      return (estimate.project || '').toLowerCase()
    case 'status':
      return normalizeEstimateStatus(estimate)
    case 'total':
      return Number(estimate.grandTotal) || 0
    default:
      return ''
  }
}

function SortHeader({ children, onSort, sort, sortKey }) {
  const active = sort.key === sortKey
  const Icon = active ? (sort.dir === 'asc' ? ArrowUp : ArrowDown) : ArrowUpDown
  return (
    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
      <button className="inline-flex items-center gap-1 transition hover:text-slate-800" onClick={() => onSort(sortKey)} type="button">
        {children}
        <Icon className={active ? 'text-blue-600' : 'text-slate-300'} size={13} />
      </button>
    </th>
  )
}

export function PriceEstimationListView({ estimates, loading, onBulkDelete, onCreateNew, onDeleteEstimate, onDuplicateEstimate, onEditDraft, onExportCsv, onViewEstimate }) {
  const [filters, setFilters] = useState(getEmptyEstimateFilters())
  const [draftToDelete, setDraftToDelete] = useState(null)
  const [sort, setSort] = useState({ key: '', dir: 'asc' })
  const [selectedIds, setSelectedIds] = useState(() => new Set())
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false)

  const visibleEstimates = useMemo(() => {
    const filtered = filterEstimates(estimates, filters)
    if (!sort.key) return filtered
    return [...filtered].sort((a, b) => {
      const av = sortValue(a, sort.key)
      const bv = sortValue(b, sort.key)
      if (av < bv) return sort.dir === 'asc' ? -1 : 1
      if (av > bv) return sort.dir === 'asc' ? 1 : -1
      return 0
    })
  }, [estimates, filters, sort])

  const selectedEstimates = useMemo(() => visibleEstimates.filter((estimate) => selectedIds.has(estimate.id)), [visibleEstimates, selectedIds])
  const allVisibleSelected = visibleEstimates.length > 0 && visibleEstimates.every((estimate) => selectedIds.has(estimate.id))

  function updateFilter(field, value) {
    setFilters((current) => ({ ...current, [field]: value }))
  }

  function handleSort(key) {
    setSort((current) => (current.key === key ? { key, dir: current.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' }))
  }

  function toggleSelect(id) {
    setSelectedIds((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleSelectAll() {
    setSelectedIds(() => (allVisibleSelected ? new Set() : new Set(visibleEstimates.map((estimate) => estimate.id))))
  }

  function clearSelection() {
    setSelectedIds(new Set())
    setConfirmBulkDelete(false)
  }

  function exportSelected() {
    onExportCsv(selectedEstimates, buildPriceEstimationCsv(selectedEstimates))
  }

  function confirmDelete(estimate) {
    onDeleteEstimate?.(estimate)
    setDraftToDelete(null)
  }

  function handleBulkDelete() {
    onBulkDelete?.(selectedEstimates)
    clearSelection()
  }

  return (
    <section className="overflow-hidden rounded-4xl border border-white/80 bg-white shadow-xl shadow-slate-300/40">
      <div className="flex flex-col gap-4 border-b border-slate-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">Papan estimasi</p>
          <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950">Estimasi Harga</h2>
          <p className="mt-1 text-sm font-medium text-slate-500">Kelola estimasi harga draf dan yang sudah dibuat.</p>
        </div>
        <div className="flex gap-2">
          <Link className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-700" onClick={onCreateNew} to="/estimates/new">
            <Plus size={17} />
            Buat Baru
          </Link>
        </div>
      </div>

      <div className="grid gap-4 border-b border-slate-100 bg-slate-50/70 p-5 md:grid-cols-4">
        <Field label="Cari">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
            <Input className="pl-11" onChange={(event) => updateFilter('query', event.target.value)} value={filters.query} />
          </div>
        </Field>
        <Field label="Status">
          <Select onChange={(event) => updateFilter('status', event.target.value)} value={filters.status}>
            <option value="all">Semua status</option>
            <option value="draft">Draf</option>
            <option value="created">Dibuat</option>
          </Select>
        </Field>
        <Field label="Dari tanggal">
          <Input onChange={(event) => updateFilter('fromDate', event.target.value)} type="date" value={filters.fromDate} />
        </Field>
        <Field label="Sampai tanggal">
          <Input onChange={(event) => updateFilter('toDate', event.target.value)} type="date" value={filters.toDate} />
        </Field>
      </div>

      {selectedEstimates.length > 0 ? (
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 bg-blue-50/60 px-5 py-3">
          <span className="text-sm font-bold text-slate-700">{selectedEstimates.length} dipilih</span>
          <button className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50" onClick={exportSelected} type="button"><Download size={14} />Ekspor CSV</button>
          {confirmBulkDelete ? (
            <span className="inline-flex items-center gap-2">
              <button className="rounded-xl bg-rose-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-rose-700" onClick={handleBulkDelete} type="button">Hapus {selectedEstimates.length} permanen</button>
              <button className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50" onClick={() => setConfirmBulkDelete(false)} type="button">Batal</button>
            </span>
          ) : (
            <button className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-white px-3 py-1.5 text-xs font-bold text-rose-700 transition hover:bg-rose-50" onClick={() => setConfirmBulkDelete(true)} type="button"><Trash2 size={14} />Hapus terpilih</button>
          )}
          <button className="ml-auto inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 transition hover:text-slate-800" onClick={clearSelection} type="button"><X size={14} />Bersihkan</button>
        </div>
      ) : null}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
          <thead className="bg-slate-50/80">
            <tr>
              <th className="w-10 px-4 py-3">
                <input aria-label="Pilih semua" checked={allVisibleSelected} className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-200" onChange={toggleSelectAll} type="checkbox" />
              </th>
              <SortHeader onSort={handleSort} sort={sort} sortKey="estimate">Estimasi</SortHeader>
              <SortHeader onSort={handleSort} sort={sort} sortKey="client">Klien</SortHeader>
              <SortHeader onSort={handleSort} sort={sort} sortKey="project">Proyek</SortHeader>
              <SortHeader onSort={handleSort} sort={sort} sortKey="status">Status</SortHeader>
              <SortHeader onSort={handleSort} sort={sort} sortKey="total">Total</SortHeader>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {loading ? (
              <TableSkeletonRows columns={7} />
            ) : visibleEstimates.length === 0 ? (
              <tr>
                <td className="px-4 py-16 text-center" colSpan={7}>
                  <div className="flex flex-col items-center gap-3">
                    <span className="grid h-14 w-14 place-items-center rounded-2xl bg-slate-100 text-slate-400">
                      <FileText size={26} />
                    </span>
                    <p className="text-sm font-bold text-slate-700">
                      {estimates.length === 0 ? 'Belum ada estimasi' : 'Tidak ada estimasi yang cocok'}
                    </p>
                    {estimates.length === 0 ? (
                      <Link className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-700" onClick={onCreateNew} to="/estimates/new">
                        <Plus size={16} />
                        Buat Baru
                      </Link>
                    ) : (
                      <p className="text-sm text-slate-500">Coba ubah filter atau kata kunci pencarian.</p>
                    )}
                  </div>
                </td>
              </tr>
            ) : visibleEstimates.map((estimate) => (
              <tr className="transition hover:bg-blue-50/30" key={estimate.id}>
                <td className="px-4 py-3">
                  <input aria-label={`Select ${estimateLabel(estimate)}`} checked={selectedIds.has(estimate.id)} className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-200" onChange={() => toggleSelect(estimate.id)} type="checkbox" />
                </td>
                <td className="px-4 py-3 font-semibold text-slate-900">{estimateLabel(estimate)}</td>
                <td className="px-4 py-3 text-slate-600">{estimate.client || '-'}</td>
                <td className="px-4 py-3 text-slate-600">{estimate.project || '-'}</td>
                <td className="px-4 py-3">{statusBadge(estimate)}</td>
                <td className="px-4 py-3 text-slate-600">{formatIdr(estimate.grandTotal)}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    <Link aria-label={`Lihat ${estimateLabel(estimate)}`} className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50" onClick={() => onViewEstimate(estimate)} to={`/estimates/${estimate.id}`}><Eye size={14} />Lihat</Link>
                    <Link aria-label={`Edit ${estimateLabel(estimate)}`} className="inline-flex items-center gap-1.5 rounded-xl border border-amber-200 px-3 py-1.5 text-xs font-bold text-amber-700 transition hover:border-amber-300 hover:bg-amber-50" onClick={() => onEditDraft(estimate)} to={`/estimates/${estimate.id}/edit`}><Edit3 size={14} />Edit</Link>
                    <button aria-label={`Duplikat ${estimateLabel(estimate)}`} className="inline-flex items-center gap-1.5 rounded-xl border border-blue-200 px-3 py-1.5 text-xs font-bold text-blue-700 transition hover:border-blue-300 hover:bg-blue-50" onClick={() => onDuplicateEstimate(estimate)} type="button"><Copy size={14} />Duplikat</button>
                    <button aria-label={`Hapus ${estimateLabel(estimate)}`} className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 px-3 py-1.5 text-xs font-bold text-rose-700 transition hover:border-rose-300 hover:bg-rose-50" onClick={() => setDraftToDelete(estimate)} type="button"><Trash2 size={14} />Hapus</button>
                  </div>
                  {draftToDelete === estimate && onDeleteEstimate ? (
                    <div className="mt-2 rounded-lg border border-red-200 bg-red-50 p-3">
                      <p className="text-xs font-semibold text-red-800">Konfirmasi penghapusan "{estimateLabel(estimate)}"</p>
                      <div className="mt-2 flex gap-2">
                        <button aria-label="Konfirmasi penghapusan" className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700" onClick={() => confirmDelete(estimate)} type="button">Hapus permanen</button>
                        <button aria-label="Batalkan penghapusan" className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50" onClick={() => setDraftToDelete(null)} type="button">Batal</button>
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
