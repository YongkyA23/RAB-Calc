import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { PriceEstimationListView } from './PriceEstimationListView'

const estimates = [
  { id: 'e1', status: 'draft', date: '2026-06-17T10:00:00.000Z', jobNo: '', sku: 'SKU-A', client: 'PT Alpha', project: 'Carton', createdByName: 'Admin', totals: { print: 0, digital: 0, manual: 0, manpower: 0, additional: 0 }, grandTotal: 0, turnaroundDays: 0, lineItems: [] },
  { id: 'e2', status: 'created', date: '2026-06-18T10:00:00.000Z', jobNo: 'JOB-002', sku: 'SKU-B', client: 'PT Beta', project: 'Label', createdByName: 'Estimator', totals: { print: 2000, digital: 0, manual: 0, manpower: 0, additional: 0 }, grandTotal: 2000, turnaroundDays: 2, lineItems: [{ id: 'l1', layer: 'print', inputs: { size: 'A3', qty: 2, notes: 'Sample note' }, priceSnapshot: { name: 'Art Carton' }, computedTotal: 2000 }] },
]

function renderView(overrides = {}) {
  return render(
    <MemoryRouter initialEntries={['/estimates']}>
      <PriceEstimationListView
        estimates={estimates}
        loading={false}
        onAddEstimateToJob={vi.fn()}
        onCreateNew={vi.fn()}
        onDeleteEstimate={vi.fn()}
        onDuplicateEstimate={vi.fn()}
        onEditDraft={vi.fn()}
        onExportCsv={vi.fn()}
        onViewEstimate={vi.fn()}
        {...overrides}
      />
    </MemoryRouter>,
  )
}

describe('PriceEstimationListView', () => {
  it('renders price estimation table statuses and create button full width', () => {
    renderView()

    expect(screen.getByRole('link', { name: 'Buat Baru' })).toBeInTheDocument()
    expect(screen.getAllByText('Draft').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Created').length).toBeGreaterThan(0)
    expect(screen.queryByText('Estimate detail')).not.toBeInTheDocument()
  })

  it('renders create, view, and edit actions as route links', () => {
    renderView()

    expect(screen.getByRole('link', { name: 'Buat Baru' })).toHaveAttribute('href', '/estimates/new')
    expect(screen.getByRole('link', { name: 'Lihat SKU-B pada JOB-002' })).toHaveAttribute('href', '/estimates/e2')
    expect(screen.getByRole('link', { name: 'Edit SKU-B pada JOB-002' })).toHaveAttribute('href', '/estimates/e2/edit')
  })

  it('calls create new handler', () => {
    const onCreateNew = vi.fn()
    renderView({ onCreateNew })

    fireEvent.click(screen.getByRole('link', { name: 'Buat Baru' }))

    expect(onCreateNew).toHaveBeenCalledOnce()
  })

  it('views estimates on a dedicated page callback', () => {
    const onViewEstimate = vi.fn()
    renderView({ onViewEstimate })

    fireEvent.click(screen.getByRole('link', { name: 'Lihat SKU-B pada JOB-002' }))

    expect(onViewEstimate).toHaveBeenCalledWith(estimates[1])
  })

  it('edits, duplicates, and deletes created estimates', () => {
    const onEditDraft = vi.fn()
    const onDuplicateEstimate = vi.fn()
    const onDeleteEstimate = vi.fn()
    renderView({ onDeleteEstimate, onDuplicateEstimate, onEditDraft })

    fireEvent.click(screen.getByRole('link', { name: 'Edit SKU-B pada JOB-002' }))
    expect(onEditDraft).toHaveBeenCalledWith(estimates[1])

    fireEvent.click(screen.getByRole('button', { name: 'Duplikat SKU-B pada JOB-002' }))
    expect(onDuplicateEstimate).toHaveBeenCalledWith(estimates[1])

    fireEvent.click(screen.getByRole('button', { name: 'Hapus SKU-B pada JOB-002' }))
    expect(screen.getByText('Konfirmasi penghapusan "JOB-002"')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Konfirmasi penghapusan' }))
    expect(onDeleteEstimate).toHaveBeenCalledWith(estimates[1])
  })

  it('groups RAB by No Job and starts another RAB in that group', () => {
    const onAddEstimateToJob = vi.fn()
    renderView({
      estimates: [
        estimates[1],
        { ...estimates[1], id: 'e3', sku: 'SKU-C', project: 'Brochure', grandTotal: 3000 },
      ],
      onAddEstimateToJob,
    })

    expect(screen.getByRole('heading', { name: 'JOB-002' })).toBeInTheDocument()
    expect(screen.getByText('2 RAB')).toBeInTheDocument()
    expect(screen.getByText('Rencana Rp 5.000')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Tambah RAB' }))
    expect(onAddEstimateToJob).toHaveBeenCalledWith(expect.objectContaining({
      jobNo: 'JOB-002',
      estimates: expect.arrayContaining([expect.objectContaining({ id: 'e2' }), expect.objectContaining({ id: 'e3' })]),
    }))
  })

  it('shows actual cost progress and variance for a completed No Job group', () => {
    renderView({
      estimates: [estimates[1]],
      actualCosts: [{ estimateId: 'e2', status: 'finalized', actualTotal: 2500 }],
    })

    expect(screen.getByText('Aktual tercatat Rp 2.500')).toBeInTheDocument()
    expect(screen.getByText('1/1 final')).toBeInTheDocument()
    expect(screen.getAllByText('+Rp 500').length).toBeGreaterThan(0)
    expect(screen.getByText('Aktual final')).toBeInTheDocument()
  })
})
