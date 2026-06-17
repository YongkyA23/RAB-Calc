export const DEFAULT_CATEGORIES = [
  {
    id: 'print-materials',
    name: 'Print Materials',
    layer: 'print',
    fieldSchema: ['name', 'prices', 'turnaroundDays', 'a3Only'],
  },
  {
    id: 'digital-finishing',
    name: 'Digital Finishing',
    layer: 'digital',
    fieldSchema: ['name', 'prices', 'turnaroundDays', 'a3Only'],
  },
  {
    id: 'manual-finishing',
    name: 'Manual Finishing',
    layer: 'manual',
    fieldSchema: ['name', 'toolingRate', 'laborRate', 'minimumType', 'minimumCharge', 'turnaroundDays'],
  },
  {
    id: 'manpower',
    name: 'Manpower',
    layer: 'manpower',
    fieldSchema: ['name', 'dailyRate', 'turnaroundDays'],
  },
  {
    id: 'additional-costs',
    name: 'Additional / Operational Costs',
    layer: 'additional',
    fieldSchema: ['name', 'additionalMode', 'rate', 'unitLabel', 'turnaroundDays'],
  },
]

const baseItem = {
  active: true,
  prices: {},
  toolingRate: null,
  laborRate: null,
  minimumCharge: null,
  minimumType: 'numeric',
  dailyRate: null,
  a3Only: false,
  additionalMode: null,
  unitLabel: null,
  rate: null,
}

function item(fields) {
  return { ...baseItem, ...fields }
}

export const DEFAULT_PRICE_ITEMS = [
  item({ id: 'print-pod', categoryId: 'print-materials', categoryLayer: 'print', name: 'POD', prices: { A3: 20000, B2: 30000 }, turnaroundDays: 1 }),
  item({ id: 'print-hvs', categoryId: 'print-materials', categoryLayer: 'print', name: 'HVS 80–100 gsm', prices: { A3: 20000, B2: 30000 }, turnaroundDays: 1 }),
  item({ id: 'print-art-paper', categoryId: 'print-materials', categoryLayer: 'print', name: 'Art Paper / Matte 120–150 gsm', prices: { A3: 20000, B2: 30000 }, turnaroundDays: 1 }),
  item({ id: 'print-art-carton', categoryId: 'print-materials', categoryLayer: 'print', name: 'Art Carton 210–260 gsm', prices: { A3: 25000, B2: 35000 }, turnaroundDays: 1 }),
  item({ id: 'print-duplex', categoryId: 'print-materials', categoryLayer: 'print', name: 'Duplex 270–350 gsm', prices: { A3: 30000, B2: 40000 }, turnaroundDays: 1 }),
  item({ id: 'print-stiker-vinyl', categoryId: 'print-materials', categoryLayer: 'print', name: 'Stiker Vinyl', prices: { A3: 25000, B2: null }, turnaroundDays: 2, a3Only: true }),
  item({ id: 'print-stiker-transparant', categoryId: 'print-materials', categoryLayer: 'print', name: 'Stiker Transparant + White Ink', prices: { A3: 35000, B2: null }, turnaroundDays: 2, a3Only: true }),
  item({ id: 'print-stiker-metalized', categoryId: 'print-materials', categoryLayer: 'print', name: 'Stiker Metalized + White Ink', prices: { A3: 40000, B2: null }, turnaroundDays: 2, a3Only: true }),

  item({ id: 'digital-spot-uv', categoryId: 'digital-finishing', categoryLayer: 'digital', name: 'Spot UV Digital', prices: { A3: 20000, B2: null }, turnaroundDays: 2, a3Only: true }),
  item({ id: 'digital-foil-standard', categoryId: 'digital-finishing', categoryLayer: 'digital', name: 'Foil Hot Stamp (standard color)', prices: { A3: 20000, B2: null }, turnaroundDays: 2, a3Only: true }),
  item({ id: 'digital-emboss', categoryId: 'digital-finishing', categoryLayer: 'digital', name: 'Emboss Digital', prices: { A3: 20000, B2: null }, turnaroundDays: 2, a3Only: true }),
  item({ id: 'digital-cutting', categoryId: 'digital-finishing', categoryLayer: 'digital', name: 'Cutting Otomatis (Zund, Graphtec)', prices: { A3: 15000, B2: null }, turnaroundDays: 2, a3Only: true }),
  item({ id: 'digital-foil-rainbow', categoryId: 'digital-finishing', categoryLayer: 'digital', name: 'Foil Hot Stamp Effect Rainbow', prices: { A3: 30000, B2: null }, turnaroundDays: 2, a3Only: true }),
  item({ id: 'digital-laminating', categoryId: 'digital-finishing', categoryLayer: 'digital', name: 'Laminating Glossy/Matte', prices: { A3: 10000, B2: 15000 }, turnaroundDays: 1 }),

  item({ id: 'manual-spot-uv', categoryId: 'manual-finishing', categoryLayer: 'manual', name: 'Spot UV', laborRate: 0.75, minimumCharge: 650000, minimumType: 'numeric', turnaroundDays: 2 }),
  item({ id: 'manual-uv-glossy', categoryId: 'manual-finishing', categoryLayer: 'manual', name: 'UV Varnish Glossy', laborRate: 0.75, minimumCharge: 600000, minimumType: 'numeric', turnaroundDays: 2 }),
  item({ id: 'manual-uv-matte', categoryId: 'manual-finishing', categoryLayer: 'manual', name: 'UV Varnish Matte', laborRate: 0.75, minimumType: 'byRequest', turnaroundDays: 2 }),
  item({ id: 'manual-varnish-effect', categoryId: 'manual-finishing', categoryLayer: 'manual', name: 'Spot UV / Varnish Effect', laborRate: 0.75, minimumType: 'byRequest', turnaroundDays: 2 }),
  item({ id: 'manual-emboss', categoryId: 'manual-finishing', categoryLayer: 'manual', name: 'Emboss', toolingRate: 2500, laborRate: 25, minimumCharge: 250000, minimumType: 'numeric', turnaroundDays: 3 }),
  item({ id: 'manual-die-cut', categoryId: 'manual-finishing', categoryLayer: 'manual', name: 'Die Cut Manual', toolingRate: 3500, laborRate: 15, minimumCharge: 250000, minimumType: 'numeric', turnaroundDays: 3 }),

  item({ id: 'manpower-default', categoryId: 'manpower', categoryLayer: 'manpower', name: 'Default Manpower', dailyRate: 275000, turnaroundDays: 0 }),

  item({ id: 'additional-rush', categoryId: 'additional-costs', categoryLayer: 'additional', name: 'Rush Job', additionalMode: 'manual', turnaroundDays: 0 }),
  item({ id: 'additional-overtime', categoryId: 'additional-costs', categoryLayer: 'additional', name: 'Over Time', additionalMode: 'manual', turnaroundDays: 0 }),
  item({ id: 'additional-in-house', categoryId: 'additional-costs', categoryLayer: 'additional', name: 'In-house Finishing', additionalMode: 'manual', turnaroundDays: 0 }),
  item({ id: 'additional-metalize', categoryId: 'additional-costs', categoryLayer: 'additional', name: 'Metalize Material', additionalMode: 'rate', rate: 5, unitLabel: 'cm', turnaroundDays: 0 }),
  item({ id: 'additional-paper', categoryId: 'additional-costs', categoryLayer: 'additional', name: 'Paper Purchase', additionalMode: 'rate', rate: 5000, unitLabel: 'sheet', turnaroundDays: 0 }),
  item({ id: 'additional-product', categoryId: 'additional-costs', categoryLayer: 'additional', name: 'Product Purchase', additionalMode: 'manual', turnaroundDays: 0 }),
  item({ id: 'additional-operator', categoryId: 'additional-costs', categoryLayer: 'additional', name: 'Operator Fee', additionalMode: 'manual', turnaroundDays: 0 }),
  item({ id: 'additional-mockup', categoryId: 'additional-costs', categoryLayer: 'additional', name: 'Mockup Operations', additionalMode: 'manual', turnaroundDays: 0 }),
]

export function getDefaultCatalogCounts() {
  return {
    categories: DEFAULT_CATEGORIES.length,
    priceItems: DEFAULT_PRICE_ITEMS.length,
  }
}
