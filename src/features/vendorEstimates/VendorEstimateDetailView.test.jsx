import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { VendorEstimateDetailView } from './VendorEstimateDetailView'

describe('VendorEstimateDetailView', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('renders details, PDF preview, and action callbacks', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('CORS blocked')))
    const onBack = vi.fn()
    const onDelete = vi.fn()
    const onEdit = vi.fn()

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

    render(
      <VendorEstimateDetailView
        estimate={estimate}
        loading={false}
        onBack={onBack}
        onDelete={onDelete}
        onEdit={onEdit}
      />,
    )

    expect(screen.getByRole('heading', { name: 'Project A' })).toBeInTheDocument()
    expect(screen.getByText('Vendor A')).toBeInTheDocument()
    expect(screen.getByText('Ayu')).toBeInTheDocument()
    expect(screen.getByText('JOB-001')).toBeInTheDocument()
    expect(screen.getByText('Rp 1.000')).toBeInTheDocument()
    expect(screen.getByText('Rp 2.000')).toBeInTheDocument()
    expect(screen.queryByText('Info proyek')).not.toBeInTheDocument()
    expect(screen.getAllByText('a.pdf')).toHaveLength(2)
    expect(screen.getByText('Preview PDF')).toBeInTheDocument()
    expect(await screen.findByTitle('Preview PDF a.pdf')).toHaveAttribute('src', expect.stringContaining(estimate.attachmentUrl))

    fireEvent.click(screen.getByRole('button', { name: 'Edit estimasi vendor' }))
    expect(onEdit).toHaveBeenCalledWith(estimate)

    fireEvent.click(screen.getByRole('button', { name: 'Hapus estimasi vendor' }))
    fireEvent.click(screen.getByRole('button', { name: 'Konfirmasi penghapusan' }))
    expect(onDelete).toHaveBeenCalledWith(estimate)

    fireEvent.click(screen.getByRole('button', { name: /Kembali ke estimasi vendor/ }))
    expect(onBack).toHaveBeenCalled()

  })

  it('renders an image attachment inline', () => {
    const estimate = {
      id: 've-2',
      projectTitle: 'Project B',
      vendorName: 'Vendor B',
      aeName: 'Ayu',
      jobNo: 'JOB-002',
      quantity: 1,
      unitPrice: 2000,
      price: 2000,
      attachmentUrl: 'https://res.cloudinary.com/demo/image/upload/b.png',
      attachmentName: 'b.png',
      attachmentType: 'image',
      updatedAt: '2026-06-22T10:00:00.000Z',
    }

    render(
      <VendorEstimateDetailView estimate={estimate} loading={false} onBack={vi.fn()} onDelete={vi.fn()} onEdit={vi.fn()} />,
    )

    expect(screen.getByRole('img', { name: 'b.png' })).toHaveAttribute('src', estimate.attachmentUrl)
  })

  it('loads a PDF as a browser-safe Blob preview and releases it on unmount', async () => {
    const createObjectUrlDescriptor = Object.getOwnPropertyDescriptor(URL, 'createObjectURL')
    const revokeObjectUrlDescriptor = Object.getOwnPropertyDescriptor(URL, 'revokeObjectURL')
    const createObjectURL = vi.fn(() => 'blob:vendor-pdf-preview')
    const revokeObjectURL = vi.fn()
    Object.defineProperty(URL, 'createObjectURL', { configurable: true, value: createObjectURL })
    Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, value: revokeObjectURL })
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      blob: () => Promise.resolve(new Blob(['pdf'], { type: 'application/pdf' })),
    }))

    const estimate = {
      id: 've-3',
      projectTitle: 'Project PDF',
      vendorName: 'Vendor PDF',
      aeName: 'Ayu',
      price: 1000,
      attachmentUrl: 'https://res.cloudinary.com/demo/raw/upload/quote.pdf',
      attachmentName: 'quote.pdf',
      attachmentType: 'pdf',
    }

    try {
      const { unmount } = render(
        <VendorEstimateDetailView estimate={estimate} loading={false} onBack={vi.fn()} onDelete={vi.fn()} onEdit={vi.fn()} />,
      )

      expect(await screen.findByTitle('Preview PDF quote.pdf')).toHaveAttribute(
        'src',
        expect.stringContaining('blob:vendor-pdf-preview'),
      )
      expect(createObjectURL).toHaveBeenCalledOnce()

      unmount()
      expect(revokeObjectURL).toHaveBeenCalledWith('blob:vendor-pdf-preview')
    } finally {
      if (createObjectUrlDescriptor) Object.defineProperty(URL, 'createObjectURL', createObjectUrlDescriptor)
      else delete URL.createObjectURL
      if (revokeObjectUrlDescriptor) Object.defineProperty(URL, 'revokeObjectURL', revokeObjectUrlDescriptor)
      else delete URL.revokeObjectURL
    }
  })

  it('calls the vendor PDF generation handler', () => {
    const onGeneratePdf = vi.fn()
    const estimate = {
      id: 've-4',
      projectTitle: 'Project Export',
      vendorName: 'Vendor Export',
      aeName: 'Ayu',
      price: 5000,
    }

    render(
      <VendorEstimateDetailView
        estimate={estimate}
        loading={false}
        onBack={vi.fn()}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
        onGeneratePdf={onGeneratePdf}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Buat PDF vendor' }))
    expect(onGeneratePdf).toHaveBeenCalledWith(estimate)
  })
})
