import { useMemo, useState } from 'react'
import { buildPriceItemPayload, filterPriceItemsByLayer, getEmptyPriceItemDraft, summarizeAuditEntry } from './masterDataModel'

function Field({ children, label }) {
  return (
    <label className="block text-sm font-semibold text-slate-700">
      <span>{label}</span>
      {children}
    </label>
  )
}

function TextInput(props) {
  return (
    <input
      className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
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
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-950">Price List / Master Data</h2>
            <p className="mt-2 text-sm text-slate-600">Manage catalog rows used by estimation dropdowns.</p>
          </div>
          <button
            className="rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:bg-slate-300"
            disabled={loading}
            onClick={onSeedDefaults}
            type="button"
          >
            Seed default catalog
          </button>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              className={`rounded-lg border px-4 py-2 text-sm font-semibold ${
                selectedLayer === category.layer
                  ? 'border-blue-300 bg-blue-50 text-blue-800'
                  : 'border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
              key={category.id}
              onClick={() => selectLayer(category.layer)}
              type="button"
            >
              {category.name}
            </button>
          ))}
        </div>

        <div className="mt-6 overflow-hidden rounded-lg border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 font-semibold">Item</th>
                <th className="px-4 py-3 font-semibold">A3</th>
                <th className="px-4 py-3 font-semibold">B2</th>
                <th className="px-4 py-3 font-semibold">Time</th>
                <th className="px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {visibleItems.map((item) => (
                <tr key={item.id}>
                  <td className="px-4 py-3 font-semibold text-slate-900">{item.name}</td>
                  <td className="px-4 py-3 text-slate-600">{item.prices?.A3 ?? '-'}</td>
                  <td className="px-4 py-3 text-slate-600">{item.prices?.B2 ?? '-'}</td>
                  <td className="px-4 py-3 text-slate-600">{item.turnaroundDays ?? 0} days</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        aria-label={`Edit ${item.name}`}
                        className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        onClick={() => editItem(item)}
                        type="button"
                      >
                        Edit
                      </button>
                      <button
                        aria-label={`Deactivate ${item.name}`}
                        className="rounded-xl border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50"
                        onClick={() => onDeactivateItem(item)}
                        type="button"
                      >
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
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-950">Edit item</h3>
          <div className="mt-4 space-y-4">
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
              className="w-full rounded-lg bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              onClick={saveDraft}
              type="button"
            >
              Save item
            </button>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-950">Recent audit</h3>
          <ul className="mt-4 space-y-3 text-sm text-slate-600">
            {auditEntries.map((entry) => (
              <li className="rounded-lg bg-slate-50 p-3" key={entry.id ?? `${entry.itemId}-${entry.action}`}>
                {summarizeAuditEntry(entry)}
              </li>
            ))}
          </ul>
        </section>
      </aside>
    </div>
  )
}
