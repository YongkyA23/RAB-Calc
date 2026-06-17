import { useMemo, useState } from 'react'
import { formatIdr } from '../../lib/format'
import { buildQuoteFromDraft, createEmptyQuoteDraft, validateQuoteDraft } from './estimationModel'

function itemsByLayer(priceItems, layer) {
  return priceItems.filter((item) => item.categoryLayer === layer && item.active !== false)
}

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
      className="mt-2 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
      {...props}
    />
  )
}

function Select(props) {
  return (
    <select
      className="mt-2 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
      {...props}
    />
  )
}

function LayerCard({ children, onAdd, title, addLabel }) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-lg font-bold text-slate-950">{title}</h3>
        <button
          className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          onClick={onAdd}
          type="button"
        >
          {addLabel}
        </button>
      </div>
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  )
}

export function EstimationView({ initialDraft, loading, onSaveQuote, priceItems }) {
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

  function addLine(layer) {
    const defaults = {
      print: { itemId: itemsByLayer(priceItems, 'print')[0]?.id ?? '', size: 'A3', qty: 1 },
      digital: { itemId: itemsByLayer(priceItems, 'digital')[0]?.id ?? '', size: 'A3', qty: 1 },
      manual: { itemId: itemsByLayer(priceItems, 'manual')[0]?.id ?? '', p: 1, l: 1, qty: 1, jmlAlat: 1, manualQuotedAmount: '' },
      manpower: { itemId: itemsByLayer(priceItems, 'manpower')[0]?.id ?? '', days: 1 },
      additional: { itemId: itemsByLayer(priceItems, 'additional')[0]?.id ?? '', amount: 1, quantity: 1 },
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

  function saveQuote() {
    const nextErrors = validateQuoteDraft(draft, priceItems)
    setErrors(nextErrors)

    if (nextErrors.length) return

    onSaveQuote(buildQuoteFromDraft(draft, priceItems, { uid: 'pending', name: 'Current User' }))
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.4fr_0.6fr]">
      <div className="space-y-6">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-950">Create Estimation</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <Field label="No Job">
              <Input onChange={(event) => updateHeader('jobNo', event.target.value)} value={draft.header.jobNo} />
            </Field>
            <Field label="SKU">
              <Input onChange={(event) => updateHeader('sku', event.target.value)} value={draft.header.sku} />
            </Field>
            <Field label="Nama Klien">
              <Input onChange={(event) => updateHeader('client', event.target.value)} value={draft.header.client} />
            </Field>
            <Field label="Judul Project">
              <Input onChange={(event) => updateHeader('project', event.target.value)} value={draft.header.project} />
            </Field>
          </div>
        </section>

        <LayerCard addLabel="Add print line" onAdd={() => addLine('print')} title="Print">
          {draft.print.map((line, index) => (
            <div className="grid gap-3 rounded-2xl bg-slate-50 p-4 md:grid-cols-3" key={index}>
              <Field label={`Print item ${index + 1}`}>
                <Select onChange={(event) => updateLine('print', index, 'itemId', event.target.value)} value={line.itemId}>
                  {itemsByLayer(priceItems, 'print').map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                </Select>
              </Field>
              <Field label={`Print size ${index + 1}`}>
                <Select onChange={(event) => updateLine('print', index, 'size', event.target.value)} value={line.size}>
                  <option value="A3">A3</option>
                  <option value="B2">B2</option>
                </Select>
              </Field>
              <Field label={`Print qty ${index + 1}`}>
                <Input onChange={(event) => updateLine('print', index, 'qty', event.target.value)} value={line.qty} />
              </Field>
            </div>
          ))}
        </LayerCard>

        <LayerCard addLabel="Add digital line" onAdd={() => addLine('digital')} title="Digital Finishing">
          {draft.digital.map((line, index) => (
            <div className="grid gap-3 rounded-2xl bg-slate-50 p-4 md:grid-cols-3" key={index}>
              <Field label={`Digital item ${index + 1}`}>
                <Select onChange={(event) => updateLine('digital', index, 'itemId', event.target.value)} value={line.itemId}>
                  {itemsByLayer(priceItems, 'digital').map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                </Select>
              </Field>
              <Field label={`Digital size ${index + 1}`}>
                <Select onChange={(event) => updateLine('digital', index, 'size', event.target.value)} value={line.size}>
                  <option value="A3">A3</option>
                  <option value="B2">B2</option>
                </Select>
              </Field>
              <Field label={`Digital qty ${index + 1}`}>
                <Input onChange={(event) => updateLine('digital', index, 'qty', event.target.value)} value={line.qty} />
              </Field>
            </div>
          ))}
        </LayerCard>

        <LayerCard addLabel="Add manual line" onAdd={() => addLine('manual')} title="Manual Finishing">
          {draft.manual.map((line, index) => (
            <div className="grid gap-3 rounded-2xl bg-slate-50 p-4 md:grid-cols-3" key={index}>
              <Field label={`Manual item ${index + 1}`}>
                <Select onChange={(event) => updateLine('manual', index, 'itemId', event.target.value)} value={line.itemId}>
                  {itemsByLayer(priceItems, 'manual').map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                </Select>
              </Field>
              {['p', 'l', 'qty', 'jmlAlat', 'manualQuotedAmount'].map((field) => (
                <Field key={field} label={`Manual ${field} ${index + 1}`}>
                  <Input onChange={(event) => updateLine('manual', index, field, event.target.value)} value={line[field] ?? ''} />
                </Field>
              ))}
            </div>
          ))}
        </LayerCard>

        <LayerCard addLabel="Add manpower line" onAdd={() => addLine('manpower')} title="Manpower">
          {draft.manpower.map((line, index) => (
            <div className="grid gap-3 rounded-2xl bg-slate-50 p-4 md:grid-cols-2" key={index}>
              <Field label={`Manpower item ${index + 1}`}>
                <Select onChange={(event) => updateLine('manpower', index, 'itemId', event.target.value)} value={line.itemId}>
                  {itemsByLayer(priceItems, 'manpower').map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                </Select>
              </Field>
              <Field label={`Manpower days ${index + 1}`}>
                <Input onChange={(event) => updateLine('manpower', index, 'days', event.target.value)} value={line.days} />
              </Field>
            </div>
          ))}
        </LayerCard>

        <LayerCard addLabel="Add additional line" onAdd={() => addLine('additional')} title="Additional Costs">
          {draft.additional.map((line, index) => (
            <div className="grid gap-3 rounded-2xl bg-slate-50 p-4 md:grid-cols-3" key={index}>
              <Field label={`Additional item ${index + 1}`}>
                <Select onChange={(event) => updateLine('additional', index, 'itemId', event.target.value)} value={line.itemId}>
                  {itemsByLayer(priceItems, 'additional').map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                </Select>
              </Field>
              <Field label={`Additional amount ${index + 1}`}>
                <Input onChange={(event) => updateLine('additional', index, 'amount', event.target.value)} value={line.amount} />
              </Field>
              <Field label={`Additional quantity ${index + 1}`}>
                <Input onChange={(event) => updateLine('additional', index, 'quantity', event.target.value)} value={line.quantity} />
              </Field>
            </div>
          ))}
        </LayerCard>
      </div>

      <aside className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm xl:sticky xl:top-6 xl:self-start">
        <h3 className="text-lg font-bold text-slate-950">Grand Total</h3>
        <p className="text-3xl font-bold text-blue-700">{formatIdr(previewQuote.grandTotal)}</p>
        <dl className="space-y-2 text-sm text-slate-600">
          {Object.entries(previewQuote.totals).map(([key, value]) => (
            <div className="flex justify-between" key={key}>
              <dt className="capitalize">{key}</dt>
              <dd>{formatIdr(value)}</dd>
            </div>
          ))}
          <div className="flex justify-between font-semibold text-slate-900">
            <dt>Turnaround</dt>
            <dd>{previewQuote.turnaroundDays} days</dd>
          </div>
        </dl>
        {errors.length ? (
          <ul className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {errors.map((error) => <li key={error}>{error}</li>)}
          </ul>
        ) : null}
        <button
          className="w-full rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:bg-slate-300"
          disabled={loading}
          onClick={saveQuote}
          type="button"
        >
          Save quote
        </button>
      </aside>
    </div>
  )
}
