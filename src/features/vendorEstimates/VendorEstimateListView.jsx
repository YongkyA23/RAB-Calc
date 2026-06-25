import { ArrowDown, ArrowUp, ArrowUpDown, Download, Edit3, Eye, FileText, Plus, Search, Trash2, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Field, Input } from '../../components/ui/Form'
import { TableSkeletonRows } from '../../components/ui/Table'
import { buildVendorEstimateCsv } from '../../lib/csv'
import { formatIdr } from '../../lib/format'
import { filterVendorEstimates } from './vendorEstimateModel'

function sortValue(estimate, key) {
  switch (key) {
    case 'project':
      return (estimate.projectTitle || '').toLowerCase()
    case 'vendor':
      return (estimate.vendorName || '').toLowerCase()
    case 'price':
      return Number(estimate.price) || 0
    case 'updated':
      return estimate.updatedAt || ''
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

export function VendorEstimateListView({ estimates, loading, onBulkDelete, onCreateNew, onDeleteEstimate, onEditEstimate, onExportCsv, onViewEstimate }) {
  const [filters, setFilters] = useState({ query: '' })
  const [estimateToDelete, setEstimateToDelete] = useState(null)
  const [sort, setSort] = useState({ key: '', dir: 'asc' })
  const [selectedIds, setSelectedIds] = useState(() => new Set())
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false)

  const visibleEstimates = useMemo(() => {
    const filtered = filterVendorEstimates(estimates, filters)
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
    onExportCsv?.(selectedEstimates, buildVendorEstimateCsv(selectedEstimates))
  }

  function handleBulkDelete() {
    onBulkDelete?.(selectedEstimates)
    clearSelection()
  }

  return (
    <section className="overflow-hidden rounded-4xl border border-white/80 bg-white shadow-xl shadow-slate-300/40">
      <div className="flex flex-col gap-4 border-b border-slate-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">Papan vendor quote</p>
          <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950">Estimasi Vendor</h2>
          <p className="mt-1 text-sm font-medium text-slate-500">Simpan harga vendor beserta lampiran quote.</p>
        </div>
        <div className="flex gap-2">
          <Link className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-700" onClick={onCreateNew} to="/vendor-estimates/new">
            <Plus size={17} />
            Buat Baru
          </Link>
        </div>
      </div>

      <div className="grid gap-4 border-b border-slate-100 bg-slate-50/70 p-5 md:grid-cols-1">
        <Field label="Cari">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
            <Input className="pl-11" onChange={(event) => setFilters({ query: event.target.value })} value={filters.query} />
          </div>
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
              <SortHeader onSort={handleSort} sort={sort} sortKey="project">Proyek</SortHeader>
              <SortHeader onSort={handleSort} sort={sort} sortKey="vendor">Vendor</SortHeader>
              <SortHeader onSort={handleSort} sort={sort} sortKey="price">Harga</SortHeader>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Lampiran</th>
              <SortHeader onSort={handleSort} sort={sort} sortKey="updated">Diperbarui</SortHeader>
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
                      {filters.query ? 'Tidak ada estimasi vendor yang cocok' : 'Belum ada estimasi vendor'}
                    </p>
                    {filters.query ? (
                      <p className="text-sm text-slate-500">Coba ubah kata kunci pencarian.</p>
                    ) : (
                      <Link className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-700" onClick={onCreateNew} to="/vendor-estimates/new">
                        <Plus size={16} />
                        Buat Baru
                      </Link>
                    )}
                  </div>
                </td>
              </tr>
            ) : visibleEstimates.map((estimate) => (
              <tr className="transition hover:bg-blue-50/30" key={estimate.id}>
                <td className="px-4 py-3">
                  <input aria-label={`Pilih ${estimate.projectTitle || estimate.id}`} checked={selectedIds.has(estimate.id)} className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-200" onChange={() => toggleSelect(estimate.id)} type="checkbox" />
                </td>
                <td className="px-4 py-3 font-semibold text-slate-900">{estimate.projectTitle || '-'}</td>
                <td className="px-4 py-3 text-slate-600">{estimate.vendorName || '-'}</td>
                <td className="px-4 py-3 text-slate-600">{formatIdr(estimate.price)}</td>
                <td className="px-4 py-3 text-slate-600">{estimate.attachmentName || '-'}</td>
                <td className="px-4 py-3 text-slate-600">{estimate.updatedAt ? new Date(estimate.updatedAt).toLocaleDateString('id-ID') : '-'}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    <Link aria-label={`Lihat ${estimate.projectTitle || estimate.id}`} className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50" onClick={() => onViewEstimate(estimate)} to={`/vendor-estimates/${estimate.id}`}><Eye size={14} />Lihat</Link>
                    <Link aria-label={`Edit ${estimate.projectTitle || estimate.id}`} className="inline-flex items-center gap-1.5 rounded-xl border border-amber-200 px-3 py-1.5 text-xs font-bold text-amber-700 transition hover:border-amber-300 hover:bg-amber-50" onClick={() => onEditEstimate(estimate)} to={`/vendor-estimates/${estimate.id}/edit`}><Edit3 size={14} />Edit</Link>
                    <button aria-label={`Hapus ${estimate.projectTitle || estimate.id}`} className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 px-3 py-1.5 text-xs font-bold text-rose-700 transition hover:border-rose-300 hover:bg-rose-50" onClick={() => setEstimateToDelete(estimate)} type="button"><Trash2 size={14} />Hapus</button>
                    {estimate.attachmentUrl ? <span className="inline-flex items-center gap-1 rounded-xl border border-blue-100 bg-blue-50 px-2 py-1 text-xs font-bold text-blue-700"><FileText size={14} />{estimate.attachmentType === 'image' ? 'IMG' : 'PDF'}</span> : null}
                  </div>
                  {estimateToDelete === estimate && onDeleteEstimate ? (
                    <div className="mt-2 rounded-lg border border-red-200 bg-red-50 p-3">
                      <p className="text-xs font-semibold text-red-800">Konfirmasi penghapusan "{estimate.projectTitle || estimate.id}"</p>
                      <div className="mt-2 flex gap-2">
                        <button aria-label="Konfirmasi penghapusan" className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700" onClick={() => { onDeleteEstimate(estimate); setEstimateToDelete(null) }} type="button">Hapus permanen</button>
                        <button aria-label="Batalkan penghapusan" className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50" onClick={() => setEstimateToDelete(null)} type="button">Batal</button>
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
