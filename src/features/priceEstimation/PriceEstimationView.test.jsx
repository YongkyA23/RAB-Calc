import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { PriceEstimationView } from './PriceEstimationView'

const estimates = [
  { id: 'e1', status: 'draft', date: '2026-06-17T10:00:00.000Z', jobNo: '', sku: 'SKU-A', client: 'PT Alpha', project: 'Carton', createdByName: 'Admin', totals: { print: 0, digital: 0, manual: 0, manpower: 0, additional: 0 }, grandTotal: 0, turnaroundDays: 0, lineItems: [] },
  { id: 'e2', status: 'created', date: '2026-06-18T10:00:00.000Z', jobNo: 'JOB-002', sku: 'SKU-B', client: 'PT Beta', project: 'Label', createdByName: 'Estimator', totals: { print: 2000, digital: 0, manual: 0, manpower: 0, additional: 0 }, grandTotal: 2000, turnaroundDays: 2, lineItems: [] },
]

describe('PriceEstimationView', () => {
  it('renders table and delete button for drafts', () => {
    const onDeleteEstimate = vi.fn()
    render(<PriceEstimationView estimates={estimates} loading={false} onCreateNew={vi.fn()} onDuplicateEstimate={vi.fn()} onEditDraft={vi.fn()} onExportCsv={vi.fn()} onDeleteEstimate={onDeleteEstimate} />)

    expect(screen.getByRole('button', { name: /Delete/i })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /Delete/i }))
    expect(onDeleteEstimate).toHaveBeenCalledWith(estimates[0])
  })

  it('confirms before deleting created estimate', () => {
    const onDeleteEstimate = vi.fn()
    render(<PriceEstimationView estimates={[estimates[1]]} loading={false} onCreateNew={vi.fn()} onDuplicateEstimate={vi.fn()} onEditDraft={vi.fn()} onExportCsv={vi.fn()} onDeleteEstimate={onDeleteEstimate} />)

    expect(screen.getByRole('button', { name: /Delete/i })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /Delete/i }))

    expect(screen.getByText('Confirm deletion')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Delete permanently' }))

    expect(onDeleteEstimate).toHaveBeenCalledWith(estimates[1])
  })
})
