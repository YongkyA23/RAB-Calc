import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { calculateLayout } from '../domain/layoutCalculator'
import { LayoutPreview } from './LayoutPreview'

describe('LayoutPreview', () => {
  it('renders an accessible SVG from domain placements', () => {
    const result = calculateLayout({ paperWidth: '48', paperHeight: '32', designWidth: '9', designHeight: '5.5', gap: '0', requiredQty: '', allowRotate: true, pricePerRim: '', sheetsPerRim: '500', wastePercent: '0' })
    render(<LayoutPreview result={result} />)
    expect(screen.getByRole('img', { name: /Susunan 25 desain/ })).toBeInTheDocument()
  })
})

