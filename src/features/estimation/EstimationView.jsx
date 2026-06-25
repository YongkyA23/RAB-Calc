import { Boxes, CalendarClock, FileText, Layers, Loader2, PackagePlus, Plus, Printer, Sparkles, Trash2, Users } from 'lucide-react'
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

function LayerCard({ children, icon: Icon, id, onAdd, title, addLabel }) {
  return (
    <section id={id} className="scroll-mt-32 rounded-4xl border border-white/80 bg-white p-6 shadow-xl shadow-slate-300/40">
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
          Hapus
        </Button>
      </div>
      {children}
    </div>
  )
}

function scrollToSection(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function SectionJumpNav({ sections, variant = 'sidebar' }) {
  const mobile = variant === 'mobile'

  return (
    <nav
      aria-label="Lompat ke bagian estimasi"
      className={mobile
        ? 'sticky top-24 z-20 -mx-1 overflow-x-auto rounded-3xl border border-white/80 bg-white/95 p-2 shadow-lg shadow-slate-300/30 backdrop-blur xl:hidden'
        : 'rounded-3xl border border-slate-100 bg-slate-50/80 p-3'}
    >
      <p className={mobile ? 'sr-only' : 'px-1 text-xs font-black uppercase tracking-[0.2em] text-blue-600'}>Lompat ke</p>
      <div className={mobile ? 'flex min-w-max gap-2' : 'mt-3 space-y-2'}>
        {sections.map(({ count, icon: Icon, id, label }) => (
          <button
            className={mobile
              ? 'inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700'
              : 'flex w-full items-center gap-3 rounded-2xl bg-white px-3 py-2 text-left text-sm font-bold text-slate-700 shadow-sm transition hover:bg-blue-50 hover:text-blue-700'}
            key={id}
            onClick={() => scrollToSection(id)}
            type="button"
          >
            <Icon size={16} />
            {label}
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-black text-slate-500">{count}</span>
          </button>
        ))}
      </div>
    </nav>
  )
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

  const sectionJumps = [
    { count: draft.print.length, icon: Printer, id: 'print-items', label: 'Print' },
    { count: draft.digital.length, icon: Sparkles, id: 'digital-finishing', label: 'Digital' },
    { count: draft.manual.length, icon: Layers, id: 'manual-finishing', label: 'Manual' },
    { count: draft.manpower.length, icon: Users, id: 'manpower', label: 'Manpower' },
    { count: draft.additional.length, icon: PackagePlus, id: 'additional-costs', label: 'Additional' },
  ]

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
        <SectionJumpNav sections={sectionJumps} variant="mobile" />

        <section className="rounded-4xl border border-white/80 bg-white p-6 shadow-xl shadow-slate-300/40">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/25">
              <FileText size={20} />
            </span>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">Lembar kerja</p>
              <h2 className="text-2xl font-black tracking-tight text-slate-950">Estimasi Harga</h2>
            </div>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <Field label="No Job">
              <Input onChange={(event) => updateHeader('jobNo', event.target.value)} value={draft.header.jobNo} />
            </Field>
            <Field label="SKU">
              <Input onChange={(event) => updateHeader('sku', event.target.value)} value={draft.header.sku} />
            </Field>
            <Field label="Klien">
              <Input onChange={(event) => updateHeader('client', event.target.value)} value={draft.header.client} />
            </Field>
            <Field label="Proyek">
              <Input onChange={(event) => updateHeader('project', event.target.value)} value={draft.header.project} />
            </Field>
          </div>
        </section>

        <LayerCard addLabel="Tambah baris print" icon={Printer} id="print-items" onAdd={() => addLine('print')} title="Print">
          {draft.print.map((line, index) => {
            const item = findItem(line.itemId)
            const unitPrice = Number(item?.prices?.[line.size]) || 0
            const total = safeLineTotal(() => calculatePrintLineTotal({ item, size: line.size ?? 'A3', qty: line.qty }))
            return (
              <LineRow key={index} onRemove={() => removeLine('print', index)} removeLabel={`Hapus baris print ${index + 1}`}>
                <div className="grid gap-3 md:grid-cols-3">
                  <Field label="Material">
                    <Select onChange={(event) => updateLine('print', index, 'itemId', event.target.value)} value={line.itemId}>
                      {priceItems?.filter((item) => item.categoryLayer === 'print').map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                    </Select>
                  </Field>
                  <Field label="Ukuran">
                    <Select onChange={(event) => updateLine('print', index, 'size', event.target.value)} value={line.size}>
                      <option value="A3">A3</option>
                      <option value="B2">B2</option>
                    </Select>
                  </Field>
                  <Field label="Jumlah">
                    <Input onChange={(event) => updateLine('print', index, 'qty', event.target.value)} value={line.qty} />
                  </Field>
                </div>
                <p className="mt-3 text-sm font-semibold text-slate-700">{formatIdr(unitPrice)} × {numberText(line.qty)} = {formatIdr(total)}</p>
              </LineRow>
            )
          })}
        </LayerCard>

        <LayerCard addLabel="Tambah baris digital" icon={Sparkles} id="digital-finishing" onAdd={() => addLine('digital')} title="Digital Finishing">
          {draft.digital.map((line, index) => {
            const item = findItem(line.itemId)
            const unitPrice = Number(item?.prices?.[line.size]) || 0
            const total = safeLineTotal(() => calculateDigitalLineTotal({ item, size: line.size ?? 'A3', qty: line.qty }))
            return (
              <LineRow key={index} onRemove={() => removeLine('digital', index)} removeLabel={`Hapus baris digital ${index + 1}`}>
                <div className="grid gap-3 md:grid-cols-3">
                  <Field label="Finishing">
                    <Select onChange={(event) => updateLine('digital', index, 'itemId', event.target.value)} value={line.itemId}>
                      {priceItems?.filter((item) => item.categoryLayer === 'digital').map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                    </Select>
                  </Field>
                  <Field label="Ukuran">
                    <Select onChange={(event) => updateLine('digital', index, 'size', event.target.value)} value={line.size}>
                      <option value="A3">A3</option>
                      <option value="B2">B2</option>
                    </Select>
                  </Field>
                  <Field label="Jumlah">
                    <Input onChange={(event) => updateLine('digital', index, 'qty', event.target.value)} value={line.qty} />
                  </Field>
                </div>
                <p className="mt-3 text-sm font-semibold text-slate-700">{formatIdr(unitPrice)} × {numberText(line.qty)} = {formatIdr(total)}</p>
              </LineRow>
            )
          })}
        </LayerCard>

        <LayerCard addLabel="Tambah baris manual" icon={Layers} id="manual-finishing" onAdd={() => addLine('manual')} title="Manual Finishing">
          {draft.manual.map((line, index) => {
            const item = findItem(line.itemId)
            const result = safeLineTotal(() => calculateManualLineTotal({ item, ...line })) || { total: 0 }
            const total = result.total ?? 0
            return (
              <LineRow key={index} onRemove={() => removeLine('manual', index)} removeLabel={`Hapus baris manual ${index + 1}`}>
                <div className="grid gap-3 md:grid-cols-5">
                  <Field label="Finishing">
                    <Select onChange={(event) => updateLine('manual', index, 'itemId', event.target.value)} value={line.itemId}>
                      {priceItems?.filter((item) => item.categoryLayer === 'manual').map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                    </Select>
                  </Field>
                  {[
                    ['p', 'Panjang (cm)'],
                    ['l', 'Lebar (cm)'],
                    ['qty', 'Jumlah'],
                    ['jmlAlat', 'Jumlah alat'],
                  ].map(([field, label]) => (
                    <Field key={field} label={label}>
                      <Input onChange={(event) => updateLine('manual', index, field, event.target.value)} value={line[field] ?? ''} />
                    </Field>
                  ))}
                </div>
                <p className="mt-3 text-sm font-semibold text-slate-700">Total baris = {formatIdr(total)}</p>
              </LineRow>
            )
          })}
        </LayerCard>

        <LayerCard addLabel="Tambah baris manpower" icon={Users} id="manpower" onAdd={() => addLine('manpower')} title="Manpower">
          {draft.manpower.map((line, index) => {
            const item = findItem(line.itemId)
            const rate = Number(item?.dailyRate) || 0
            const total = safeLineTotal(() => calculateManpowerLineTotal({ days: line.days, rate }))
            return (
              <LineRow key={index} onRemove={() => removeLine('manpower', index)} removeLabel={`Hapus baris manpower ${index + 1}`}>
                <div className="grid gap-3 md:grid-cols-2">
                  <Field label="Manpower">
                    <Select onChange={(event) => updateLine('manpower', index, 'itemId', event.target.value)} value={line.itemId}>
                      {priceItems?.filter((item) => item.categoryLayer === 'manpower').map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                    </Select>
                  </Field>
                  <Field label="Hari">
                    <Input onChange={(event) => updateLine('manpower', index, 'days', event.target.value)} value={line.days} />
                  </Field>
                </div>
                <p className="mt-3 text-sm font-semibold text-slate-700">{formatIdr(rate)} × {numberText(line.days)} = {formatIdr(total)}</p>
              </LineRow>
            )
          })}
        </LayerCard>

        <LayerCard addLabel="Tambah baris tambahan" icon={PackagePlus} id="additional-costs" onAdd={() => addLine('additional')} title="Biaya Tambahan">
          {draft.additional.map((line, index) => {
            const item = findItem(line.itemId)
            const isArea = item?.additionalMode === 'area'
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
              <LineRow key={index} onRemove={() => removeLine('additional', index)} removeLabel={`Hapus baris tambahan ${index + 1}`}>
                <div className={`grid gap-3 ${isArea ? 'md:grid-cols-4' : 'md:grid-cols-3'}`}>
                  <Field label="Jenis biaya">
                    <Select onChange={(event) => updateLine('additional', index, 'itemId', event.target.value)} value={line.itemId}>
                      {priceItems?.filter((item) => item.categoryLayer === 'additional').map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                    </Select>
                  </Field>
                  {isArea ? (
                    <>
                      <Field label="Panjang (cm)">
                        <Input onChange={(event) => updateLine('additional', index, 'lengthCm', event.target.value)} value={line.lengthCm ?? ''} />
                      </Field>
                      <Field label="Lebar (cm)">
                        <Input onChange={(event) => updateLine('additional', index, 'widthCm', event.target.value)} value={line.widthCm ?? ''} />
                      </Field>
                      <Field label="Jumlah">
                        <Input onChange={(event) => updateLine('additional', index, 'quantity', event.target.value)} value={line.quantity} />
                      </Field>
                    </>
                  ) : (
                    <>
                      <Field label="Nominal">
                        <Input onChange={(event) => updateLine('additional', index, 'amount', event.target.value)} value={amount} />
                      </Field>
                      <Field label="Jumlah">
                        <Input onChange={(event) => updateLine('additional', index, 'quantity', event.target.value)} value={line.quantity} />
                      </Field>
                    </>
                  )}
                </div>
                <div className="mt-3 grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
                  <Field label="Catatan">
                    <Input onChange={(event) => updateLine('additional', index, 'notes', event.target.value)} value={line.notes ?? ''} />
                  </Field>
                  <p className="text-sm font-semibold text-slate-700">
                    {isArea
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
          <h3 className="text-lg font-black tracking-tight text-slate-950">Total Keseluruhan</h3>
        </div>
        <p className="text-4xl font-black tracking-tight text-blue-700">{formatIdr(previewQuote.grandTotal)}</p>
        <SectionJumpNav sections={sectionJumps} />
        <dl className="space-y-2 text-sm text-slate-600">
          {Object.entries(previewQuote.totals).map(([key, value]) => (
            <div className="flex justify-between" key={key}>
              <dt className="capitalize">{key}</dt>
              <dd>{formatIdr(value)}</dd>
            </div>
          ))}
          <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-3 py-2 font-bold text-slate-900">
            <dt className="inline-flex items-center gap-2"><CalendarClock size={16} />Waktu pengerjaan</dt>
            <dd>{previewQuote.turnaroundDays} hari</dd>
          </div>
        </dl>
        {errors.length ? (
          <ul className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {errors.map((error) => <li key={error}>{error}</li>)}
          </ul>
        ) : null}
        <div className="space-y-2">
          <button
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-300"
            disabled={loading}
            onClick={saveDraft}
            type="button"
          >
            {loading ? <Loader2 className="animate-spin" size={16} /> : null}
            Simpan Draf
          </button>
          <button
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            disabled={loading}
            onClick={createEstimate}
            type="button"
          >
            {loading ? <Loader2 className="animate-spin" size={16} /> : null}
            Buat Estimasi
          </button>
          {onCancel ? (
            <button
              className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              onClick={onCancel}
              type="button"
            >
              Batal
            </button>
          ) : null}
        </div>
      </aside>
    </div>
  )
}
