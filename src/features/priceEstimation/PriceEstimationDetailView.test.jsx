import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { PriceEstimationDetailView } from './PriceEstimationDetailView'

const estimate = {
  id: 'e2',
  status: 'created',
  jobNo: 'JOB-002',
  sku: 'SKU-B',
  client: 'PT Beta',
  project: 'Label',
  grandTotal: 253000,
  turnaroundDays: 2,
  lineItems: [
    {
      id: 'l1',
      layer: 'print',
      inputs: { itemId: 'print-art-carton', size: 'A3', qty: 2, notes: 'Sample note' },
      priceSnapshot: { name: 'Art Carton', prices: { A3: 25000 } },
      computedTotal: 50000,
    },
    {
      id: 'l2',
      layer: 'manual',
      inputs: { itemId: 'manual-emboss', p: 10, l: 20, qty: 1, jmlAlat: 1 },
      priceSnapshot: { name: 'Emboss' },
      computedTotal: 250000,
    },
    {
      id: 'l3',
      layer: 'additional',
      inputs: { itemId: 'additional-metalize', lengthCm: 10, widthCm: 20, quantity: 3, notes: 'Foil area' },
      priceSnapshot: { name: 'Metalize Material', additionalMode: 'area', rate: 5 },
      computedTotal: 3000,
    },
  ],
}

describe('PriceEstimationDetailView', () => {
  it('renders estimate details and actions with readable line inputs', () => {
    render(
      <PriceEstimationDetailView
        estimate={estimate}
        loading={false}
        onBack={vi.fn()}
        onDelete={vi.fn()}
        onDuplicate={vi.fn()}
        onEdit={vi.fn()}
      />,
    )

    expect(screen.getAllByText('JOB-002').length).toBeGreaterThan(0)
    expect(screen.getByText('SKU-B')).toBeInTheDocument()
    expect(screen.getByText('PT Beta')).toBeInTheDocument()
    expect(screen.getByText('Label')).toBeInTheDocument()
    expect(screen.getByText('Art Carton')).toBeInTheDocument()
    expect(screen.getByText('Size: A3')).toBeInTheDocument()
    expect(screen.getAllByText('Quantity: 2').length).toBeGreaterThan(0)
    expect(screen.getByText('Notes: Sample note')).toBeInTheDocument()
    expect(screen.getByText('Rp 25.000 × 2 = Rp 50.000')).toBeInTheDocument()
    expect(screen.getAllByText('Length: 10 cm').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Width: 20 cm').length).toBeGreaterThan(0)
    expect(screen.getByText('Tool count: 1')).toBeInTheDocument()
    expect(screen.getByText('10 × 20 × 3 × Rp 5 = Rp 3.000')).toBeInTheDocument()
    expect(screen.queryByText(/itemId:/)).not.toBeInTheDocument()
    expect(screen.queryByText(/jmlAlat:/)).not.toBeInTheDocument()
    expect(screen.queryByText(/p:/)).not.toBeInTheDocument()
    expect(screen.queryByText(/l:/)).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Back to estimates' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Edit estimate' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Duplicate estimate' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Delete estimate' })).toBeInTheDocument()
  })

  it('calls detail action handlers', () => {
    const onBack = vi.fn()
    const onDelete = vi.fn()
    const onDuplicate = vi.fn()
    const onEdit = vi.fn()
    render(
      <PriceEstimationDetailView
        estimate={estimate}
        loading={false}
        onBack={onBack}
        onDelete={onDelete}
        onDuplicate={onDuplicate}
        onEdit={onEdit}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Back to estimates' }))
    fireEvent.click(screen.getByRole('button', { name: 'Edit estimate' }))
    fireEvent.click(screen.getByRole('button', { name: 'Duplicate estimate' }))
    fireEvent.click(screen.getByRole('button', { name: 'Delete estimate' }))
    fireEvent.click(screen.getByRole('button', { name: 'Confirm deletion' }))

    expect(onBack).toHaveBeenCalledOnce()
    expect(onEdit).toHaveBeenCalledWith(estimate)
    expect(onDuplicate).toHaveBeenCalledWith(estimate)
    expect(onDelete).toHaveBeenCalledWith(estimate)
  })
})
