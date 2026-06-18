import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { EstimationView } from './EstimationView'

const priceItems = [
  { id: 'print-duplex', categoryLayer: 'print', name: 'Duplex', prices: { A3: 30000, B2: 40000 }, turnaroundDays: 1 },
  { id: 'digital-lam', categoryLayer: 'digital', name: 'Laminating', prices: { A3: 10000, B2: 15000 }, turnaroundDays: 1 },
  { id: 'manual-die', categoryLayer: 'manual', name: 'Die Cut Manual', toolingRate: 3500, laborRate: 15, minimumType: 'numeric', minimumCharge: 250000, turnaroundDays: 3 },
  { id: 'manpower-default', categoryLayer: 'manpower', name: 'Default Manpower', dailyRate: 275000, turnaroundDays: 0 },
  { id: 'additional-paper', categoryLayer: 'additional', name: 'Paper Purchase', additionalMode: 'rate', rate: 5000, unitLabel: 'sheet', turnaroundDays: 0 },
]

describe('EstimationView', () => {
  it('renders quote form and live totals', () => {
    render(<EstimationView loading={false} onCancel={vi.fn()} onCreateEstimate={vi.fn()} onSaveDraft={vi.fn()} priceItems={priceItems} />)

    expect(screen.getByLabelText('No Job')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Add print line' })).toBeInTheDocument()
    expect(screen.getByText('Grand Total')).toBeInTheDocument()
  })

  it('adds a print line and recalculates total', () => {
    render(<EstimationView loading={false} onCancel={vi.fn()} onCreateEstimate={vi.fn()} onSaveDraft={vi.fn()} priceItems={priceItems} />)

    fireEvent.click(screen.getByRole('button', { name: 'Add print line' }))
    fireEvent.change(screen.getByLabelText('Material'), { target: { value: 'print-duplex' } })
    fireEvent.change(screen.getByLabelText('Size'), { target: { value: 'B2' } })
    fireEvent.change(screen.getByLabelText('Quantity'), { target: { value: '110' } })

    expect(screen.getAllByText('Rp 4.400.000')).toHaveLength(2)
  })

  it('blocks create when required fields are missing', () => {
    render(<EstimationView loading={false} onCancel={vi.fn()} onCreateEstimate={vi.fn()} onSaveDraft={vi.fn()} priceItems={priceItems} />)

    fireEvent.click(screen.getByRole('button', { name: 'Create Estimate' }))

    expect(screen.getByText('No Job is required')).toBeInTheDocument()
  })

  it('creates completed estimate', () => {
    const onCreateEstimate = vi.fn()
    render(<EstimationView loading={false} onCancel={vi.fn()} onCreateEstimate={onCreateEstimate} onSaveDraft={vi.fn()} priceItems={priceItems} />)

    fireEvent.change(screen.getByLabelText('No Job'), { target: { value: 'JOB-001' } })
    fireEvent.change(screen.getByLabelText('SKU'), { target: { value: 'SKU-1' } })
    fireEvent.change(screen.getByLabelText('Nama Klien'), { target: { value: 'PT Client' } })
    fireEvent.change(screen.getByLabelText('Judul Project'), { target: { value: 'Mockup' } })
    fireEvent.click(screen.getByRole('button', { name: 'Add print line' }))
    fireEvent.change(screen.getByLabelText('Material'), { target: { value: 'print-duplex' } })
    fireEvent.change(screen.getByLabelText('Quantity'), { target: { value: '2' } })
    fireEvent.click(screen.getByRole('button', { name: 'Create Estimate' }))

    expect(onCreateEstimate).toHaveBeenCalledOnce()
    const estimate = onCreateEstimate.mock.calls[0][0]
    expect(estimate.grandTotal).toBe(60000)
    expect(estimate.status).toBe('created')
  })
})
