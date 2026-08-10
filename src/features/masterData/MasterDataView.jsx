import {
  Clock,
  Database,
  Edit3,
  History,
  Layers,
  Plus,
  Save,
  Trash2,
  UploadCloud,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { TableSkeletonRows } from '../../components/ui/Table'
import { formatIdr } from '../../lib/format'
import {
  buildPriceItemPayload,
  createPriceItemId,
  filterPriceItemsByLayer,
  getCategoryFieldSchema,
  getEmptyPriceItemDraft,
  summarizeAuditEntry,
  validatePriceItemDraft,
} from './masterDataModel'

function Field({ children, label }) {
  return (
    <label className="block text-sm font-bold text-slate-700">
      <span>{label}</span>
      {children}
    </label>
  )
}

function TextInput(props) {
  return (
    <input
      className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium outline-none transition hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
      {...props}
    />
  )
}

function SelectInput(props) {
  return (
    <select
      className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium outline-none transition hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
      {...props}
    />
  )
}

function numberInputProps() {
  return { min: '0', step: 'any', type: 'number' }
}

function formatRate(item) {
  if (item.categoryLayer === 'print' || item.categoryLayer === 'digital') {
    const prices = [`A3 ${formatIdr(item.prices?.A3)}`]
    if (!item.a3Only) prices.push(`B2 ${formatIdr(item.prices?.B2)}`)
    return prices.join(' · ')
  }

  if (item.categoryLayer === 'manual') {
    const rates = []
    if (item.toolingRate) rates.push(`Alat ${formatIdr(item.toolingRate)}/cm²`)
    if (item.laborRate) rates.push(`Tenaga ${item.laborRate}/cm²`)
    if (item.minimumType === 'numeric') rates.push(`Min. ${formatIdr(item.minimumCharge)}`)
    return rates.join(' · ') || 'Sesuai permintaan'
  }

  if (item.categoryLayer === 'manpower') return `${formatIdr(item.dailyRate)}/hari`
  if (item.additionalMode === 'manual') return 'Nominal saat estimasi'
  if (item.additionalMode === 'percent') return `${item.rate}% dari biaya produksi`
  return `${formatIdr(item.rate)}/${item.unitLabel || 'satuan'}`
}

export function MasterDataView({
  auditEntries,
  categories,
  loading,
  onDeactivateItem,
  onSaveItem,
  onSeedDefaults,
  priceItems,
}) {
  const [selectedLayer, setSelectedLayer] = useState(categories[0]?.layer ?? 'print')
  const [draft, setDraft] = useState(getEmptyPriceItemDraft(selectedLayer))
  const [formErrors, setFormErrors] = useState([])
  const selectedCategory = categories.find((category) => category.layer === selectedLayer)
  const fieldSchema = getCategoryFieldSchema(selectedCategory)
  const hasField = (field) => fieldSchema.includes(field)
  const visibleItems = useMemo(
    () => filterPriceItemsByLayer(priceItems, selectedLayer),
    [priceItems, selectedLayer],
  )

  function newDraft(layer = selectedLayer) {
    const category = categories.find((item) => item.layer === layer)
    setDraft({ ...getEmptyPriceItemDraft(layer), categoryId: category?.id ?? '' })
    setFormErrors([])
  }

  function selectLayer(layer) {
    setSelectedLayer(layer)
    newDraft(layer)
  }

  function editItem(item) {
    setSelectedLayer(item.categoryLayer)
    setDraft({ ...getEmptyPriceItemDraft(item.categoryLayer), ...item })
    setFormErrors([])
  }

  function updateDraft(path, value) {
    if (path.startsWith('prices.')) {
      const size = path.split('.')[1]
      setDraft((current) => ({
        ...current,
        prices: { ...current.prices, [size]: value },
      }))
      return
    }

    setDraft((current) => ({ ...current, [path]: value }))
  }

  function updateAdditionalMode(mode) {
    setDraft((current) => ({
      ...current,
      additionalMode: mode,
      rate: mode === 'manual' ? null : current.rate,
      unitLabel: mode === 'percent' ? '%' : current.unitLabel === '%' ? '' : current.unitLabel,
    }))
  }

  async function saveDraft() {
    const nextDraft = {
      ...draft,
      id: draft.id || createPriceItemId(selectedLayer),
      categoryId: draft.categoryId || selectedCategory?.id || '',
      categoryLayer: selectedLayer,
    }
    const errors = validatePriceItemDraft(nextDraft, fieldSchema)

    if (errors.length) {
      setFormErrors(errors)
      return
    }

    const saved = await onSaveItem(buildPriceItemPayload(nextDraft))
    if (saved !== false) newDraft()
  }

  const editingExistingItem = Boolean(draft.id)
  const saveLabel = editingExistingItem ? 'Simpan item' : 'Tambah item'
  const additionalMode = draft.additionalMode ?? 'manual'

  return (
    <div className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
      <section className="overflow-hidden rounded-4xl border border-white/80 bg-white shadow-xl shadow-slate-300/40">
        <div className="flex flex-col gap-4 border-b border-slate-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-50 text-blue-600">
              <Database size={22} />
            </span>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">Kontrol katalog</p>
              <h2 className="text-2xl font-black tracking-tight text-slate-950">Daftar Harga / Master Data</h2>
              <p className="mt-1 text-sm font-medium text-slate-500">Tambah satu item di sini, lalu langsung tersedia di estimasi.</p>
            </div>
          </div>
          {priceItems.length === 0 && !loading ? (
            <button
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-bold text-blue-700 transition hover:bg-blue-100"
              onClick={onSeedDefaults}
              type="button"
            >
              <UploadCloud size={17} />
              Isi data awal
            </button>
          ) : null}
        </div>

        <div className="border-b border-slate-100 bg-slate-50/70 px-6 py-4">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                aria-label={category.name}
                className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-2 text-sm font-bold transition ${
                  selectedLayer === category.layer
                    ? 'border-blue-200 bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                }`}
                key={category.id}
                onClick={() => selectLayer(category.layer)}
                type="button"
              >
                <Layers size={16} />
                {category.name}
                <span className={selectedLayer === category.layer ? 'text-blue-100' : 'text-slate-400'}>
                  {filterPriceItemsByLayer(priceItems, category.layer).length}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100 text-left text-sm">
            <thead className="bg-slate-50/80 text-slate-600">
              <tr>
                <th className="px-5 py-3 font-black">Item</th>
                <th className="px-5 py-3 font-black">Tarif</th>
                <th className="px-5 py-3 font-black">Waktu</th>
                <th className="px-5 py-3 font-black">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {loading ? <TableSkeletonRows columns={4} /> : null}
              {!loading && visibleItems.length === 0 ? (
                <tr>
                  <td className="px-5 py-10 text-center text-sm font-medium text-slate-500" colSpan={4}>
                    Belum ada item. Isi formulir di samping untuk menambahkan data pertama.
                  </td>
                </tr>
              ) : null}
              {!loading ? visibleItems.map((item) => (
                <tr className="transition hover:bg-blue-50/30" key={item.id}>
                  <td className="px-5 py-4 font-bold text-slate-900">{item.name}</td>
                  <td className="px-5 py-4 text-slate-600">{formatRate(item)}</td>
                  <td className="px-5 py-4 text-slate-600">{item.turnaroundDays ?? 0} hari</td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-2">
                      <button
                        aria-label={`Edit ${item.name}`}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                        onClick={() => editItem(item)}
                        type="button"
                      >
                        <Edit3 size={14} /> Edit
                      </button>
                      <button
                        aria-label={`Nonaktifkan ${item.name}`}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 px-3 py-1.5 text-xs font-bold text-rose-700 transition hover:border-rose-300 hover:bg-rose-50"
                        onClick={() => onDeactivateItem(item)}
                        type="button"
                      >
                        <Trash2 size={14} /> Nonaktifkan
                      </button>
                    </div>
                  </td>
                </tr>
              )) : null}
            </tbody>
          </table>
        </div>
      </section>

      <aside className="space-y-6">
        <section className="rounded-4xl border border-white/80 bg-white p-6 shadow-xl shadow-slate-300/40">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-blue-50 text-blue-600">
                {editingExistingItem ? <Edit3 size={20} /> : <Plus size={20} />}
              </span>
              <div>
                <h3 className="text-lg font-black tracking-tight text-slate-950">{editingExistingItem ? 'Edit item' : 'Tambah item'}</h3>
                <p className="mt-1 text-sm font-medium text-slate-500">Field menyesuaikan {selectedCategory?.name ?? selectedLayer}.</p>
              </div>
            </div>
            {editingExistingItem ? (
              <button className="text-xs font-bold text-blue-700 hover:text-blue-900" onClick={() => newDraft()} type="button">
                Item baru
              </button>
            ) : null}
          </div>

          <div className="mt-5 space-y-4">
            <Field label="Nama item">
              <TextInput onChange={(event) => updateDraft('name', event.target.value)} placeholder="mis. UV Varnish Matte" value={draft.name} />
            </Field>

            {hasField('prices') ? (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Harga A3">
                    <TextInput {...numberInputProps()} onChange={(event) => updateDraft('prices.A3', event.target.value)} value={draft.prices?.A3 ?? ''} />
                  </Field>
                  <Field label="Harga B2">
                    <TextInput {...numberInputProps()} disabled={draft.a3Only} onChange={(event) => updateDraft('prices.B2', event.target.value)} value={draft.a3Only ? '' : draft.prices?.B2 ?? ''} />
                  </Field>
                </div>
                {hasField('a3Only') ? (
                  <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700">
                    <input checked={Boolean(draft.a3Only)} onChange={(event) => updateDraft('a3Only', event.target.checked)} type="checkbox" />
                    Item hanya tersedia untuk ukuran A3
                  </label>
                ) : null}
              </>
            ) : null}

            {hasField('toolingRate') ? (
              <Field label="Tarif alat per cm² (opsional)">
                <TextInput {...numberInputProps()} onChange={(event) => updateDraft('toolingRate', event.target.value)} value={draft.toolingRate ?? ''} />
              </Field>
            ) : null}

            {hasField('laborRate') ? (
              <Field label="Tarif tenaga kerja per cm²">
                <TextInput {...numberInputProps()} onChange={(event) => updateDraft('laborRate', event.target.value)} value={draft.laborRate ?? ''} />
              </Field>
            ) : null}

            {hasField('minimumType') ? (
              <Field label="Aturan biaya minimum">
                <SelectInput onChange={(event) => updateDraft('minimumType', event.target.value)} value={draft.minimumType ?? 'numeric'}>
                  <option value="numeric">Gunakan biaya minimum</option>
                  <option value="byRequest">Tanpa biaya minimum</option>
                </SelectInput>
              </Field>
            ) : null}

            {hasField('minimumCharge') && draft.minimumType !== 'byRequest' ? (
              <Field label="Biaya minimum tenaga kerja">
                <TextInput {...numberInputProps()} onChange={(event) => updateDraft('minimumCharge', event.target.value)} value={draft.minimumCharge ?? ''} />
              </Field>
            ) : null}

            {hasField('dailyRate') ? (
              <Field label="Tarif harian">
                <TextInput {...numberInputProps()} onChange={(event) => updateDraft('dailyRate', event.target.value)} value={draft.dailyRate ?? ''} />
              </Field>
            ) : null}

            {hasField('additionalMode') ? (
              <Field label="Mode perhitungan">
                <SelectInput onChange={(event) => updateAdditionalMode(event.target.value)} value={additionalMode}>
                  <option value="manual">Nominal manual</option>
                  <option value="rate">Jumlah × tarif</option>
                  <option value="area">Panjang × lebar × tarif</option>
                  <option value="percent">Persentase biaya produksi</option>
                </SelectInput>
              </Field>
            ) : null}

            {hasField('rate') && additionalMode !== 'manual' ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label={additionalMode === 'percent' ? 'Persentase (%)' : 'Tarif'}>
                  <TextInput {...numberInputProps()} onChange={(event) => updateDraft('rate', event.target.value)} value={draft.rate ?? ''} />
                </Field>
                {additionalMode !== 'percent' ? (
                  <Field label="Label satuan">
                    <TextInput onChange={(event) => updateDraft('unitLabel', event.target.value)} placeholder={additionalMode === 'area' ? 'cm²' : 'lembar'} value={draft.unitLabel ?? ''} />
                  </Field>
                ) : null}
              </div>
            ) : null}

            {hasField('turnaroundDays') ? (
              <Field label="Waktu pengerjaan (hari)">
                <TextInput {...numberInputProps()} onChange={(event) => updateDraft('turnaroundDays', event.target.value)} value={draft.turnaroundDays ?? ''} />
              </Field>
            ) : null}

            {formErrors.length ? (
              <ul className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-700">
                {formErrors.map((error) => <li key={error}>{error}</li>)}
              </ul>
            ) : null}

            <button
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-slate-950/20 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
              disabled={loading}
              onClick={saveDraft}
              type="button"
            >
              <Save size={17} /> {saveLabel}
            </button>
          </div>
        </section>

        <section className="rounded-4xl border border-white/80 bg-white p-6 shadow-xl shadow-slate-300/40">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-slate-100 text-slate-700"><History size={20} /></span>
            <h3 className="text-lg font-black tracking-tight text-slate-950">Audit terbaru</h3>
          </div>
          {auditEntries.length ? (
            <ul className="mt-5 space-y-3 text-sm text-slate-600">
              {auditEntries.map((entry) => (
                <li className="flex gap-3 rounded-2xl bg-slate-50 p-3" key={entry.id ?? `${entry.itemId}-${entry.action}`}>
                  <Clock className="mt-0.5 shrink-0 text-slate-400" size={16} />
                  <span>{summarizeAuditEntry(entry)}</span>
                </li>
              ))}
            </ul>
          ) : <p className="mt-5 text-sm font-medium text-slate-500">Belum ada perubahan katalog.</p>}
        </section>
      </aside>
    </div>
  )
}
