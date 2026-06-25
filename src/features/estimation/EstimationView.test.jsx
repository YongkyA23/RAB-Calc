import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { EstimationView } from './EstimationView'

const priceItems = [
  { id: 'print-duplex', categoryLayer: 'print', name: 'Duplex', prices: { A3: 30000, B2: 40000 }, turnaroundDays: 1 },
  { id: 'digital-lam', categoryLayer: 'digital', name: 'Laminating', prices: { A3: 10000, B2: 15000 }, turnaroundDays: 1 },
  { id: 'manual-die', categoryLayer: 'manual', name: 'Die Cut Manual', toolingRate: 3500, laborRate: 15, minimumType: 'numeric', minimumCharge: 250000, turnaroundDays: 3 },
  { id: 'manpower-default', categoryLayer: 'manpower', name: 'Default Manpower', dailyRate: 275000, turnaroundDays: 0 },
  { id: 'additional-paper', categoryLayer: 'additional', name: 'Paper Purchase', additionalMode: 'rate', rate: 5000, unitLabel: 'sheet', turnaroundDays: 0 },
  { id: 'additional-metalize', categoryLayer: 'additional', name: 'Metalize Material', additionalMode: 'area', rate: 5, unitLabel: 'cm²', turnaroundDays: 0 },
]

describe('EstimationView', () => {
  it('renders quote form and live totals', () => {
    render(<EstimationView loading={false} onCancel={vi.fn()} onCreateEstimate={vi.fn()} onSaveDraft={vi.fn()} priceItems={priceItems} />)

    expect(screen.getByLabelText('No Job')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Tambah baris print' })).toBeInTheDocument()
    expect(screen.getByText('Total Keseluruhan')).toBeInTheDocument()
  })

  it('adds a print line and recalculates total', () => {
    render(<EstimationView loading={false} onCancel={vi.fn()} onCreateEstimate={vi.fn()} onSaveDraft={vi.fn()} priceItems={priceItems} />)

    fireEvent.click(screen.getByRole('button', { name: 'Tambah baris print' }))
    fireEvent.change(screen.getByLabelText('Material'), { target: { value: 'print-duplex' } })
    fireEvent.change(screen.getByLabelText('Ukuran'), { target: { value: 'B2' } })
    fireEvent.change(screen.getByLabelText('Jumlah'), { target: { value: '110' } })

    expect(screen.getAllByText('Rp 4.400.000')).toHaveLength(2)
    expect(screen.getByText('Rp 40.000 × 110 = Rp 4.400.000')).toBeInTheDocument()
  })

  it('defaults paper purchase amount to 5000', () => {
    render(<EstimationView loading={false} onCancel={vi.fn()} onCreateEstimate={vi.fn()} onSaveDraft={vi.fn()} priceItems={priceItems} />)

    fireEvent.click(screen.getByRole('button', { name: 'Tambah baris tambahan' }))

    expect(screen.getByLabelText('Nominal')).toHaveValue('5000')
    expect(screen.getByText('Rp 5.000 × 1 = Rp 5.000')).toBeInTheDocument()
  })

  it('shows metalize length width fields and calculates area price', () => {
    render(<EstimationView loading={false} onCancel={vi.fn()} onCreateEstimate={vi.fn()} onSaveDraft={vi.fn()} priceItems={priceItems} />)

    fireEvent.click(screen.getByRole('button', { name: 'Tambah baris tambahan' }))
    fireEvent.change(screen.getByLabelText('Jenis biaya'), { target: { value: 'additional-metalize' } })
    fireEvent.change(screen.getByLabelText('Panjang (cm)'), { target: { value: '10' } })
    fireEvent.change(screen.getByLabelText('Lebar (cm)'), { target: { value: '20' } })
    fireEvent.change(screen.getByLabelText('Jumlah'), { target: { value: '2' } })

    expect(screen.getByLabelText('Catatan')).toBeInTheDocument()
    expect(screen.getByText('10 × 20 × 2 × Rp 5 = Rp 2.000')).toBeInTheDocument()
  })

  it('blocks create when required fields are missing', () => {
    render(<EstimationView loading={false} onCancel={vi.fn()} onCreateEstimate={vi.fn()} onSaveDraft={vi.fn()} priceItems={priceItems} />)

    fireEvent.click(screen.getByRole('button', { name: 'Buat Estimasi' }))

    expect(screen.getByText('No Job is required')).toBeInTheDocument()
  })

  it('creates completed estimate', () => {
    const onCreateEstimate = vi.fn()
    render(<EstimationView loading={false} onCancel={vi.fn()} onCreateEstimate={onCreateEstimate} onSaveDraft={vi.fn()} priceItems={priceItems} />)

    fireEvent.change(screen.getByLabelText('No Job'), { target: { value: 'JOB-001' } })
    fireEvent.change(screen.getByLabelText('SKU'), { target: { value: 'SKU-1' } })
    fireEvent.change(screen.getByLabelText('Klien'), { target: { value: 'PT Client' } })
    fireEvent.change(screen.getByLabelText('Proyek'), { target: { value: 'Mockup' } })
    fireEvent.click(screen.getByRole('button', { name: 'Tambah baris print' }))
    fireEvent.change(screen.getByLabelText('Material'), { target: { value: 'print-duplex' } })
    fireEvent.change(screen.getByLabelText('Jumlah'), { target: { value: '2' } })
    fireEvent.click(screen.getByRole('button', { name: 'Buat Estimasi' }))

    expect(onCreateEstimate).toHaveBeenCalledOnce()
    const estimate = onCreateEstimate.mock.calls[0][0]
    expect(estimate.grandTotal).toBe(60000)
    expect(estimate.status).toBe('created')
  })
})
