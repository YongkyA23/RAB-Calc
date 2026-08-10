import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ToastProvider } from '../../components/ui/Toast'
import { PriceEstimationContainer } from './PriceEstimationContainer'

vi.mock('../../firebase/firestoreHelpers', () => ({
  listActivePriceItems: vi.fn(),
  listActualCosts: vi.fn(),
  listEstimates: vi.fn(),
  saveActualCost: vi.fn(),
  saveEstimate: vi.fn(),
}))

vi.mock('../../firebase/app', () => ({ db: {} }))
vi.mock('firebase/firestore', () => ({
  deleteDoc: vi.fn(),
  doc: vi.fn(),
}))

const { listActivePriceItems, listActualCosts, listEstimates, saveActualCost } = await import('../../firebase/firestoreHelpers')

const priceItems = [
  { id: 'print-duplex', categoryLayer: 'print', name: 'Duplex', prices: { A3: 30000 }, turnaroundDays: 1 },
]

const estimate = {
  id: 'estimate-123',
  status: 'created',
  jobNo: 'JOB-123',
  sku: 'SKU-123',
  client: 'PT Client',
  project: 'Box',
  totals: { print: 30000, digital: 0, manual: 0, manpower: 0, additional: 0 },
  grandTotal: 30000,
  turnaroundDays: 1,
  lineItems: [{ id: 'line-1', layer: 'print', inputs: { itemId: 'print-duplex', size: 'A3', qty: 1 }, priceSnapshot: { name: 'Duplex', prices: { A3: 30000 } }, computedTotal: 30000 }],
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
    <ToastProvider>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route element={<PriceEstimationContainer profile={{ uid: 'u1', name: 'Admin', email: 'admin@example.com' }} />} path="/estimates" />
          <Route element={<PriceEstimationContainer profile={{ uid: 'u1', name: 'Admin', email: 'admin@example.com' }} />} path="/estimates/new" />
          <Route element={<PriceEstimationContainer profile={{ uid: 'u1', name: 'Admin', email: 'admin@example.com' }} />} path="/estimates/:estimateId" />
          <Route element={<PriceEstimationContainer profile={{ uid: 'u1', name: 'Admin', email: 'admin@example.com' }} />} path="/estimates/:estimateId/edit" />
        </Routes>
      </MemoryRouter>
    </ToastProvider>,
  )
}

describe('PriceEstimationContainer routing', () => {
  beforeEach(() => {
    listActivePriceItems.mockResolvedValue(priceItems)
    listActualCosts.mockResolvedValue([])
    listEstimates.mockResolvedValue([estimate])
    saveActualCost.mockImplementation(async (payload) => payload)
  })

  it('loads an estimate draft when refreshing an edit route', async () => {
    renderRoute('/estimates/estimate-123/edit')

    await waitFor(() => expect(screen.getByLabelText('No Job')).toHaveValue('JOB-123'))
    expect(screen.getByLabelText('SKU')).toHaveValue('SKU-123')
    expect(screen.getByLabelText('Klien')).toHaveValue('PT Client')
    expect(screen.getByLabelText('Proyek')).toHaveValue('Box')
    expect(screen.getByLabelText('Material')).toHaveValue('print-duplex')
  })

  it('starts a new RAB with No Job and client inherited from its group', async () => {
    renderRoute('/estimates')

    fireEvent.click(await screen.findByRole('button', { name: 'Tambah RAB' }))

    await waitFor(() => expect(screen.getByLabelText('No Job')).toHaveValue('JOB-123'))
    expect(screen.getByLabelText('Klien')).toHaveValue('PT Client')
    expect(screen.getByLabelText('SKU')).toHaveValue('')
    expect(screen.getByLabelText('Proyek')).toHaveValue('')
  })

  it('saves actual cost from the RAB detail page', async () => {
    renderRoute('/estimates/estimate-123')

    fireEvent.change(await screen.findByLabelText('Total aktual Duplex'), { target: { value: '28000' } })
    fireEvent.click(screen.getByRole('button', { name: 'Simpan draft aktual' }))

    await waitFor(() => expect(saveActualCost).toHaveBeenCalledWith(expect.objectContaining({
      estimateId: 'estimate-123',
      baselineTotal: 30000,
      actualTotal: 28000,
      variance: -2000,
    })))
  })
})
