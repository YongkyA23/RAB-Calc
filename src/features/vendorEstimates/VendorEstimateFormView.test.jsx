import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ToastProvider } from '../../components/ui/Toast'
import { VendorEstimateFormView } from './VendorEstimateFormView'

describe('VendorEstimateFormView', () => {
  it('renders fields and fires handlers', () => {
    const onCancel = vi.fn()
    const onChange = vi.fn()
    const onSubmit = vi.fn()

    render(
      <ToastProvider>
        <VendorEstimateFormView
          draft={{ projectTitle: '', vendorName: '', aeName: '', jobNo: '', quantity: '5', unitPrice: '2000', attachmentUrl: '', attachmentName: '', attachmentType: '' }}
          errors={[]}
          loading={false}
          onCancel={onCancel}
          onChange={onChange}
          onSubmit={onSubmit}
          title="Create Vendor Estimate"
        />
      </ToastProvider>,
    )

    fireEvent.change(screen.getByLabelText('Nama Job'), { target: { value: 'Project A' } })
    expect(onChange).toHaveBeenCalledWith('projectTitle', 'Project A')
    expect(screen.getByLabelText('Nama AE')).toBeInTheDocument()

    expect(screen.getByLabelText('Total harga')).toHaveValue('Rp 10.000')
    expect(screen.queryByLabelText('Harga')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Info proyek')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Simpan Estimasi Vendor' }))
    expect(onSubmit).toHaveBeenCalled()

    fireEvent.click(screen.getByRole('button', { name: 'Batal' }))
    expect(onCancel).toHaveBeenCalled()
  })
})
