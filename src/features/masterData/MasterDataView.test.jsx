import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { MasterDataView } from './MasterDataView'

const categories = [
  { id: 'print-materials', name: 'Print Materials', layer: 'print' },
  { id: 'digital-finishing', name: 'Digital Finishing', layer: 'digital' },
]

const priceItems = [
  {
    id: 'print-duplex',
    categoryId: 'print-materials',
    categoryLayer: 'print',
    name: 'Duplex 270–350 gsm',
    prices: { A3: 30000, B2: 40000 },
    turnaroundDays: 1,
    active: true,
  },
]

const auditEntries = [
  { id: 'audit-1', action: 'update', itemId: 'print-duplex', changedFields: ['name'], editedBy: 'admin@example.com' },
]

describe('MasterDataView', () => {
  it('renders seed button categories items and audit entries', () => {
    render(
      <MasterDataView
        auditEntries={auditEntries}
        categories={categories}
        loading={false}
        onDeactivateItem={vi.fn()}
        onSaveItem={vi.fn()}
        onSeedDefaults={vi.fn()}
        priceItems={priceItems}
      />,
    )

    expect(screen.getByRole('button', { name: 'Seed default catalog' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Print Materials' })).toBeInTheDocument()
    expect(screen.getByText('Duplex 270–350 gsm')).toBeInTheDocument()
    expect(screen.getByText('update print-duplex: name by admin@example.com')).toBeInTheDocument()
  })

  it('calls seed defaults handler', () => {
    const onSeedDefaults = vi.fn()
    render(
      <MasterDataView
        auditEntries={[]}
        categories={categories}
        loading={false}
        onDeactivateItem={vi.fn()}
        onSaveItem={vi.fn()}
        onSeedDefaults={onSeedDefaults}
        priceItems={[]}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Seed default catalog' }))
    expect(onSeedDefaults).toHaveBeenCalledOnce()
  })

  it('saves edited price item name and B2 price', () => {
    const onSaveItem = vi.fn()
    render(
      <MasterDataView
        auditEntries={[]}
        categories={categories}
        loading={false}
        onDeactivateItem={vi.fn()}
        onSaveItem={onSaveItem}
        onSeedDefaults={vi.fn()}
        priceItems={priceItems}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Edit Duplex 270–350 gsm' }))
    fireEvent.change(screen.getByLabelText('Item name'), { target: { value: 'Duplex Updated' } })
    fireEvent.change(screen.getByLabelText('B2 price'), { target: { value: '45000' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save item' }))

    expect(onSaveItem).toHaveBeenCalledWith(expect.objectContaining({ name: 'Duplex Updated', prices: expect.objectContaining({ B2: 45000 }) }))
  })

  it('shows manual finishing fields instead of print size prices', () => {
    const onSaveItem = vi.fn()
    render(
      <MasterDataView
        auditEntries={[]}
        categories={[...categories, { id: 'manual-finishing', name: 'Manual Finishing', layer: 'manual' }]}
        loading={false}
        onDeactivateItem={vi.fn()}
        onSaveItem={onSaveItem}
        onSeedDefaults={vi.fn()}
        priceItems={[]}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Manual Finishing' }))

    expect(screen.queryByLabelText('A3 price')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('B2 price')).not.toBeInTheDocument()
    expect(screen.getByLabelText('Labor rate')).toBeInTheDocument()
    expect(screen.getByLabelText('Minimum charge')).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('Item name'), { target: { value: 'UV Varnish Matte' } })
    fireEvent.change(screen.getByLabelText('Labor rate'), { target: { value: '0.75' } })
    fireEvent.change(screen.getByLabelText('Minimum charge'), { target: { value: '0' } })
    fireEvent.click(screen.getByRole('button', { name: 'Add item' }))

    expect(onSaveItem).toHaveBeenCalledWith(expect.objectContaining({
      categoryLayer: 'manual',
      laborRate: 0.75,
      minimumCharge: 0,
      name: 'UV Varnish Matte',
    }))
  })

  it('deactivates an item', () => {
    const onDeactivateItem = vi.fn()
    render(
      <MasterDataView
        auditEntries={[]}
        categories={categories}
        loading={false}
        onDeactivateItem={onDeactivateItem}
        onSaveItem={vi.fn()}
        onSeedDefaults={vi.fn()}
        priceItems={priceItems}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Deactivate Duplex 270–350 gsm' }))
    expect(onDeactivateItem).toHaveBeenCalledWith(priceItems[0])
  })

  it('shows skeleton rows in the table while price items load', () => {
    render(
      <MasterDataView
        auditEntries={[]}
        categories={categories}
        loading={true}
        onDeactivateItem={vi.fn()}
        onSaveItem={vi.fn()}
        onSeedDefaults={vi.fn()}
        priceItems={priceItems}
      />,
    )

    expect(screen.getAllByTestId('table-skeleton-row').length).toBeGreaterThan(0)
    expect(screen.queryByText('Duplex 270–350 gsm')).not.toBeInTheDocument()
  })
})
