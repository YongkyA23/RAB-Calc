import { Boxes, CalendarClock, FileText, Layers, PackagePlus, Plus, Printer, Sparkles, Trash2, Users } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Field, Input, Select } from '../../components/ui/Form'
import { Button } from '../../components/ui/Button'
import {
  calculateAdditionalLineTotal,
  calculateDigitalLineTotal,
  calculateManualLineTotal,
  calculateManpowerLineTotal,
  calculatePrintLineTotal,
} from '../../lib/calculations'
import { formatIdr } from '../../lib/format'
import { createEmptyQuoteDraft, validateQuoteDraft, buildQuoteFromDraft } from './estimationModel'

function LayerCard({ children, icon: Icon, onAdd, title, addLabel }) {
  return (
    <section className="rounded-4xl border border-white/80 bg-white p-6 shadow-xl shadow-slate-300/40">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {Icon ? (
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-blue-50 text-blue-600">
              <Icon size={20} />
            </span>
          ) : null}
          <h3 className="text-lg font-black tracking-tight text-slate-950">{title}</h3>
        </div>
        <Button onClick={onAdd}>
          <Plus size={17} />
          {addLabel}
        </Button>
      </div>
      <div className="mt-5 space-y-4">{children}</div>
    </section>
  )
}

function LineRow({ children, onRemove, removeLabel }) {
  return (
    <div className="rounded-3xl border border-slate-100 bg-slate-50/80 p-4 shadow-inner shadow-white">
      <div className="mb-3 flex justify-end">
        <Button aria-label={removeLabel} onClick={onRemove} variant="danger">
          <Trash2 size={16} />
          Remove
        </Button>
      </div>
      {children}
    </div>
  )
}

function isMetalizeItem(item) {
  return item?.id === 'additional-metalize' || item?.name?.toLowerCase().includes('metalize')
}

function safeLineTotal(callback) {
  try {
    return callback()
  } catch {
    return 0
  }
}

function numberText(value) {
  return String(value || 0)
}

export function EstimationView({ initialDraft, loading, onCancel, onCreateEstimate, onSaveDraft, priceItems }) {
  const [draft, setDraft] = useState(initialDraft ?? createEmptyQuoteDraft())
  const [errors, setErrors] = useState([])

  const previewQuote = useMemo(() => {
    try {
      return buildQuoteFromDraft(draft, priceItems, { uid: 'preview', name: 'Preview' })
    } catch {
      return { totals: { print: 0, digital: 0, manual: 0, manpower: 0, additional: 0 }, grandTotal: 0, turnaroundDays: 0 }
    }
  }, [draft, priceItems])

  function updateHeader(field, value) {
    setDraft((current) => ({ ...current, header: { ...current.header, [field]: value } }))
  }

  function firstItem(layer) {
    return priceItems?.find((item) => item.categoryLayer === layer)
  }

  function addLine(layer) {
    const firstAdditionalItem = firstItem('additional')
    const defaults = {
      print: { itemId: firstItem('print')?.id ?? '', size: 'A3', qty: 1 },
      digital: { itemId: firstItem('digital')?.id ?? '', size: 'A3', qty: 1 },
      manual: { itemId: firstItem('manual')?.id ?? '', p: 1, l: 1, qty: 1, jmlAlat: 1 },
      manpower: { itemId: firstItem('manpower')?.id ?? '', days: 1 },
      additional: { itemId: firstAdditionalItem?.id ?? '', amount: firstAdditionalItem?.rate ?? 1, quantity: 1, lengthCm: 1, widthCm: 1, notes: '' },
    }

    setDraft((current) => ({ ...current, [layer]: [...current[layer], defaults[layer]] }))
  }

  function updateLine(layer, index, field, value) {
    setDraft((current) => ({
      ...current,
      [layer]: current[layer].map((line, lineIndex) =>
        lineIndex === index ? { ...line, [field]: value } : line,
      ),
    }))
  }

  function removeLine(layer, index) {
    setDraft((current) => ({
      ...current,
      [layer]: current[layer].filter((_, lineIndex) => lineIndex !== index),
    }))
  }

  function createEstimate() {
    const nextErrors = validateQuoteDraft(draft, priceItems)
    setErrors(nextErrors)

    if (nextErrors.length) return

    const estimate = buildQuoteFromDraft(draft, priceItems, { uid: 'pending', name: 'Current User' })
    onCreateEstimate?.(estimate, draft)
  }

  function saveDraft() {
    setErrors([])
    onSaveDraft?.(draft)
  }

  function findItem(itemId) {
    return priceItems?.find((item) => item.id === itemId)
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.45fr_0.55fr]">
      <div className="space-y-6">
        <section className="rounded-4xl border border-white/80 bg-white p-6 shadow-xl shadow-slate-300/40">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/25">
              <FileText size={20} />
            </span>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">Job sheet</p>
              <h2 className="text-2xl font-black tracking-tight text-slate-950">Price Estimation</h2>
            </div>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <Field label="No Job">
              <Input onChange={(event) => updateHeader('jobNo', event.target.value)} value={draft.header.jobNo} />
            </Field>
            <Field label="SKU">
              <Input onChange={(event) => updateHeader('sku', event.target.value)} value={draft.header.sku} />
            </Field>
            <Field label="Client">
              <Input onChange={(event) => updateHeader('client', event.target.value)} value={draft.header.client} />
            </Field>
            <Field label="Project">
              <Input onChange={(event) => updateHeader('project', event.target.value)} value={draft.header.project} />
            </Field>
          </div>
        </section>

        <LayerCard addLabel="Add print line" icon={Printer} onAdd={() => addLine('print')} title="Print">
          {draft.print.map((line, index) => {
            const item = findItem(line.itemId)
            const unitPrice = Number(item?.prices?.[line.size]) || 0
            const total = safeLineTotal(() => calculatePrintLineTotal({ item, size: line.size ?? 'A3', qty: line.qty }))
            return (
              <LineRow key={index} onRemove={() => removeLine('print', index)} removeLabel={`Remove print line ${index + 1}`}>
                <div className="grid gap-3 md:grid-cols-3">
                  <Field label="Material">
                    <Select onChange={(event) => updateLine('print', index, 'itemId', event.target.value)} value={line.itemId}>
                      {priceItems?.filter((item) => item.categoryLayer === 'print').map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                    </Select>
                  </Field>
                  <Field label="Size">
                    <Select onChange={(event) => updateLine('print', index, 'size', event.target.value)} value={line.size}>
                      <option value="A3">A3</option>
                      <option value="B2">B2</option>
                    </Select>
                  </Field>
                  <Field label="Quantity">
                    <Input onChange={(event) => updateLine('print', index, 'qty', event.target.value)} value={line.qty} />
                  </Field>
                </div>
                <p className="mt-3 text-sm font-semibold text-slate-700">{formatIdr(unitPrice)} × {numberText(line.qty)} = {formatIdr(total)}</p>
              </LineRow>
            )
          })}
        </LayerCard>

        <LayerCard addLabel="Add digital line" icon={Sparkles} onAdd={() => addLine('digital')} title="Digital Finishing">
          {draft.digital.map((line, index) => {
            const item = findItem(line.itemId)
            const unitPrice = Number(item?.prices?.[line.size]) || 0
            const total = safeLineTotal(() => calculateDigitalLineTotal({ item, size: line.size ?? 'A3', qty: line.qty }))
            return (
              <LineRow key={index} onRemove={() => removeLine('digital', index)} removeLabel={`Remove digital line ${index + 1}`}>
                <div className="grid gap-3 md:grid-cols-3">
                  <Field label="Finishing">
                    <Select onChange={(event) => updateLine('digital', index, 'itemId', event.target.value)} value={line.itemId}>
                      {priceItems?.filter((item) => item.categoryLayer === 'digital').map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                    </Select>
                  </Field>
                  <Field label="Size">
                    <Select onChange={(event) => updateLine('digital', index, 'size', event.target.value)} value={line.size}>
                      <option value="A3">A3</option>
                      <option value="B2">B2</option>
                    </Select>
                  </Field>
                  <Field label="Quantity">
                    <Input onChange={(event) => updateLine('digital', index, 'qty', event.target.value)} value={line.qty} />
                  </Field>
                </div>
                <p className="mt-3 text-sm font-semibold text-slate-700">{formatIdr(unitPrice)} × {numberText(line.qty)} = {formatIdr(total)}</p>
              </LineRow>
            )
          })}
        </LayerCard>

        <LayerCard addLabel="Add manual line" icon={Layers} onAdd={() => addLine('manual')} title="Manual Finishing">
          {draft.manual.map((line, index) => {
            const item = findItem(line.itemId)
            const result = safeLineTotal(() => calculateManualLineTotal({ item, ...line })) || { total: 0 }
            const total = result.total ?? 0
            return (
              <LineRow key={index} onRemove={() => removeLine('manual', index)} removeLabel={`Remove manual line ${index + 1}`}>
                <div className="grid gap-3 md:grid-cols-5">
                  <Field label="Finishing">
                    <Select onChange={(event) => updateLine('manual', index, 'itemId', event.target.value)} value={line.itemId}>
                      {priceItems?.filter((item) => item.categoryLayer === 'manual').map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                    </Select>
                  </Field>
                  {[
                    ['p', 'Length (cm)'],
                    ['l', 'Width (cm)'],
                    ['qty', 'Quantity'],
                    ['jmlAlat', 'Tool count'],
                  ].map(([field, label]) => (
                    <Field key={field} label={label}>
                      <Input onChange={(event) => updateLine('manual', index, field, event.target.value)} value={line[field] ?? ''} />
                    </Field>
                  ))}
                </div>
                <p className="mt-3 text-sm font-semibold text-slate-700">Line total = {formatIdr(total)}</p>
              </LineRow>
            )
          })}
        </LayerCard>

        <LayerCard addLabel="Add manpower line" icon={Users} onAdd={() => addLine('manpower')} title="Manpower">
          {draft.manpower.map((line, index) => {
            const item = findItem(line.itemId)
            const rate = Number(item?.dailyRate) || 0
            const total = safeLineTotal(() => calculateManpowerLineTotal({ days: line.days, rate }))
            return (
              <LineRow key={index} onRemove={() => removeLine('manpower', index)} removeLabel={`Remove manpower line ${index + 1}`}>
                <div className="grid gap-3 md:grid-cols-2">
                  <Field label="Manpower">
                    <Select onChange={(event) => updateLine('manpower', index, 'itemId', event.target.value)} value={line.itemId}>
                      {priceItems?.filter((item) => item.categoryLayer === 'manpower').map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                    </Select>
                  </Field>
                  <Field label="Days">
                    <Input onChange={(event) => updateLine('manpower', index, 'days', event.target.value)} value={line.days} />
                  </Field>
                </div>
                <p className="mt-3 text-sm font-semibold text-slate-700">{formatIdr(rate)} × {numberText(line.days)} = {formatIdr(total)}</p>
              </LineRow>
            )
          })}
        </LayerCard>

        <LayerCard addLabel="Add additional line" icon={PackagePlus} onAdd={() => addLine('additional')} title="Additional Costs">
          {draft.additional.map((line, index) => {
            const item = findItem(line.itemId)
            const metalize = isMetalizeItem(item)
            const amount = line.amount || item?.rate || 5000
            const total = safeLineTotal(() => calculateAdditionalLineTotal({
              mode: item?.additionalMode,
              amount,
              quantity: line.quantity,
              rate: item?.rate,
              lengthCm: line.lengthCm,
              widthCm: line.widthCm,
            }))
            return (
              <LineRow key={index} onRemove={() => removeLine('additional', index)} removeLabel={`Remove additional line ${index + 1}`}>
                <div className={`grid gap-3 ${metalize ? 'md:grid-cols-4' : 'md:grid-cols-3'}`}>
                  <Field label="Cost type">
                    <Select onChange={(event) => updateLine('additional', index, 'itemId', event.target.value)} value={line.itemId}>
                      {priceItems?.filter((item) => item.categoryLayer === 'additional').map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                    </Select>
                  </Field>
                  {metalize ? (
                    <>
                      <Field label="Length (cm)">
                        <Input onChange={(event) => updateLine('additional', index, 'lengthCm', event.target.value)} value={line.lengthCm ?? ''} />
                      </Field>
                      <Field label="Width (cm)">
                        <Input onChange={(event) => updateLine('additional', index, 'widthCm', event.target.value)} value={line.widthCm ?? ''} />
                      </Field>
                      <Field label="Quantity">
                        <Input onChange={(event) => updateLine('additional', index, 'quantity', event.target.value)} value={line.quantity} />
                      </Field>
                    </>
                  ) : (
                    <>
                      <Field label="Amount">
                        <Input onChange={(event) => updateLine('additional', index, 'amount', event.target.value)} value={amount} />
                      </Field>
                      <Field label="Quantity">
                        <Input onChange={(event) => updateLine('additional', index, 'quantity', event.target.value)} value={line.quantity} />
                      </Field>
                    </>
                  )}
                </div>
                <div className="mt-3 grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
                  <Field label="Notes">
                    <Input onChange={(event) => updateLine('additional', index, 'notes', event.target.value)} value={line.notes ?? ''} />
                  </Field>
                  <p className="text-sm font-semibold text-slate-700">
                    {metalize
                      ? `${line.lengthCm || 0} × ${line.widthCm || 0} × ${line.quantity || 0} × Rp ${item?.rate || 0} = ${formatIdr(total)}`
                      : `${formatIdr(amount)} × ${line.quantity || 0} = ${formatIdr(total)}`}
                  </p>
                </div>
              </LineRow>
            )
          })}
        </LayerCard>
      </div>

      <aside className="space-y-5 rounded-4xl border border-white/80 bg-white p-6 shadow-xl shadow-slate-300/40 xl:sticky xl:top-32 xl:self-start">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-blue-50 text-blue-600">
            <Boxes size={20} />
          </span>
          <h3 className="text-lg font-black tracking-tight text-slate-950">Grand Total</h3>
        </div>
        <p className="text-4xl font-black tracking-tight text-blue-700">{formatIdr(previewQuote.grandTotal)}</p>
        <dl className="space-y-2 text-sm text-slate-600">
          {Object.entries(previewQuote.totals).map(([key, value]) => (
            <div className="flex justify-between" key={key}>
              <dt className="capitalize">{key}</dt>
              <dd>{formatIdr(value)}</dd>
            </div>
          ))}
          <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-3 py-2 font-bold text-slate-900">
            <dt className="inline-flex items-center gap-2"><CalendarClock size={16} />Turnaround</dt>
            <dd>{previewQuote.turnaroundDays} days</dd>
          </div>
        </dl>
        {errors.length ? (
          <ul className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {errors.map((error) => <li key={error}>{error}</li>)}
          </ul>
        ) : null}
        <div className="space-y-2">
          <button
            className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:text-slate-300"
            disabled={loading}
            onClick={saveDraft}
            type="button"
          >
            Save Draft
          </button>
          <button
            className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:bg-slate-300"
            disabled={loading}
            onClick={createEstimate}
            type="button"
          >
            Create Estimate
          </button>
          {onCancel ? (
            <button
              className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              onClick={onCancel}
              type="button"
            >
              Cancel
            </button>
          ) : null}
        </div>
      </aside>
    </div>
  )
}
