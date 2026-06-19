import { ArrowLeft, Copy, Edit3, FileDown, FileText, Layers, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { formatIdr } from '../../lib/format'
import { getStatusLabel } from './priceEstimationModel'

function estimateLabel(estimate) {
  return estimate?.jobNo || estimate?.sku || estimate?.client || 'Untitled estimate'
}

function DetailField({ label, value }) {
  return (
    <div className="rounded-3xl border border-slate-100 bg-slate-50/80 p-4">
      <dt className="text-xs font-black uppercase tracking-wide text-slate-400">{label}</dt>
      <dd className="mt-1 font-black text-slate-900">{value || '-'}</dd>
    </div>
  )
}

function readNumber(value, fallback = 0) {
  const number = Number(value)
  return Number.isFinite(number) ? number : fallback
}

function unitPrice(line) {
  const size = line.inputs?.size
  return readNumber(line.priceSnapshot?.prices?.[size])
}

function readableInputs(line) {
  const inputs = line.inputs ?? {}
  const rows = []

  if (inputs.size) rows.push(`Size: ${inputs.size}`)
  if (inputs.qty) rows.push(`Quantity: ${inputs.qty}`)
  if (inputs.quantity) rows.push(`Quantity: ${inputs.quantity}`)
  if (inputs.p) rows.push(`Length: ${inputs.p} cm`)
  if (inputs.l) rows.push(`Width: ${inputs.l} cm`)
  if (inputs.lengthCm) rows.push(`Length: ${inputs.lengthCm} cm`)
  if (inputs.widthCm) rows.push(`Width: ${inputs.widthCm} cm`)
  if (inputs.jmlAlat) rows.push(`Tool count: ${inputs.jmlAlat}`)
  if (inputs.days) rows.push(`Days: ${inputs.days}`)
  if (inputs.amount) rows.push(`Amount: ${formatIdr(inputs.amount)}`)
  if (inputs.notes) rows.push(`Notes: ${inputs.notes}`)

  return rows
}

function formulaSummary(line) {
  const inputs = line.inputs ?? {}
  const total = formatIdr(line.computedTotal)

  if (line.layer === 'print' || line.layer === 'digital') {
    return `${formatIdr(unitPrice(line))} × ${inputs.qty || 0} = ${total}`
  }

  if (line.layer === 'manpower') {
    return `${formatIdr(line.priceSnapshot?.dailyRate)} × ${inputs.days || 0} day = ${total}`
  }

  if (line.layer === 'additional' && line.priceSnapshot?.additionalMode === 'area') {
    return `${inputs.lengthCm || 0} × ${inputs.widthCm || 0} × ${inputs.quantity || 0} × Rp ${line.priceSnapshot?.rate || 0} = ${total}`
  }

  if (line.layer === 'additional' && line.priceSnapshot?.additionalMode === 'rate') {
    return `${formatIdr(line.priceSnapshot?.rate)} × ${inputs.quantity || 0} = ${total}`
  }

  if (line.layer === 'additional' && inputs.amount) {
    return `${formatIdr(inputs.amount)} = ${total}`
  }

  if (line.layer === 'manual') {
    return `Line total = ${total}`
  }

  return `Line total = ${total}`
}

export function PriceEstimationDetailView({ estimate, loading, onBack, onDelete, onDuplicate, onEdit, onGeneratePdf }) {
  const [confirmDelete, setConfirmDelete] = useState(false)

  if (!estimate) {
    return (
      <section className="rounded-4xl border border-white/80 bg-white p-6 shadow-xl shadow-slate-300/40">
        <p className="text-sm font-medium text-slate-600">No estimate selected.</p>
        <button className="mt-4 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm" onClick={onBack} type="button">
          <ArrowLeft size={16} />
          Back to estimates
        </button>
      </section>
    )
  }

  return (
    <div className="space-y-6">
      <section className="rounded-4xl border border-white/80 bg-white p-6 shadow-xl shadow-slate-300/40">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <button className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:underline" onClick={onBack} type="button">
              <ArrowLeft size={16} />
              Back to estimates
            </button>
            <div className="mt-4 flex items-center gap-3">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-50 text-blue-600">
                <FileText size={22} />
              </span>
              <div>
                <h2 className="text-3xl font-black tracking-tight text-slate-950">{estimateLabel(estimate)}</h2>
                <p className="mt-1 text-sm font-medium text-slate-500">Full estimate detail and saved line-item inputs.</p>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {onGeneratePdf ? (
              <button aria-label="Generate PDF" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50" disabled={loading} onClick={() => onGeneratePdf(estimate)} type="button"><FileDown size={16} />PDF</button>
            ) : null}
            <button aria-label="Edit estimate" className="inline-flex items-center gap-2 rounded-xl border border-amber-200 px-3 py-2 text-sm font-bold text-amber-700 transition hover:bg-amber-50" disabled={loading} onClick={() => onEdit(estimate)} type="button"><Edit3 size={16} />Edit</button>
            <button aria-label="Duplicate estimate" className="inline-flex items-center gap-2 rounded-xl border border-blue-200 px-3 py-2 text-sm font-bold text-blue-700 transition hover:bg-blue-50" disabled={loading} onClick={() => onDuplicate(estimate)} type="button"><Copy size={16} />Duplicate</button>
            <button aria-label="Delete estimate" className="inline-flex items-center gap-2 rounded-xl border border-rose-200 px-3 py-2 text-sm font-bold text-rose-700 transition hover:bg-rose-50" disabled={loading} onClick={() => setConfirmDelete(true)} type="button"><Trash2 size={16} />Delete</button>
          </div>
        </div>

        {confirmDelete ? (
          <div className="mt-4 rounded-3xl border border-rose-200 bg-rose-50 p-4">
            <p className="text-sm font-bold text-rose-800">Confirm deletion of "{estimateLabel(estimate)}"</p>
            <div className="mt-3 flex gap-2">
              <button aria-label="Confirm deletion" className="rounded-xl bg-rose-600 px-3 py-2 text-sm font-bold text-white hover:bg-rose-700" onClick={() => onDelete(estimate)} type="button">Delete permanently</button>
              <button className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50" onClick={() => setConfirmDelete(false)} type="button">Cancel</button>
            </div>
          </div>
        ) : null}
      </section>

      <section className="rounded-4xl border border-white/80 bg-white p-6 shadow-xl shadow-slate-300/40">
        <h3 className="text-lg font-black tracking-tight text-slate-950">Estimate summary</h3>
        <dl className="mt-4 grid gap-3 md:grid-cols-3">
          <DetailField label="No Job" value={estimate.jobNo} />
          <DetailField label="SKU" value={estimate.sku} />
          <DetailField label="Client" value={estimate.client} />
          <DetailField label="Project" value={estimate.project} />
          <DetailField label="Status" value={getStatusLabel(estimate)} />
          <DetailField label="Total" value={formatIdr(estimate.grandTotal)} />
          <DetailField label="Turnaround" value={`${estimate.turnaroundDays ?? 0} days`} />
        </dl>
      </section>

      <section className="rounded-4xl border border-white/80 bg-white p-6 shadow-xl shadow-slate-300/40">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-slate-100 text-slate-700">
            <Layers size={20} />
          </span>
          <h3 className="text-lg font-black tracking-tight text-slate-950">Line items</h3>
        </div>
        <ul className="mt-5 space-y-3">
          {(estimate.lineItems ?? []).map((line) => (
            <li className="rounded-3xl border border-slate-100 bg-slate-50/80 p-4" key={line.id}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-black text-slate-900">{line.priceSnapshot?.name ?? line.layer}</p>
                  <p className="text-xs font-black uppercase tracking-wide text-slate-400">{line.layer}</p>
                </div>
                <p className="font-black text-slate-900">{formatIdr(line.computedTotal)}</p>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {readableInputs(line).map((input) => (
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-600 shadow-sm" key={input}>{input}</span>
                ))}
              </div>
              <p className="mt-3 text-sm font-bold text-slate-700">{formulaSummary(line)}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
