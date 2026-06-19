import { Clock, Database, Edit3, History, Layers, Save, Trash2, UploadCloud } from 'lucide-react'
import { useMemo, useState } from 'react'
import { buildPriceItemPayload, filterPriceItemsByLayer, getEmptyPriceItemDraft, summarizeAuditEntry } from './masterDataModel'

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
  const selectedCategory = categories.find((category) => category.layer === selectedLayer)
  const visibleItems = useMemo(
    () => filterPriceItemsByLayer(priceItems, selectedLayer),
    [priceItems, selectedLayer],
  )

  function selectLayer(layer) {
    setSelectedLayer(layer)
    const category = categories.find((item) => item.layer === layer)
    setDraft({ ...getEmptyPriceItemDraft(layer), categoryId: category?.id ?? '' })
  }

  function editItem(item) {
    setDraft({ ...getEmptyPriceItemDraft(item.categoryLayer), ...item })
  }

  function updateDraft(path, value) {
    if (path.startsWith('prices.')) {
      const size = path.split('.')[1]
      setDraft((current) => ({ ...current, prices: { ...current.prices, [size]: value } }))
      return
    }

    setDraft((current) => ({ ...current, [path]: value }))
  }

  function saveDraft() {
    onSaveItem(
      buildPriceItemPayload({
        ...draft,
        id: draft.id || `${selectedLayer}-${Date.now()}`,
        categoryId: draft.categoryId || selectedCategory?.id,
        categoryLayer: selectedLayer,
      }),
    )
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
      <section className="overflow-hidden rounded-4xl border border-white/80 bg-white shadow-xl shadow-slate-300/40">
        <div className="flex flex-col gap-4 border-b border-slate-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-50 text-blue-600">
              <Database size={22} />
            </span>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">Catalog control</p>
              <h2 className="text-2xl font-black tracking-tight text-slate-950">Price List / Master Data</h2>
              <p className="mt-1 text-sm font-medium text-slate-500">Manage catalog rows used by estimation dropdowns.</p>
            </div>
          </div>
          <button
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-700 disabled:bg-slate-300 disabled:shadow-none"
            disabled={loading}
            onClick={onSeedDefaults}
            type="button"
          >
            <UploadCloud size={17} />
            Seed default catalog
          </button>
        </div>

        <div className="border-b border-slate-100 bg-slate-50/70 px-6 py-4">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
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
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100 text-left text-sm">
            <thead className="bg-slate-50/80 text-slate-600">
              <tr>
                <th className="px-5 py-3 font-black">Item</th>
                <th className="px-5 py-3 font-black">A3</th>
                <th className="px-5 py-3 font-black">B2</th>
                <th className="px-5 py-3 font-black">Time</th>
                <th className="px-5 py-3 font-black">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {visibleItems.map((item) => (
                <tr className="transition hover:bg-blue-50/30" key={item.id}>
                  <td className="px-5 py-4 font-bold text-slate-900">{item.name}</td>
                  <td className="px-5 py-4 text-slate-600">{item.prices?.A3 ?? '-'}</td>
                  <td className="px-5 py-4 text-slate-600">{item.prices?.B2 ?? '-'}</td>
                  <td className="px-5 py-4 text-slate-600">{item.turnaroundDays ?? 0} days</td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-2">
                      <button
                        aria-label={`Edit ${item.name}`}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                        onClick={() => editItem(item)}
                        type="button"
                      >
                        <Edit3 size={14} />
                        Edit
                      </button>
                      <button
                        aria-label={`Deactivate ${item.name}`}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 px-3 py-1.5 text-xs font-bold text-rose-700 transition hover:border-rose-300 hover:bg-rose-50"
                        onClick={() => onDeactivateItem(item)}
                        type="button"
                      >
                        <Trash2 size={14} />
                        Deactivate
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <aside className="space-y-6">
        <section className="rounded-4xl border border-white/80 bg-white p-6 shadow-xl shadow-slate-300/40">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-blue-50 text-blue-600">
              <Edit3 size={20} />
            </span>
            <h3 className="text-lg font-black tracking-tight text-slate-950">Edit item</h3>
          </div>
          <div className="mt-5 space-y-4">
            <Field label="Item name">
              <TextInput onChange={(event) => updateDraft('name', event.target.value)} value={draft.name} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="A3 price">
                <TextInput onChange={(event) => updateDraft('prices.A3', event.target.value)} value={draft.prices?.A3 ?? ''} />
              </Field>
              <Field label="B2 price">
                <TextInput onChange={(event) => updateDraft('prices.B2', event.target.value)} value={draft.prices?.B2 ?? ''} />
              </Field>
            </div>
            <Field label="Turnaround days">
              <TextInput onChange={(event) => updateDraft('turnaroundDays', event.target.value)} value={draft.turnaroundDays ?? ''} />
            </Field>
            <button
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-slate-950/20 transition hover:bg-slate-800"
              onClick={saveDraft}
              type="button"
            >
              <Save size={17} />
              Save item
            </button>
          </div>
        </section>

        <section className="rounded-4xl border border-white/80 bg-white p-6 shadow-xl shadow-slate-300/40">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-slate-100 text-slate-700">
              <History size={20} />
            </span>
            <h3 className="text-lg font-black tracking-tight text-slate-950">Recent audit</h3>
          </div>
          <ul className="mt-5 space-y-3 text-sm text-slate-600">
            {auditEntries.map((entry) => (
              <li className="flex gap-3 rounded-2xl bg-slate-50 p-3" key={entry.id ?? `${entry.itemId}-${entry.action}`}>
                <Clock className="mt-0.5 shrink-0 text-slate-400" size={16} />
                <span>{summarizeAuditEntry(entry)}</span>
              </li>
            ))}
          </ul>
        </section>
      </aside>
    </div>
  )
}
