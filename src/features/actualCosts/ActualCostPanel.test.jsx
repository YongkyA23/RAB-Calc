import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ActualCostPanel } from './ActualCostPanel'

const estimate = {
  id: 'e1', jobNo: 'JOB-1', sku: 'SKU-1', client: 'Client', project: 'Box', grandTotal: 300000,
  lineItems: [{ id: 'l1', layer: 'print', inputs: { qty: 10 }, priceSnapshot: { name: 'Art Carton' }, computedTotal: 300000 }],
}

function renderPanel(overrides = {}) {
  return render(<ActualCostPanel editedBy={{ uid: 'u1', name: 'Admin' }} estimate={estimate} loading={false} onSave={vi.fn()} {...overrides} />)
}

describe('ActualCostPanel', () => {
  it('saves actual cost and calculated variance as a draft', async () => {
    const onSave = vi.fn()
    renderPanel({ onSave })

    fireEvent.change(screen.getByLabelText('Total aktual Art Carton'), { target: { value: '275000' } })
    expect(screen.getAllByText('-Rp 25.000')).toHaveLength(2)
    fireEvent.click(screen.getByRole('button', { name: 'Simpan draft aktual' }))

    await waitFor(() => expect(onSave).toHaveBeenCalledWith(expect.objectContaining({
      actualTotal: 275000,
      baselineTotal: 300000,
      status: 'draft',
      variance: -25000,
    })))
  })

  it('requires all planned lines before finalization', () => {
    renderPanel()
    fireEvent.click(screen.getByRole('button', { name: 'Finalisasi aktual' }))
    fireEvent.click(screen.getByRole('button', { name: 'Ya, finalisasi' }))
    expect(screen.getByText('Art Carton belum diaktualisasi')).toBeInTheDocument()
  })

  it('adds an unplanned cost to the final actual total', async () => {
    const onSave = vi.fn()
    renderPanel({ onSave })
    fireEvent.change(screen.getByLabelText('Total aktual Art Carton'), { target: { value: '275000' } })
    fireEvent.click(screen.getByRole('button', { name: 'Tambah biaya' }))
    fireEvent.change(screen.getByLabelText('Nama biaya tambahan 1'), { target: { value: 'Delivery' } })
    fireEvent.change(screen.getByLabelText('Total biaya tambahan 1'), { target: { value: '50000' } })
    fireEvent.click(screen.getByRole('button', { name: 'Finalisasi aktual' }))
    fireEvent.click(screen.getByRole('button', { name: 'Ya, finalisasi' }))

    await waitFor(() => expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ actualTotal: 325000, status: 'finalized' })))
  })
})
