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
    expect(screen.getByRole('link', { name: 'Lihat JOB-002' })).toHaveAttribute('href', '/estimates/e2')
    expect(screen.getByRole('link', { name: 'Edit JOB-002' })).toHaveAttribute('href', '/estimates/e2/edit')
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

    fireEvent.click(screen.getByRole('link', { name: 'Lihat JOB-002' }))

    expect(onViewEstimate).toHaveBeenCalledWith(estimates[1])
  })

  it('edits, duplicates, and deletes created estimates', () => {
    const onEditDraft = vi.fn()
    const onDuplicateEstimate = vi.fn()
    const onDeleteEstimate = vi.fn()
    renderView({ onDeleteEstimate, onDuplicateEstimate, onEditDraft })

    fireEvent.click(screen.getByRole('link', { name: 'Edit JOB-002' }))
    expect(onEditDraft).toHaveBeenCalledWith(estimates[1])

    fireEvent.click(screen.getByRole('button', { name: 'Duplikat JOB-002' }))
    expect(onDuplicateEstimate).toHaveBeenCalledWith(estimates[1])

    fireEvent.click(screen.getByRole('button', { name: 'Hapus JOB-002' }))
    expect(screen.getByText('Konfirmasi penghapusan "JOB-002"')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Konfirmasi penghapusan' }))
    expect(onDeleteEstimate).toHaveBeenCalledWith(estimates[1])
  })
})
