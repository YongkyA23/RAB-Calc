import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ToastProvider } from '../../components/ui/Toast'
import { VendorEstimateContainer } from './VendorEstimateContainer'

vi.mock('../../firebase/firestoreHelpers', () => ({
  deleteVendorEstimate: vi.fn(),
  getVendorEstimate: vi.fn(),
  listVendorEstimates: vi.fn(),
  saveVendorEstimate: vi.fn(),
}))

vi.mock('../../lib/cloudinary', () => ({
  isCloudinaryConfigured: () => true,
  uploadToCloudinary: vi.fn(),
}))

const {
  listVendorEstimates,
  saveVendorEstimate,
} = await import('../../firebase/firestoreHelpers')
const { uploadToCloudinary } = await import('../../lib/cloudinary')

const estimate = {
  id: 've-1',
  projectTitle: 'Project A',
  vendorName: 'Vendor A',
  aeName: 'Ayu',
  jobNo: 'JOB-001',
  quantity: 2,
  unitPrice: 1000,
  price: 2000,
  attachmentUrl: 'https://res.cloudinary.com/demo/raw/upload/a.pdf',
  attachmentName: 'a.pdf',
  attachmentType: 'pdf',
  updatedAt: '2026-06-22T10:00:00.000Z',
}

function renderRoute(path) {
  return render(
    <ToastProvider>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route element={<VendorEstimateContainer profile={{ uid: 'u1', name: 'Admin', email: 'admin@example.com' }} />} path="/vendor-estimates/:vendorEstimateId/edit" />
          <Route element={<VendorEstimateContainer profile={{ uid: 'u1', name: 'Admin', email: 'admin@example.com' }} />} path="/vendor-estimates/new" />
        </Routes>
      </MemoryRouter>
    </ToastProvider>,
  )
}

describe('VendorEstimateContainer', () => {
  beforeEach(() => {
    listVendorEstimates.mockResolvedValue([estimate])
    saveVendorEstimate.mockResolvedValue({ id: 've-1' })
    uploadToCloudinary.mockResolvedValue({
      url: 'https://res.cloudinary.com/dpwucfzks/raw/upload/v1/vendor-estimates/x.pdf',
      fileName: 'quote.pdf',
      kind: 'pdf',
    })
  })

  it('loads edit form values on route refresh', async () => {
    renderRoute('/vendor-estimates/ve-1/edit')

    await waitFor(() => expect(screen.getByLabelText('Nama Job')).toHaveValue('Project A'))
    expect(screen.getByLabelText('Nama vendor')).toHaveValue('Vendor A')
    expect(screen.getByLabelText('Nama AE')).toHaveValue('Ayu')
    expect(screen.getByLabelText('No Job')).toHaveValue('JOB-001')
    expect(screen.getByLabelText('Kuantiti')).toHaveValue(2)
    expect(screen.getByLabelText('Harga satuan')).toHaveValue(1000)
    expect(screen.getByLabelText('Total harga')).toHaveValue('Rp 2.000')
  })

  it('submits create form after uploading an attachment', async () => {
    const { container } = renderRoute('/vendor-estimates/new')

    await waitFor(() => expect(screen.getByLabelText('Nama Job')).toBeInTheDocument())

    fireEvent.change(screen.getByLabelText('Nama Job'), { target: { value: 'Project X' } })
    fireEvent.change(screen.getByLabelText('Nama vendor'), { target: { value: 'Vendor X' } })
    fireEvent.change(screen.getByLabelText('Nama AE'), { target: { value: 'Ayu' } })
    fireEvent.change(screen.getByLabelText('No Job'), { target: { value: 'JOB-X' } })
    fireEvent.change(screen.getByLabelText('Kuantiti'), { target: { value: '3' } })
    fireEvent.change(screen.getByLabelText('Harga satuan'), { target: { value: '2000' } })

    const file = new File(['pdf'], 'quote.pdf', { type: 'application/pdf' })
    const fileInput = container.querySelector('#vendor-attachment-upload')
    fireEvent.change(fileInput, { target: { files: [file] } })

    await waitFor(() => expect(uploadToCloudinary).toHaveBeenCalled())

    fireEvent.click(screen.getByRole('button', { name: 'Simpan Estimasi Vendor' }))

    await waitFor(() => expect(saveVendorEstimate).toHaveBeenCalledWith(expect.objectContaining({
      jobNo: 'JOB-X',
      aeName: 'Ayu',
      quantity: 3,
      unitPrice: 2000,
      price: 6000,
    })))
  })
})
