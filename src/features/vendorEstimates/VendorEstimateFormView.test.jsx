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
          draft={{ projectTitle: '', projectInfo: '', vendorName: '', price: '', attachmentUrl: '', attachmentName: '', attachmentType: '' }}
          errors={[]}
          loading={false}
          onCancel={onCancel}
          onChange={onChange}
          onSubmit={onSubmit}
          title="Create Vendor Estimate"
        />
      </ToastProvider>,
    )

    fireEvent.change(screen.getByLabelText('Judul proyek'), { target: { value: 'Project A' } })
    expect(onChange).toHaveBeenCalledWith('projectTitle', 'Project A')

    fireEvent.click(screen.getByRole('button', { name: 'Simpan Estimasi Vendor' }))
    expect(onSubmit).toHaveBeenCalled()

    fireEvent.click(screen.getByRole('button', { name: 'Batal' }))
    expect(onCancel).toHaveBeenCalled()
  })
})
