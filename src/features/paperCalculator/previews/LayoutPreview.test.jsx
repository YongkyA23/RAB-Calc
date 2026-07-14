import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { calculateLayout } from '../domain/layoutCalculator'
import { LayoutPreview } from './LayoutPreview'

const capacityTenInput = {
  paperWidth: '20', paperHeight: '10', designWidth: '4', designHeight: '5', gap: '0', requiredQty: '125',
  allowRotate: true, pricePerRim: '', sheetsPerRim: '500', wastePercent: '5',
}

describe('LayoutPreview', () => {
  it('renders a quantity-free capacity template without navigation', () => {
    const result = calculateLayout({ ...capacityTenInput, requiredQty: '' })
    render(<LayoutPreview result={result} />)

    expect(screen.getByRole('img', { name: /Template kapasitas 10 slot/ })).toBeInTheDocument()
    expect(screen.getByText('Kapasitas maksimum')).toBeInTheDocument()
    expect(screen.queryByRole('navigation', { name: 'Navigasi preview lembar' })).not.toBeInTheDocument()
  })

  it('navigates from full sheets to a partially filled final sheet', () => {
    const result = calculateLayout(capacityTenInput)
    const { container } = render(<LayoutPreview result={result} />)
    const firstButton = screen.getByRole('button', { name: 'Ke lembar pertama' })
    const previousButton = screen.getByRole('button', { name: 'Ke lembar sebelumnya' })
    const nextButton = screen.getByRole('button', { name: 'Ke lembar berikutnya' })
    const lastButton = screen.getByRole('button', { name: 'Ke lembar terakhir' })

    expect(screen.getByText('12')).toBeInTheDocument()
    expect(screen.getByText('lembar penuh × 10 pcs')).toBeInTheDocument()
    expect(screen.getByText('lembar sisa × 5 pcs')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: /Lembar 1 dari 13, 10 dari 10 slot terisi/ })).toBeInTheDocument()
    expect(container.querySelectorAll('[data-slot-state="filled"]')).toHaveLength(10)
    expect(firstButton).toBeDisabled()
    expect(previousButton).toBeDisabled()

    fireEvent.click(lastButton)

    expect(screen.getByRole('img', { name: /Lembar 13 dari 13, 5 dari 10 slot terisi/ })).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveAccessibleName('Lembar 13 dari 13, 5 pcs')
    expect(container.querySelectorAll('[data-slot-state="available"]')).toHaveLength(10)
    expect(container.querySelectorAll('[data-slot-state="filled"]')).toHaveLength(5)
    expect(nextButton).toBeDisabled()
    expect(lastButton).toBeDisabled()

    fireEvent.click(previousButton)
    expect(screen.getByRole('img', { name: /Lembar 12 dari 13, 10 dari 10 slot terisi/ })).toBeInTheDocument()
  })

  it('resets the derived active sheet when calculation inputs change', () => {
    const initialResult = calculateLayout(capacityTenInput)
    const { rerender } = render(<LayoutPreview result={initialResult} />)
    fireEvent.click(screen.getByRole('button', { name: 'Ke lembar terakhir' }))
    expect(screen.getByText('Lembar 13 dari 13')).toBeInTheDocument()

    const nextResult = calculateLayout({ ...capacityTenInput, requiredQty: '15' })
    rerender(<LayoutPreview result={nextResult} />)

    expect(screen.getByText('Lembar 1 dari 2')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: /Lembar 1 dari 2, 10 dari 10 slot terisi/ })).toBeInTheDocument()
  })

  it('keeps the SVG bounded when capacity exceeds the placement limit', () => {
    const result = calculateLayout({ ...capacityTenInput, paperWidth: '100', paperHeight: '100', designWidth: '1', designHeight: '1', requiredQty: '' })
    render(<LayoutPreview result={result} />)

    expect(screen.getByText('Visual dibatasi 500 dari 10000 slot untuk menjaga performa.')).toBeInTheDocument()
  })
})
