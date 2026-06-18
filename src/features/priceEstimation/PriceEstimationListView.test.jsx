import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { PriceEstimationListView } from './PriceEstimationListView'

const estimates = [
  { id: 'e1', status: 'draft', date: '2026-06-17T10:00:00.000Z', jobNo: '', sku: 'SKU-A', client: 'PT Alpha', project: 'Carton', createdByName: 'Admin', totals: { print: 0, digital: 0, manual: 0, manpower: 0, additional: 0 }, grandTotal: 0, turnaroundDays: 0, lineItems: [] },
  { id: 'e2', status: 'created', date: '2026-06-18T10:00:00.000Z', jobNo: 'JOB-002', sku: 'SKU-B', client: 'PT Beta', project: 'Label', createdByName: 'Estimator', totals: { print: 2000, digital: 0, manual: 0, manpower: 0, additional: 0 }, grandTotal: 2000, turnaroundDays: 2, lineItems: [] },
]

describe('PriceEstimationListView', () => {
  it('renders price estimation table statuses and create button', () => {
    render(<PriceEstimationListView estimates={estimates} loading={false} onCreateNew={vi.fn()} onDuplicateEstimate={vi.fn()} onEditDraft={vi.fn()} onExportCsv={vi.fn()} />)

    expect(screen.getByRole('button', { name: 'Create New' })).toBeInTheDocument()
    expect(screen.getByText('Draft')).toBeInTheDocument()
    expect(screen.getByText('Created')).toBeInTheDocument()
    expect(screen.queryByText('Job Log')).not.toBeInTheDocument()
  })

  it('calls create new handler', () => {
    const onCreateNew = vi.fn()
    render(<PriceEstimationListView estimates={estimates} loading={false} onCreateNew={onCreateNew} onDuplicateEstimate={vi.fn()} onEditDraft={vi.fn()} onExportCsv={vi.fn()} />)

    fireEvent.click(screen.getByRole('button', { name: 'Create New' }))

    expect(onCreateNew).toHaveBeenCalledOnce()
  })

  it('edits draft estimates and duplicates created estimates', () => {
    const onEditDraft = vi.fn()
    const onDuplicateEstimate = vi.fn()
    render(<PriceEstimationListView estimates={estimates} loading={false} onCreateNew={vi.fn()} onDuplicateEstimate={onDuplicateEstimate} onEditDraft={onEditDraft} onExportCsv={vi.fn()} />)

    fireEvent.click(screen.getByRole('button', { name: /Edit Draft/i }))
    expect(onEditDraft).toHaveBeenCalledWith(estimates[0])

    fireEvent.click(screen.getByRole('button', { name: /Duplicate/i }))
    expect(onDuplicateEstimate).toHaveBeenCalledWith(estimates[1])
  })
})
