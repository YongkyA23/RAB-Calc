import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { PriceEstimationContainer } from './PriceEstimationContainer'

vi.mock('../../firebase/firestoreHelpers', () => ({
  listActivePriceItems: vi.fn(),
  listEstimates: vi.fn(),
  saveEstimate: vi.fn(),
}))

vi.mock('../../firebase/app', () => ({ db: {} }))
vi.mock('firebase/firestore', () => ({
  deleteDoc: vi.fn(),
  doc: vi.fn(),
}))

const { listActivePriceItems, listEstimates } = await import('../../firebase/firestoreHelpers')

const priceItems = [
  { id: 'print-duplex', categoryLayer: 'print', name: 'Duplex', prices: { A3: 30000 }, turnaroundDays: 1 },
]

const estimate = {
  id: 'estimate-123',
  status: 'draft',
  jobNo: 'JOB-123',
  sku: 'SKU-123',
  client: 'PT Client',
  project: 'Box',
  totals: { print: 30000, digital: 0, manual: 0, manpower: 0, additional: 0 },
  grandTotal: 30000,
  turnaroundDays: 1,
  lineItems: [],
  draft: {
    header: { jobNo: 'JOB-123', sku: 'SKU-123', client: 'PT Client', project: 'Box' },
    print: [{ itemId: 'print-duplex', size: 'A3', qty: 1 }],
    digital: [],
    manual: [],
    manpower: [],
    additional: [],
  },
}

function renderRoute(path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route element={<PriceEstimationContainer profile={{ uid: 'u1', name: 'Admin', email: 'admin@example.com' }} />} path="/estimates/:estimateId/edit" />
      </Routes>
    </MemoryRouter>,
  )
}

describe('PriceEstimationContainer routing', () => {
  beforeEach(() => {
    listActivePriceItems.mockResolvedValue(priceItems)
    listEstimates.mockResolvedValue([estimate])
  })

  it('loads an estimate draft when refreshing an edit route', async () => {
    renderRoute('/estimates/estimate-123/edit')

    await waitFor(() => expect(screen.getByLabelText('No Job')).toHaveValue('JOB-123'))
    expect(screen.getByLabelText('SKU')).toHaveValue('SKU-123')
    expect(screen.getByLabelText('Client')).toHaveValue('PT Client')
    expect(screen.getByLabelText('Project')).toHaveValue('Box')
    expect(screen.getByLabelText('Material')).toHaveValue('print-duplex')
  })
})
