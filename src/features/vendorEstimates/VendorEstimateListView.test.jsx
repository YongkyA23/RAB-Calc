import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { VendorEstimateListView } from './VendorEstimateListView'

describe('VendorEstimateListView', () => {
  it('renders rows and triggers actions', () => {
    const onCreateNew = vi.fn()
    const onDeleteEstimate = vi.fn()
    const onEditEstimate = vi.fn()
    const onViewEstimate = vi.fn()

    const estimates = [
      {
        id: 've-1',
        projectTitle: 'Project A',
        projectInfo: 'Info',
        vendorName: 'Vendor A',
        price: 1000,
        attachmentUrl: 'https://res.cloudinary.com/demo/raw/upload/a.pdf',
        attachmentName: 'a.pdf',
        attachmentType: 'pdf',
        updatedAt: '2026-06-22T10:00:00.000Z',
      },
    ]

    render(
      <MemoryRouter>
        <VendorEstimateListView
          estimates={estimates}
          loading={false}
          onCreateNew={onCreateNew}
          onDeleteEstimate={onDeleteEstimate}
          onEditEstimate={onEditEstimate}
          onViewEstimate={onViewEstimate}
        />
      </MemoryRouter>,
    )

    expect(screen.getByText('Project A')).toBeInTheDocument()
    expect(screen.getByText('Vendor A')).toBeInTheDocument()
    expect(screen.getByText('a.pdf')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('link', { name: /Lihat Project A/ }))
    expect(onViewEstimate).toHaveBeenCalled()

    fireEvent.click(screen.getByRole('link', { name: /Edit Project A/ }))
    expect(onEditEstimate).toHaveBeenCalled()

    fireEvent.click(screen.getByRole('button', { name: /Hapus Project A/ }))
    fireEvent.click(screen.getByRole('button', { name: 'Konfirmasi penghapusan' }))
    expect(onDeleteEstimate).toHaveBeenCalled()
  })
})
