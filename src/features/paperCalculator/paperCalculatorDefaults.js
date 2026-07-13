export const PAPER_PRESETS = [
  { id: 'a3plus', label: 'A3+', width: '48', height: '32' },
  { id: 'a3', label: 'A3', width: '42', height: '29.7' },
  { id: 'a4', label: 'A4', width: '29.7', height: '21' },
  { id: 'a5', label: 'A5', width: '21', height: '14.8' },
]

export const BOOK_PRESETS = [
  { id: 'book-a5', label: 'A5', width: '14.8', height: '21' },
  { id: 'book-a4', label: 'A4', width: '21', height: '29.7' },
  { id: 'book-a6', label: 'A6', width: '10.5', height: '14.8' },
  { id: 'book-17x24', label: '17×24', width: '17', height: '24' },
]

export const PLANO_PRESETS = [
  { id: 'plano-65x100', label: '65×100', width: '65', height: '100' },
  { id: 'plano-79x109', label: '79×109', width: '79', height: '109' },
  { id: 'plano-61x86', label: '61×86', width: '61', height: '86' },
  { id: 'plano-72x102', label: '72×102', width: '72', height: '102' },
]

export function createLayoutDraft() {
  return {
    paperWidth: '48', paperHeight: '32', designWidth: '', designHeight: '', gap: '0',
    requiredQty: '', allowRotate: true, pricePerRim: '', sheetsPerRim: '500', wastePercent: '0',
  }
}

export function createBookDraft() {
  return {
    paperWidth: '48', paperHeight: '32', bookWidth: '14.8', bookHeight: '21', pages: '', copies: '',
    printMode: 'duplex', binding: 'perfect', coverType: 'soft', spineThickness: '0',
    contentPricePerRim: '', coverPricePerRim: '', sheetsPerRim: '500', wastePercent: '0',
  }
}

export function createPlanoDraft() {
  return { planoWidth: '65', planoHeight: '100', cutWidth: '', cutHeight: '', maximizeRemainder: false }
}

export function createTimeDraft() {
  const now = new Date()
  now.setSeconds(0, 0)
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
  return {
    startAt: local,
    jobs: {
      a3: { active: false, sheets: '', mode: 'duplex' },
      meter: { active: false, areaM2: '' },
      businessCards: { active: false, boxes: '' },
      saddle: { active: false, pages: '', copies: '', size: 'A5' },
      perfect: { active: false, pages: '', copies: '', size: 'A5' },
      hardCover: { active: false, pages: '', copies: '', size: 'A5' },
    },
    finishing: { laminate: false, secondRoll: false, standardCut: false, customCut: false, dieCut: false, kissCut: false },
  }
}

export function createPaperCalculatorWorkspace() {
  return {
    activeTab: 'layout',
    drafts: { layout: createLayoutDraft(), book: createBookDraft(), plano: createPlanoDraft(), time: createTimeDraft() },
  }
}

