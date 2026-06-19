import { useState } from 'react'
import { formatIdr } from '../../lib/format'
import { getStatusLabel } from './priceEstimationModel'

function estimateLabel(estimate) {
  return estimate?.jobNo || estimate?.sku || estimate?.client || 'Untitled estimate'
}

function DetailField({ label, value }) {
  return (
    <div className="rounded-lg bg-slate-50 p-3">
      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="mt-1 font-semibold text-slate-900">{value || '-'}</dd>
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

export function PriceEstimationDetailView({ estimate, loading, onBack, onDelete, onDuplicate, onEdit }) {
  const [confirmDelete, setConfirmDelete] = useState(false)

  if (!estimate) {
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-600">No estimate selected.</p>
        <button className="mt-4 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700" onClick={onBack} type="button">
          Back to estimates
        </button>
      </section>
    )
  }

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <button className="text-sm font-semibold text-blue-600 hover:underline" onClick={onBack} type="button">
              Back to estimates
            </button>
            <h2 className="mt-3 text-2xl font-bold text-slate-950">{estimateLabel(estimate)}</h2>
            <p className="mt-1 text-sm text-slate-500">Full estimate detail and saved line-item inputs.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button aria-label="Edit estimate" className="rounded-lg border border-amber-200 px-3 py-2 text-sm font-semibold text-amber-700 hover:bg-amber-50" disabled={loading} onClick={() => onEdit(estimate)} type="button">Edit</button>
            <button aria-label="Duplicate estimate" className="rounded-lg border border-blue-200 px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50" disabled={loading} onClick={() => onDuplicate(estimate)} type="button">Duplicate</button>
            <button aria-label="Delete estimate" className="rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50" disabled={loading} onClick={() => setConfirmDelete(true)} type="button">Delete</button>
          </div>
        </div>

        {confirmDelete ? (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm font-semibold text-red-800">Confirm deletion of "{estimateLabel(estimate)}"</p>
            <div className="mt-3 flex gap-2">
              <button aria-label="Confirm deletion" className="rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700" onClick={() => onDelete(estimate)} type="button">Delete permanently</button>
              <button className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50" onClick={() => setConfirmDelete(false)} type="button">Cancel</button>
            </div>
          </div>
        ) : null}
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-bold text-slate-950">Estimate summary</h3>
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

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-bold text-slate-950">Line items</h3>
        <ul className="mt-4 space-y-3">
          {(estimate.lineItems ?? []).map((line) => (
            <li className="rounded-lg bg-slate-50 p-4" key={line.id}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-900">{line.priceSnapshot?.name ?? line.layer}</p>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{line.layer}</p>
                </div>
                <p className="font-semibold text-slate-900">{formatIdr(line.computedTotal)}</p>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {readableInputs(line).map((input) => (
                  <span className="rounded bg-white px-2 py-1 text-xs text-slate-600" key={input}>{input}</span>
                ))}
              </div>
              <p className="mt-3 text-sm font-semibold text-slate-700">{formulaSummary(line)}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
