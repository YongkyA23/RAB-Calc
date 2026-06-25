import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { VendorEstimateDetailView } from './VendorEstimateDetailView'

describe('VendorEstimateDetailView', () => {
  it('renders details and action callbacks', () => {
    const onBack = vi.fn()
    const onDelete = vi.fn()
    const onEdit = vi.fn()

    const estimate = {
      id: 've-1',
      projectTitle: 'Project A',
      projectInfo: 'Info A',
      vendorName: 'Vendor A',
      price: 1000,
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
    expect(screen.getByText('a.pdf')).toBeInTheDocument()

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
      projectInfo: 'Info B',
      vendorName: 'Vendor B',
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
})
