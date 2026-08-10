import { AlertTriangle, CheckCircle2, CircleDollarSign, Plus, Save, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { formatIdr } from '../../lib/format'
import {
  actualLineTotal,
  buildActualCostPayload,
  createActualCostDraft,
  createUnplannedActualLine,
  validateActualCostDraft,
} from './actualCostModel'

function Input(props) {
  return <input className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100 disabled:text-slate-500" {...props} />
}

function Field({ children, label }) {
  return <label className="block text-xs font-bold text-slate-600"><span>{label}</span>{children}</label>
}

function Variance({ actual, planned }) {
  const variance = actual - planned
  const className = variance > 0 ? 'bg-rose-50 text-rose-700' : variance < 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
  return <span className={`rounded-full px-2.5 py-1 text-xs font-black ${className}`}>{variance > 0 ? '+' : ''}{formatIdr(variance)}</span>
}

export function ActualCostPanel({ actualCost, editedBy, estimate, loading, onSave }) {
  const [draft, setDraft] = useState(() => actualCost ?? createActualCostDraft(estimate))
  const [errors, setErrors] = useState([])
  const [confirmFinalize, setConfirmFinalize] = useState(false)
  const finalized = draft.status === 'finalized'
  const actualTotal = useMemo(
    () => [...(draft.lines ?? []), ...(draft.unplannedLines ?? [])].reduce((sum, line) => sum + actualLineTotal(line), 0),
    [draft],
  )
  const baselineTotal = Number(draft.baselineSnapshot?.grandTotal) || 0
  const variance = actualTotal - baselineTotal

  function updateLine(collection, index, field, value) {
    setDraft((current) => ({
      ...current,
      [collection]: current[collection].map((line, lineIndex) => lineIndex === index ? {
        ...line,
        [field]: value,
        ...(field === 'actualQuantity' || field === 'actualUnitCost' ? { actualAmount: '' } : {}),
      } : line),
    }))
  }

  function addUnplannedLine() {
    setDraft((current) => ({ ...current, unplannedLines: [...current.unplannedLines, createUnplannedActualLine()] }))
  }

  function removeUnplannedLine(index) {
    setDraft((current) => ({ ...current, unplannedLines: current.unplannedLines.filter((_, lineIndex) => lineIndex !== index) }))
  }

  async function save(status) {
    const nextErrors = validateActualCostDraft(draft, status === 'finalized')
    setErrors(nextErrors)
    if (nextErrors.length) {
      setConfirmFinalize(false)
      return
    }

    const payload = buildActualCostPayload(draft, editedBy, status)
    const saved = await onSave(payload)
    if (saved !== false) {
      setDraft(saved ?? payload)
      setConfirmFinalize(false)
    }
  }

  return (
    <section className="overflow-hidden rounded-4xl border border-white/80 bg-white shadow-xl shadow-slate-300/40">
      <div className="flex flex-col gap-4 border-b border-slate-100 bg-[linear-gradient(135deg,#f8fafc_0%,#eff6ff_100%)] p-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-slate-950 text-white shadow-lg shadow-slate-950/20"><CircleDollarSign size={22} /></span>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">Rencana vs realisasi</p>
            <h3 className="mt-1 text-xl font-black tracking-tight text-slate-950">Aktualisasi Cost</h3>
            <p className="mt-1 text-sm font-medium text-slate-500">Baseline terkunci dari RAB saat aktualisasi pertama disimpan.</p>
          </div>
        </div>
        <span className={`w-fit rounded-full px-3 py-1.5 text-xs font-black ${finalized ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
          {finalized ? 'Final' : 'Draft aktualisasi'}
        </span>
      </div>

      <div className="grid gap-3 border-b border-slate-100 p-6 sm:grid-cols-3">
        <div className="rounded-3xl bg-slate-950 p-4 text-white"><p className="text-xs font-bold text-slate-400">Rencana</p><p className="mt-1 text-xl font-black">{formatIdr(baselineTotal)}</p></div>
        <div className="rounded-3xl bg-blue-600 p-4 text-white"><p className="text-xs font-bold text-blue-100">Aktual</p><p className="mt-1 text-xl font-black">{formatIdr(actualTotal)}</p></div>
        <div className={`rounded-3xl p-4 ${variance > 0 ? 'bg-rose-50 text-rose-800' : 'bg-emerald-50 text-emerald-800'}`}><p className="text-xs font-bold opacity-70">Selisih</p><p className="mt-1 text-xl font-black">{variance > 0 ? '+' : ''}{formatIdr(variance)}</p></div>
      </div>

      <div className="space-y-4 p-6">
        <div>
          <h4 className="font-black text-slate-950">Komponen dari RAB</h4>
          <p className="mt-1 text-xs font-medium text-slate-500">Isi total langsung, atau gunakan jumlah aktual × harga aktual.</p>
        </div>

        {(draft.lines ?? []).map((line, index) => {
          const total = actualLineTotal(line)
          return (
            <article className="rounded-3xl border border-slate-200 bg-slate-50/70 p-4" key={line.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div><p className="font-black text-slate-950">{line.name}</p><p className="text-xs font-bold uppercase tracking-wide text-slate-400">{line.layer} · Rencana {formatIdr(line.plannedTotal)}</p></div>
                <Variance actual={total} planned={Number(line.plannedTotal) || 0} />
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                <Field label="Jumlah aktual"><Input aria-label={`Jumlah aktual ${line.name}`} disabled={finalized} min="0" onChange={(event) => updateLine('lines', index, 'actualQuantity', event.target.value)} step="any" type="number" value={line.actualQuantity ?? ''} /></Field>
                <Field label="Harga aktual"><Input aria-label={`Harga aktual ${line.name}`} disabled={finalized} min="0" onChange={(event) => updateLine('lines', index, 'actualUnitCost', event.target.value)} step="any" type="number" value={line.actualUnitCost ?? ''} /></Field>
                <Field label="Total aktual"><Input aria-label={`Total aktual ${line.name}`} disabled={finalized} min="0" onChange={(event) => updateLine('lines', index, 'actualAmount', event.target.value)} step="any" type="number" value={line.actualAmount ?? ''} /></Field>
                <Field label="Supplier"><Input aria-label={`Supplier ${line.name}`} disabled={finalized} onChange={(event) => updateLine('lines', index, 'supplier', event.target.value)} value={line.supplier ?? ''} /></Field>
                <Field label="No. invoice"><Input aria-label={`No. invoice ${line.name}`} disabled={finalized} onChange={(event) => updateLine('lines', index, 'invoiceNo', event.target.value)} value={line.invoiceNo ?? ''} /></Field>
                <Field label="Tanggal transaksi"><Input aria-label={`Tanggal transaksi ${line.name}`} disabled={finalized} onChange={(event) => updateLine('lines', index, 'transactionDate', event.target.value)} type="date" value={line.transactionDate ?? ''} /></Field>
              </div>
              <Field label="Catatan selisih"><Input aria-label={`Catatan ${line.name}`} disabled={finalized} onChange={(event) => updateLine('lines', index, 'notes', event.target.value)} value={line.notes ?? ''} /></Field>
            </article>
          )
        })}

        <div className="flex items-center justify-between gap-3 pt-2">
          <div><h4 className="font-black text-slate-950">Biaya di luar RAB</h4><p className="text-xs font-medium text-slate-500">Catat pengeluaran yang tidak ada di baseline.</p></div>
          {!finalized ? <button className="inline-flex items-center gap-1.5 rounded-xl border border-blue-200 px-3 py-2 text-xs font-bold text-blue-700 hover:bg-blue-50" onClick={addUnplannedLine} type="button"><Plus size={14} />Tambah biaya</button> : null}
        </div>

        {(draft.unplannedLines ?? []).map((line, index) => (
          <article className="rounded-3xl border border-amber-200 bg-amber-50/60 p-4" key={line.id}>
            <div className="flex items-center justify-between gap-3"><p className="text-xs font-black uppercase tracking-wide text-amber-700">Biaya tak terencana</p>{!finalized ? <button aria-label={`Hapus biaya tambahan ${index + 1}`} className="text-rose-600" onClick={() => removeUnplannedLine(index)} type="button"><Trash2 size={16} /></button> : null}</div>
            <div className="mt-3 grid gap-3 md:grid-cols-3">
              <Field label="Nama biaya"><Input aria-label={`Nama biaya tambahan ${index + 1}`} disabled={finalized} onChange={(event) => updateLine('unplannedLines', index, 'name', event.target.value)} value={line.name ?? ''} /></Field>
              <Field label="Jumlah aktual"><Input aria-label={`Jumlah biaya tambahan ${index + 1}`} disabled={finalized} min="0" onChange={(event) => updateLine('unplannedLines', index, 'actualQuantity', event.target.value)} step="any" type="number" value={line.actualQuantity ?? ''} /></Field>
              <Field label="Harga aktual"><Input aria-label={`Harga biaya tambahan ${index + 1}`} disabled={finalized} min="0" onChange={(event) => updateLine('unplannedLines', index, 'actualUnitCost', event.target.value)} step="any" type="number" value={line.actualUnitCost ?? ''} /></Field>
              <Field label="Total aktual"><Input aria-label={`Total biaya tambahan ${index + 1}`} disabled={finalized} min="0" onChange={(event) => updateLine('unplannedLines', index, 'actualAmount', event.target.value)} step="any" type="number" value={line.actualAmount ?? ''} /></Field>
              <Field label="Supplier"><Input aria-label={`Supplier biaya tambahan ${index + 1}`} disabled={finalized} onChange={(event) => updateLine('unplannedLines', index, 'supplier', event.target.value)} value={line.supplier ?? ''} /></Field>
              <Field label="No. invoice"><Input aria-label={`Invoice biaya tambahan ${index + 1}`} disabled={finalized} onChange={(event) => updateLine('unplannedLines', index, 'invoiceNo', event.target.value)} value={line.invoiceNo ?? ''} /></Field>
            </div>
            <Field label="Catatan"><Input aria-label={`Catatan biaya tambahan ${index + 1}`} disabled={finalized} onChange={(event) => updateLine('unplannedLines', index, 'notes', event.target.value)} value={line.notes ?? ''} /></Field>
          </article>
        ))}

        {errors.length ? <ul className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-bold text-rose-700">{errors.map((error) => <li key={error}>{error}</li>)}</ul> : null}

        {!finalized ? (
          <div className="flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
            <button className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:text-slate-300" disabled={loading} onClick={() => save('draft')} type="button"><Save size={16} />Simpan draft aktual</button>
            <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 disabled:bg-slate-300" disabled={loading} onClick={() => setConfirmFinalize(true)} type="button"><CheckCircle2 size={16} />Finalisasi aktual</button>
          </div>
        ) : null}

        {confirmFinalize ? (
          <div className="rounded-3xl border border-amber-200 bg-amber-50 p-4">
            <div className="flex gap-3"><AlertTriangle className="shrink-0 text-amber-700" size={20} /><div><p className="font-black text-amber-900">Finalisasi akan mengunci data aktual.</p><p className="mt-1 text-sm font-medium text-amber-800">Pastikan seluruh invoice dan nominal sudah benar.</p></div></div>
            <div className="mt-4 flex gap-2"><button className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white" onClick={() => save('finalized')} type="button">Ya, finalisasi</button><button className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700" onClick={() => setConfirmFinalize(false)} type="button">Batal</button></div>
          </div>
        ) : null}
      </div>
    </section>
  )
}
