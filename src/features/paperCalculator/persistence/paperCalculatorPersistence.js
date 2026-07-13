import { createPaperCalculatorWorkspace } from '../paperCalculatorDefaults'

export const PAPER_CALCULATOR_MODULES = new Set(['layout', 'book', 'plano', 'time'])
export const CUSTOM_SIZE_TYPES = new Set(['paper', 'book', 'plano'])

export function createCalculatorId(prefix = 'paper') {
  const random = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`
  return `${prefix}-${random}`
}

export function hydratePaperWorkspace(document) {
  const defaults = createPaperCalculatorWorkspace()
  if (!document || document.schemaVersion !== 1) return defaults
  const activeTab = PAPER_CALCULATOR_MODULES.has(document.activeTab) ? document.activeTab : defaults.activeTab
  const drafts = document.drafts ?? {}
  return {
    activeTab,
    drafts: {
      layout: { ...defaults.drafts.layout, ...(drafts.layout ?? {}) },
      book: { ...defaults.drafts.book, ...(drafts.book ?? {}) },
      plano: { ...defaults.drafts.plano, ...(drafts.plano ?? {}) },
      time: {
        ...defaults.drafts.time,
        ...(drafts.time ?? {}),
        jobs: { ...defaults.drafts.time.jobs, ...(drafts.time?.jobs ?? {}) },
        finishing: { ...defaults.drafts.time.finishing, ...(drafts.time?.finishing ?? {}) },
      },
    },
  }
}

export function validateCustomSize({ type, label, width, height }) {
  const errors = []
  if (!CUSTOM_SIZE_TYPES.has(type)) errors.push('Jenis ukuran tidak valid.')
  if (!String(label ?? '').trim()) errors.push('Nama ukuran wajib diisi.')
  if (!(Number(width) > 0) || !(Number(height) > 0)) errors.push('Lebar dan tinggi harus lebih dari 0.')
  return errors
}

export function hasDuplicateCustomSize(sizes, candidate) {
  const width = Number(candidate.width)
  const height = Number(candidate.height)
  return sizes.some((size) => size.type === candidate.type && Number(size.width) === width && Number(size.height) === height)
}

export function canDeletePaperRecord(record, profile) {
  return profile?.role === 'Admin' || record?.createdBy === profile?.uid
}

export function defaultCalculationTitle(module, result) {
  const data = result?.data ?? {}
  if (module === 'layout') return `Layout ${data.paperWidth ?? '—'}×${data.paperHeight ?? '—'} · ${data.requiredQty ?? 'tanpa qty'} pcs`
  if (module === 'book') return `Buku ${data.bookWidth ?? '—'}×${data.bookHeight ?? '—'} · ${data.copies ?? '—'} eks`
  if (module === 'plano') return `Plano ${data.planoWidth ?? '—'}×${data.planoHeight ?? '—'} · ${data.cutWidth ?? '—'}×${data.cutHeight ?? '—'}`
  return `Estimasi waktu · ${data.activeCount ?? 0} pekerjaan`
}

