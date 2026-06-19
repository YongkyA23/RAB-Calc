import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { PriceEstimationListView } from './PriceEstimationListView'

const estimates = [
  { id: 'e1', status: 'draft', date: '2026-06-17T10:00:00.000Z', jobNo: '', sku: 'SKU-A', client: 'PT Alpha', project: 'Carton', createdByName: 'Admin', totals: { print: 0, digital: 0, manual: 0, manpower: 0, additional: 0 }, grandTotal: 0, turnaroundDays: 0, lineItems: [] },
  { id: 'e2', status: 'created', date: '2026-06-18T10:00:00.000Z', jobNo: 'JOB-002', sku: 'SKU-B', client: 'PT Beta', project: 'Label', createdByName: 'Estimator', totals: { print: 2000, digital: 0, manual: 0, manpower: 0, additional: 0 }, grandTotal: 2000, turnaroundDays: 2, lineItems: [] },
]

function renderWithRouter(ui) {
  return render(<MemoryRouter initialEntries={['/estimates']}>{ui}</MemoryRouter>)
}

describe('PriceEstimationView', () => {
  it('confirms before deleting draft estimate', () => {
    const onDeleteEstimate = vi.fn()
    renderWithRouter(<PriceEstimationListView estimates={estimates} loading={false} onCreateNew={vi.fn()} onDuplicateEstimate={vi.fn()} onEditDraft={vi.fn()} onExportCsv={vi.fn()} onDeleteEstimate={onDeleteEstimate} />)

    fireEvent.click(screen.getByRole('button', { name: 'Delete SKU-A' }))
    expect(screen.getByText('Confirm deletion of "SKU-A"')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Confirm deletion' }))

    expect(onDeleteEstimate).toHaveBeenCalledWith(estimates[0])
  })

  it('confirms before deleting created estimate', () => {
    const onDeleteEstimate = vi.fn()
    renderWithRouter(<PriceEstimationListView estimates={[estimates[1]]} loading={false} onCreateNew={vi.fn()} onDuplicateEstimate={vi.fn()} onEditDraft={vi.fn()} onExportCsv={vi.fn()} onDeleteEstimate={onDeleteEstimate} />)

    fireEvent.click(screen.getByRole('button', { name: 'Delete JOB-002' }))
    expect(screen.getByText('Confirm deletion of "JOB-002"')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Confirm deletion' }))

    expect(onDeleteEstimate).toHaveBeenCalledWith(estimates[1])
  })

  it('shows skeleton rows in the table while estimates load', () => {
    renderWithRouter(<PriceEstimationListView estimates={estimates} loading={true} onCreateNew={vi.fn()} onDuplicateEstimate={vi.fn()} onEditDraft={vi.fn()} onExportCsv={vi.fn()} onDeleteEstimate={vi.fn()} />)

    expect(screen.getAllByTestId('table-skeleton-row').length).toBeGreaterThan(0)
    expect(screen.queryByText('JOB-002')).not.toBeInTheDocument()
  })
})
